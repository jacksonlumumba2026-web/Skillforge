import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateDiscountCode, recordDiscountRedemption } from "@/lib/discountCodes";

// Real M-Pesa confirmation codes are 10 uppercase letters/digits
// (e.g. "QJI7XXXX9A"). This is just a format sanity check, not proof the
// code is real — see the migration comment for why nothing stronger is
// possible here.
const requestSchema = z.object({
  courseId: z.string().uuid(),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{10}$/, "That doesn't look like a valid M-Pesa confirmation code."),
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

  if (!process.env.MPESA_MANUAL_NUMBER) {
    return NextResponse.json({ error: "This payment option isn't available right now." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
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

  const admin = createAdminClient();
  const reference = `mpesamanual_${course.id.slice(0, 8)}_${Date.now()}`;
  const { data: payment, error: insertError } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      course_id: course.id,
      reference,
      amount,
      status: "success",
      provider: "mpesa_manual",
      mpesa_manual_code: parsed.data.code,
      discount_code_id: discountCodeId,
      original_amount: originalAmount,
    })
    .select("id")
    .single();
  if (insertError || !payment) {
    const message =
      insertError?.code === "23505"
        ? "That confirmation code has already been used for a payment. Each code can only be used once."
        : "Could not record your payment. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await admin
    .from("enrollments")
    .upsert({ user_id: user.id, course_id: course.id, status: "active" }, { onConflict: "user_id,course_id" });
  if (discountCodeId) await recordDiscountRedemption(discountCodeId, user.id, payment.id);

  return NextResponse.json({ ok: true, courseId: course.id });
}
