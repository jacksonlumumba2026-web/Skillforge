import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializeTransaction } from "@/lib/paystack";
import { validateDiscountCode, recordDiscountRedemption } from "@/lib/discountCodes";
import { BUNDLE_PRICE, BUNDLE_COURSE_COUNT } from "@/lib/pricing";

const requestSchema = z.object({
  courseIds: z.array(z.string().uuid()).min(1).max(50),
  discountCode: z.string().trim().max(50).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "You must be logged in to buy a bundle." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // De-duplicate before counting, so posting the same course ten times cannot
  // buy a ten-course bundle containing one course.
  const requestedIds = [...new Set(parsed.data.courseIds)];
  if (requestedIds.length !== BUNDLE_COURSE_COUNT) {
    return NextResponse.json(
      { error: `Choose exactly ${BUNDLE_COURSE_COUNT} Learning Paths.` },
      { status: 400 },
    );
  }

  // Every id must be a real, published course. Checked against the database
  // rather than trusted from the client, so a hidden or draft course cannot be
  // slipped into a bundle.
  const { data: courses } = await supabase
    .from("courses")
    .select("id")
    .in("id", requestedIds)
    .eq("published", true);
  const courseIds = (courses ?? []).map((c) => c.id);
  if (courseIds.length !== BUNDLE_COURSE_COUNT) {
    return NextResponse.json(
      { error: "One or more of those Learning Paths is unavailable. Please review your choices." },
      { status: 400 },
    );
  }

  // Courses the buyer already owns would be paid for twice. Better to say so
  // than to take the money and silently grant nothing new.
  const { data: owned } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", user.id)
    .in("course_id", courseIds)
    .in("status", ["active", "completed"]);
  if (owned && owned.length > 0) {
    return NextResponse.json(
      {
        error: `You already have access to ${owned.length} of those. Swap ${
          owned.length === 1 ? "it" : "them"
        } for something else.`,
        ownedCourseIds: owned.map((e) => e.course_id),
      },
      { status: 400 },
    );
  }

  let amount = BUNDLE_PRICE;
  let discountCodeId: string | null = null;
  let originalAmount: number | null = null;
  if (parsed.data.discountCode) {
    const discount = await validateDiscountCode(parsed.data.discountCode, user.id, BUNDLE_PRICE);
    if (!discount.ok) {
      return NextResponse.json({ error: discount.error }, { status: 400 });
    }
    amount = discount.discountedPrice;
    discountCodeId = discount.discountCodeId;
    originalAmount = BUNDLE_PRICE;
  }

  const reference = `spa_bundle_${Date.now()}`;
  const admin = createAdminClient();

  const { data: payment, error: insertError } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      course_id: null,
      kind: "bundle",
      reference,
      amount,
      status: amount === 0 ? "success" : "pending",
      discount_code_id: discountCodeId,
      original_amount: originalAmount,
    })
    .select("id")
    .single();
  if (insertError || !payment) {
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 500 });
  }

  // Record the chosen set BEFORE redirecting to Paystack. finalizePayment
  // reads this back to work out what to grant, so if it were written after
  // payment a crash in between would leave a paid bundle granting nothing.
  const { error: linkError } = await admin
    .from("payment_bundle_courses")
    .insert(courseIds.map((courseId) => ({ payment_id: payment.id, course_id: courseId })));
  if (linkError) {
    await admin.from("payments").update({ status: "failed", failure_reason: linkError.message }).eq("id", payment.id);
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 500 });
  }

  // A 100%-off code needs no payment gateway — grant the whole bundle now.
  if (amount === 0) {
    await admin
      .from("enrollments")
      .upsert(
        courseIds.map((courseId) => ({ user_id: user.id, course_id: courseId, status: "active" })),
        { onConflict: "user_id,course_id" },
      );
    if (discountCodeId) await recordDiscountRedemption(discountCodeId, user.id, payment.id);
    return NextResponse.json({ free: true });
  }

  try {
    const transaction = await initializeTransaction({
      email: user.email,
      amountKes: amount,
      reference,
      callbackUrl: `${new URL(request.url).origin}/api/payments/callback`,
      metadata: { user_id: user.id, bundle: true, course_count: courseIds.length },
    });
    return NextResponse.json({ authorizationUrl: transaction.data.authorization_url });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[payments/bundle/initiate] Paystack init failed", { reference, reason });
    await admin
      .from("payments")
      .update({ status: "failed", failure_reason: reason })
      .eq("reference", reference);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 500 },
    );
  }
}
