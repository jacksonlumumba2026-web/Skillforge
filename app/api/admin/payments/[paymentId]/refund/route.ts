import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

// For billing errors (duplicate charge, or payment succeeded without
// granting access) — not general refunds. The public /refund-policy page
// states purchases are final; this exists so admin can correct our own
// mistakes. Bookkeeping only: marks the payment `refunded` and revokes
// access, but does not move any money. The actual correction (Paystack
// dashboard, or an M-Pesa reversal) has to happen separately.
export async function POST(_request: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("user_id, course_id, kind, status")
    .eq("id", paymentId)
    .maybeSingle();
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (payment.status !== "success") {
    return NextResponse.json({ error: "Only a successful payment can be refunded." }, { status: 400 });
  }

  const { error: paymentError } = await admin
    .from("payments")
    .update({ status: "refunded" })
    .eq("id", paymentId);
  if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 400 });

  // Refunding a bundle has to revoke every course it granted, not just one —
  // a bundle payment has no course_id of its own.
  let courseIds: string[] = payment.course_id ? [payment.course_id] : [];
  if (payment.kind === "bundle") {
    const { data: bundleCourses } = await admin
      .from("payment_bundle_courses")
      .select("course_id")
      .eq("payment_id", paymentId);
    courseIds = (bundleCourses ?? []).map((row) => row.course_id);
  }

  if (courseIds.length > 0) {
    await admin
      .from("enrollments")
      .update({ status: "revoked" })
      .eq("user_id", payment.user_id)
      .in("course_id", courseIds);
  }

  return NextResponse.json({ ok: true, revokedCourses: courseIds.length });
}
