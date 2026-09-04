import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction } from "@/lib/paystack";
import { queryStkPushStatus } from "@/lib/mpesa";
import { recordDiscountRedemption } from "@/lib/discountCodes";

/**
 * Finalizes a Paystack payment by re-verifying it directly with Paystack
 * (never trusting a webhook payload or browser redirect alone), then
 * marking the payment successful and granting access. Idempotent — safe to
 * call from both the webhook and the browser callback for the same
 * reference, whichever arrives first.
 */
export async function finalizePayment(
  reference: string,
): Promise<{ ok: true; courseId: string | null } | { ok: false; error: string }> {
  const admin = createAdminClient();

  const { data: payment } = await admin
    .from("payments")
    .select("id, user_id, course_id, kind, status, discount_code_id")
    .eq("reference", reference)
    .maybeSingle();
  if (!payment) return { ok: false, error: "Unknown payment reference." };
  if (payment.status === "success") return { ok: true, courseId: payment.course_id };

  let verification;
  try {
    verification = await verifyTransaction(reference);
  } catch {
    return { ok: false, error: "Could not verify payment with Paystack." };
  }
  if (verification.data.status !== "success") {
    await admin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return { ok: false, error: "Payment was not successful." };
  }

  // Which courses this payment buys. A single-course payment names one; a
  // bundle's set was fixed at checkout and is read back rather than
  // recomputed, so a catalogue change between paying and finalizing cannot
  // alter what the buyer receives.
  const courseIds = await coursesForPayment(admin, payment.id, payment.course_id, payment.kind);
  if (courseIds.length === 0) {
    // Money took, nothing to grant — refuse to mark this successful, because
    // a `success` row with no enrollment is exactly the state that looks
    // fine in reporting and leaves a paying customer with nothing.
    console.error("[finalizePayment] no courses resolved for payment", {
      reference,
      kind: payment.kind,
    });
    return { ok: false, error: "Could not work out what this payment was for." };
  }

  await admin.from("payments").update({ status: "success" }).eq("reference", reference);
  await admin.from("enrollments").upsert(
    courseIds.map((courseId) => ({ user_id: payment.user_id, course_id: courseId, status: "active" })),
    { onConflict: "user_id,course_id" },
  );
  if (payment.discount_code_id) {
    await recordDiscountRedemption(payment.discount_code_id, payment.user_id, payment.id);
  }

  return { ok: true, courseId: payment.course_id };
}

/**
 * Resolves a payment to the course ids it grants. Shared by the Paystack and
 * M-Pesa finalizers so the two cannot disagree about what a bundle contains.
 */
async function coursesForPayment(
  admin: ReturnType<typeof createAdminClient>,
  paymentId: string,
  courseId: string | null,
  kind: string,
): Promise<string[]> {
  if (kind !== "bundle") return courseId ? [courseId] : [];
  const { data } = await admin
    .from("payment_bundle_courses")
    .select("course_id")
    .eq("payment_id", paymentId);
  return (data ?? []).map((row) => row.course_id);
}

/**
 * Finalizes an M-Pesa payment by re-querying Safaricom directly for the
 * checkout request's real status — same idempotent "never trust the
 * webhook payload alone" shape as finalizePayment() above. This one
 * matters even more for M-Pesa: Daraja's async callback carries no
 * signature, so anyone who guessed a CheckoutRequestID could otherwise
 * fake a success callback.
 */
export async function finalizeMpesaPayment(
  checkoutRequestId: string,
): Promise<
  { ok: true; courseId: string | null } | { ok: false; pending: true } | { ok: false; error: string }
> {
  const admin = createAdminClient();

  const { data: payment } = await admin
    .from("payments")
    .select("id, user_id, course_id, kind, status, discount_code_id")
    .eq("checkout_request_id", checkoutRequestId)
    .maybeSingle();
  if (!payment) return { ok: false, error: "Unknown M-Pesa transaction." };
  if (payment.status === "success") return { ok: true, courseId: payment.course_id };

  let query;
  try {
    query = await queryStkPushStatus(checkoutRequestId);
  } catch {
    return { ok: false, error: "Could not verify payment with M-Pesa." };
  }

  // No ResultCode yet means Safaricom hasn't finished processing this
  // checkout request (the customer is still entering their PIN, or it just
  // hasn't propagated) — not the same as a real failure, so leave the
  // payment row untouched and let the caller poll again shortly.
  if (query.ResultCode === undefined) {
    return { ok: false, pending: true };
  }
  if (String(query.ResultCode) !== "0") {
    await admin.from("payments").update({ status: "failed" }).eq("checkout_request_id", checkoutRequestId);
    return { ok: false, error: query.ResultDesc || "Payment was not successful." };
  }

  const courseIds = await coursesForPayment(admin, payment.id, payment.course_id, payment.kind);
  if (courseIds.length === 0) {
    console.error("[finalizeMpesaPayment] no courses resolved for payment", { checkoutRequestId });
    return { ok: false, error: "Could not work out what this payment was for." };
  }

  await admin.from("payments").update({ status: "success" }).eq("checkout_request_id", checkoutRequestId);
  await admin.from("enrollments").upsert(
    courseIds.map((cid) => ({ user_id: payment.user_id, course_id: cid, status: "active" })),
    { onConflict: "user_id,course_id" },
  );
  if (payment.discount_code_id) {
    await recordDiscountRedemption(payment.discount_code_id, payment.user_id, payment.id);
  }

  return { ok: true, courseId: payment.course_id };
}
