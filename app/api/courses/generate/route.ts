import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateCourseForRequest } from "@/lib/courseGenerator";

// AI generation (a handful of YouTube calls plus a Claude call) comfortably
// exceeds the default serverless timeout.
export const maxDuration = 60;

const requestSchema = z.object({
  topic: z.string().trim().min(3).max(100),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  goal: z.string().trim().max(300).optional().default(""),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to request a course." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a topic (3-100 characters) and pick a level." }, { status: 400 });
  }

  const result = await generateCourseForRequest({
    topic: parsed.data.topic,
    level: parsed.data.level,
    goal: parsed.data.goal,
    requestedBy: user.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ courseId: result.courseId, slug: result.slug, reused: result.reused });
}
