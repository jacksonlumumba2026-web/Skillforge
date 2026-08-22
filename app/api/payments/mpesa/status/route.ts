import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { finalizeMpesaPayment } from "@/lib/payments";

// Polled by the browser while waiting for the customer to enter their PIN.
// Nudges finalization on each poll in case Safaricom's async callback is
// slow to arrive or never arrives — the same authoritative re-query either
// path ends up calling.
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reference = new URL(request.url).searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("user_id, course_id, status, checkout_request_id")
    .eq("reference", reference)
    .maybeSingle();
  if (!payment || payment.user_id !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (payment.status === "pending" && payment.checkout_request_id) {
    const result = await finalizeMpesaPayment(payment.checkout_request_id);
    if (result.ok) {
      return NextResponse.json({ status: "success", courseId: result.courseId });
    }
    if ("pending" in result) {
      return NextResponse.json({ status: "pending" });
    }
    return NextResponse.json({ status: "failed", error: result.error });
  }

  return NextResponse.json({ status: payment.status, courseId: payment.course_id });
}
