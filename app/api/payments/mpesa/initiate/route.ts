import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initiateStkPush, normalizePhone } from "@/lib/mpesa";

const requestSchema = z.object({
  courseId: z.string().uuid(),
  phone: z.string().min(9),
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

  const reference = `mpesa_${course.id.slice(0, 8)}_${Date.now()}`;
  const admin = createAdminClient();
  const { error: insertError } = await admin.from("payments").insert({
    user_id: user.id,
    course_id: course.id,
    reference,
    amount: course.price,
    status: "pending",
    provider: "mpesa",
    phone,
  });
  if (insertError) {
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 500 });
  }

  try {
    const stk = await initiateStkPush({
      phone,
      amountKes: course.price,
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
