import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction } from "@/lib/paystack";

/**
 * Finalizes a Paystack payment by re-verifying it directly with Paystack
 * (never trusting a webhook payload or browser redirect alone), then
 * marking the payment successful and granting access. Idempotent — safe to
 * call from both the webhook and the browser callback for the same
 * reference, whichever arrives first.
 */
export async function finalizePayment(
  reference: string,
): Promise<{ ok: true; courseId: string } | { ok: false; error: string }> {
  const admin = createAdminClient();

  const { data: payment } = await admin
    .from("payments")
    .select("user_id, course_id, status")
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

  await admin.from("payments").update({ status: "success" }).eq("reference", reference);
  await admin
    .from("enrollments")
    .upsert(
      { user_id: payment.user_id, course_id: payment.course_id, status: "active" },
      { onConflict: "user_id,course_id" },
    );

  return { ok: true, courseId: payment.course_id };
}
