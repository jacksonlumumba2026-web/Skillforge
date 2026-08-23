import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { validateDiscountCode } from "@/lib/discountCodes";

const requestSchema = z.object({
  courseId: z.string().uuid(),
  code: z.string().trim().min(1).max(50),
});

// Read-only preview so the buyer sees the discounted price before
// submitting a real charge. The initiate routes re-validate independently
// right before charging — this endpoint records nothing.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to use a discount code." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { data: course } = await supabase
    .from("courses")
    .select("price")
    .eq("id", parsed.data.courseId)
    .eq("published", true)
    .maybeSingle();
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const result = await validateDiscountCode(parsed.data.code, user.id, course.price);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    percentOff: result.percentOff,
    discountedPrice: result.discountedPrice,
  });
}
