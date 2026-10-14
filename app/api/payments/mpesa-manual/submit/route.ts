import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateDiscountCode, recordDiscountRedemption } from "@/lib/discountCodes";
import { creditReferralOnFirstPurchase } from "@/lib/referrals";

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
  channel: z.enum(["till", "send_money"]),
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const channelConfigured =
    parsed.data.channel === "till" ? Boolean(process.env.MPESA_TILL_NUMBER) : Boolean(process.env.MPESA_MANUAL_NUMBER);
  if (!channelConfigured) {
    return NextResponse.json({ error: "This payment option isn't available right now." }, { status: 400 });
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

  const admin = createAdminClient();

  // One unchecked claim at a time.
  //
  // This route is grant-then-audit by design (see migration 0029): Safaricom
  // offers no API to verify a Send Money payment into a personal number, so
  // access is granted on a code that merely LOOKS valid and an admin
  // confirms it against the real statement later. That is a deliberate
  // trade, but without a limit one person could type ten plausible codes and
  // walk off with ten Learning Paths before anyone looked.
  //
  // Capping unchecked claims at one bounds the loss to a single course while
  // leaving honest buyers alone — they claim one, it gets confirmed, they
  // buy the next. A claim that was rejected and refunded does not count,
  // so a mistyped code is not a life sentence.
  const { count: unverifiedClaims } = await admin
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("provider", "mpesa_manual")
    .is("manual_verified_at", null)
    .neq("status", "refunded");
  if ((unverifiedClaims ?? 0) > 0) {
    return NextResponse.json(
      {
        error:
          "You already have an M-Pesa payment waiting to be checked against our statement. Once it's confirmed you can buy another Learning Path. If it's been a while, contact us and we'll sort it out.",
      },
      { status: 400 },
    );
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
      manual_channel: parsed.data.channel,
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
  // This route is grant-then-audit, so the referral pays out on a claim an
  // admin has not confirmed yet. That is the same trade the enrollment above
  // already makes, and the reward is a 10% code rather than money.
  await creditReferralOnFirstPurchase(user.id);

  return NextResponse.json({ ok: true, courseId: course.id });
}
