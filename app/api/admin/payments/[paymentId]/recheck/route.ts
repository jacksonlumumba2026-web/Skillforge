import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { finalizePayment, finalizeMpesaPayment } from "@/lib/payments";

// Asks the provider what really became of a stuck payment, on demand.
//
// Same job as the reconcile-payments cron, reachable by hand — the cron
// deliberately ignores rows older than a week, and those are exactly the
// ones a learner eventually complains about. Both call the same finalizers,
// which re-verify against Paystack/Safaricom and are idempotent, so this
// cannot grant access to a payment the provider does not confirm. The worst
// a stray click does is tell you what you already knew.
export async function POST(_request: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("id, reference, provider, status, checkout_request_id")
    .eq("id", paymentId)
    .maybeSingle();
  if (!payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }
  if (payment.status === "success") {
    return NextResponse.json({ outcome: "already", message: "Already successful — access is granted." });
  }
  if (payment.status === "refunded") {
    return NextResponse.json({ error: "This payment was refunded. Re-checking it would be misleading." }, { status: 400 });
  }

  if (payment.provider === "paystack") {
    const result = await finalizePayment(payment.reference);
    return result.ok
      ? NextResponse.json({ outcome: "granted", message: "Paystack confirmed the payment. Access granted." })
      : NextResponse.json({ outcome: "failed", message: result.error });
  }

  if (payment.provider === "mpesa") {
    if (!payment.checkout_request_id) {
      // Nothing to ask Safaricom about — the push never got an id, so no
      // amount of re-checking can settle this one. Say so plainly instead
      // of returning a vague failure.
      return NextResponse.json(
        {
          error:
            "This M-Pesa request never got a CheckoutRequestID, so Safaricom has nothing to look up. Check the M-Pesa statement for this number and amount, then grant access manually if the money arrived.",
        },
        { status: 400 },
      );
    }
    const result = await finalizeMpesaPayment(payment.checkout_request_id);
    if (result.ok) {
      return NextResponse.json({ outcome: "granted", message: "M-Pesa confirmed the payment. Access granted." });
    }
    if ("pending" in result) {
      return NextResponse.json({
        outcome: "pending",
        message: "Safaricom hasn't finished processing this one yet. Try again in a minute.",
      });
    }
    return NextResponse.json({ outcome: "failed", message: result.error });
  }

  // mpesa_manual rows are written `success` at submission and never sit
  // pending, so there is no provider call to make for them — "Mark Verified"
  // is the tool for those.
  return NextResponse.json(
    { error: `Nothing to re-check for a ${payment.provider} payment.` },
    { status: 400 },
  );
}
