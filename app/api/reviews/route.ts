import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const reviewSchema = z.object({
  courseId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).default(""),
});

// Uses the caller's own (RLS-respecting) client, not the service role —
// course_reviews_insert_own_enrolled already requires the user to be
// enrolled, so a successful write is proof access was legitimate, same
// pattern as /api/progress/complete-lesson.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("user_id", user.id)
    .maybeSingle();
  const reviewerName = profile?.full_name?.trim() || profile?.email?.split("@")[0] || "SkillPath Africa Learner";

  const { error } = await supabase.from("course_reviews").upsert(
    {
      user_id: user.id,
      course_id: parsed.data.courseId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      reviewer_name: reviewerName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id" },
  );

  if (error) {
    return NextResponse.json(
      { error: "Could not save your review — you may need to be enrolled in this course first." },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true });
}
