import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  courseId: z.string().uuid(),
  submissionUrl: z.string().trim().url().max(2000),
  note: z.string().trim().max(1000).optional(),
});

// Caller's own RLS-scoped client, not the service role — the insert/update
// policies already enforce "own row" and "must be enrolled", so there's no
// privileged logic this route needs to do on top of that.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const { error } = await supabase.from("capstone_submissions").upsert(
    {
      user_id: user.id,
      course_id: parsed.data.courseId,
      submission_url: parsed.data.submissionUrl,
      note: parsed.data.note ?? null,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id" },
  );
  if (error) {
    const message =
      error.code === "42501"
        ? "You need to be enrolled in this course to submit its project."
        : "Could not save your submission. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
