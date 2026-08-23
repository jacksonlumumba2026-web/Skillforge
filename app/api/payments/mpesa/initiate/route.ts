import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initiateStkPush, normalizePhone } from "@/lib/mpesa";
import { validateDiscountCode, recordDiscountRedemption } from "@/lib/discountCodes";

const requestSchema = z.object({
  courseId: z.string().uuid(),
  phone: z.string().min(9),
  discountCode: z.string().trim().max(50).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to buy a course." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid Safaricom number, e.g. 0712345678." },
      { status: 400 },
    );
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, price")
    .eq("id", parsed.data.courseId)
    .eq("published", true)
    .maybeSingle();
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const { data: existingEnrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .in("status", ["active", "completed"])
    .maybeSingle();
  if (existingEnrollment) {
    return NextResponse.json({ error: "You already have access to this course." }, { status: 400 });
  }

  let amount = course.price;
  let discountCodeId: string | null = null;
  let originalAmount: number | null = null;
  if (parsed.data.discountCode) {
    const discount = await validateDiscountCode(parsed.data.discountCode, user.id, course.price);
    if (!discount.ok) {
      return NextResponse.json({ error: discount.error }, { status: 400 });
    }
    amount = discount.discountedPrice;
    discountCodeId = discount.discountCodeId;
    originalAmount = course.price;
  }

  const reference = `mpesa_${course.id.slice(0, 8)}_${Date.now()}`;
  const admin = createAdminClient();

  // A 100%-off code needs no STK push at all — grant access directly.
  if (amount === 0) {
    const { data: freePayment, error: insertError } = await admin
      .from("payments")
      .insert({
        user_id: user.id,
        course_id: course.id,
        reference,
        amount: 0,
        status: "success",
        provider: "mpesa",
        phone,
        discount_code_id: discountCodeId,
        original_amount: originalAmount,
      })
      .select("id")
      .single();
    if (insertError || !freePayment) {
      return NextResponse.json({ error: "Could not grant access. Please try again." }, { status: 500 });
    }
    await admin
      .from("enrollments")
      .upsert({ user_id: user.id, course_id: course.id, status: "active" }, { onConflict: "user_id,course_id" });
    if (discountCodeId) await recordDiscountRedemption(discountCodeId, user.id, freePayment.id);
    return NextResponse.json({ free: true, courseId: course.id });
  }

  const { error: insertError } = await admin.from("payments").insert({
    user_id: user.id,
    course_id: course.id,
    reference,
    amount,
    status: "pending",
    provider: "mpesa",
    phone,
    discount_code_id: discountCodeId,
    original_amount: originalAmount,
  });
  if (insertError) {
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 500 });
  }

  try {
    const stk = await initiateStkPush({
      phone,
      amountKes: amount,
      accountReference: "SkillPath",
      transactionDesc: "Course fee",
      callbackUrl: `${new URL(request.url).origin}/api/payments/mpesa/callback`,
    });
    await admin
      .from("payments")
      .update({ checkout_request_id: stk.CheckoutRequestID })
      .eq("reference", reference);
    return NextResponse.json({ reference });
  } catch {
    await admin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return NextResponse.json(
      { error: "Could not start payment with M-Pesa. Please try again." },
      { status: 500 },
    );
  }
}
