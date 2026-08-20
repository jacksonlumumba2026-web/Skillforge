import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({ lessonId: z.string().uuid() });

// Marks a lesson complete for the logged-in user. Uses the caller's own
// (RLS-respecting) client rather than the service role — the
// lesson_progress_insert_own_enrolled policy already requires the user to
// be enrolled in the lesson's course, so there's nothing extra to check
// here: if the insert succeeds, access was legitimate.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: parsed.data.lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) {
    // Most likely cause: the RLS insert policy rejected it because the
    // user isn't enrolled in this lesson's course.
    return NextResponse.json({ error: "not_enrolled" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
