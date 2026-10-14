import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { finalizePayment, finalizeMpesaPayment } from "@/lib/payments";

// Rescues payments where the customer's money moved but nothing ever
// finalized the row.
//
// Both providers have the same hole. A payment row is written as `pending`
// BEFORE the customer is asked for money, and only two things ever advance
// it: the provider's async callback, and the browser polling while the
// buyer waits. Close the tab and the polling stops; lose the callback — a
// dropped Daraja push, or a Paystack webhook rejected on signature because
// PAYSTACK_SECRET_KEY was rotated — and the row sits at `pending` forever.
// The buyer has paid, has no access, and nothing retries. That has already
// happened in production.
//
// This asks the provider itself what really became of each stale pending
// payment, via the same finalizers the callback and the browser use. They
// are idempotent and re-verify against the provider rather than trusting
// anything we stored, so running this repeatedly is safe: a payment that
// truly succeeded gets its enrollment, one that truly failed gets marked
// failed, and one still in flight is left alone.
//
// It never invents a success. Access is granted only when Safaricom or
// Paystack confirms the money arrived.

// Long enough that a customer still typing their M-Pesa PIN is not
// prematurely judged — Safaricom gives them about 60 seconds, and the
// browser is still polling throughout.
const GRACE_MINUTES = 3;

// Beyond this, stop re-asking. Keeps an ancient unresolvable row from
// burning a provider API call every hour forever. Anything this old needs
// a human looking at /admin/payments, not another retry.
const MAX_AGE_DAYS = 7;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();
  const staleBefore = new Date(now - GRACE_MINUTES * 60_000).toISOString();
  const oldestConsidered = new Date(now - MAX_AGE_DAYS * 86_400_000).toISOString();

  const { data: stuck, error } = await admin
    .from("payments")
    .select("id, reference, provider, checkout_request_id, created_at")
    .eq("status", "pending")
    .lt("created_at", staleBefore)
    .gt("created_at", oldestConsidered)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("[cron/reconcile-payments] could not read pending payments", {
      message: error.message,
    });
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }

  let recovered = 0;
  let markedFailed = 0;
  let stillPending = 0;
  let unresolvable = 0;
  const recoveredRefs: string[] = [];

  for (const payment of stuck ?? []) {
    try {
      if (payment.provider === "mpesa") {
        if (!payment.checkout_request_id) {
          // The insert landed but the CheckoutRequestID never did, so there
          // is nothing to ask Safaricom about. Surface it rather than
          // silently skipping: if the push did reach the customer, only a
          // human comparing against the M-Pesa statement can settle it.
          unresolvable++;
          console.warn("[cron/reconcile-payments] pending M-Pesa row has no checkout_request_id", {
            reference: payment.reference,
            createdAt: payment.created_at,
          });
          continue;
        }
        const result = await finalizeMpesaPayment(payment.checkout_request_id);
        if (result.ok) {
          recovered++;
          recoveredRefs.push(payment.reference);
        } else if ("pending" in result) {
          stillPending++;
        } else {
          markedFailed++;
        }
        continue;
      }

      if (payment.provider === "paystack") {
        const result = await finalizePayment(payment.reference);
        if (result.ok) {
          recovered++;
          recoveredRefs.push(payment.reference);
        } else {
          // finalizePayment has already written `failed` where Paystack said
          // the transaction was not successful. Where it could not reach
          // Paystack at all it changed nothing, and the next run retries.
          markedFailed++;
        }
        continue;
      }

      // mpesa_manual rows are created `success` and never sit pending, so
      // anything else here is a provider this job does not know how to
      // verify. Log it instead of guessing.
      unresolvable++;
      console.warn("[cron/reconcile-payments] pending payment with unhandled provider", {
        reference: payment.reference,
        provider: payment.provider,
      });
    } catch (err) {
      // One bad row must not abort the sweep — the next row might be the
      // customer who is owed access.
      unresolvable++;
      console.error("[cron/reconcile-payments] row failed", {
        reference: payment.reference,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Recovering a payment means someone paid and we only just granted what
  // they bought. Always worth a log line naming the references.
  if (recovered > 0) {
    console.error("[cron/reconcile-payments] recovered paid-but-unfinalized payments", {
      count: recovered,
      references: recoveredRefs,
    });
  }

  return NextResponse.json({
    examined: (stuck ?? []).length,
    recovered,
    markedFailed,
    stillPending,
    unresolvable,
  });
}
