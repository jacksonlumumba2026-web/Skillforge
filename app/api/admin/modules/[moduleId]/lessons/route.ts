import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { getYouTubeVideoId, getVideoDuration } from "@/lib/youtube";

const lessonSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).default(""),
  youtube_url: z.string().trim().url(),
});

export async function POST(request: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = lessonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const videoId = getYouTubeVideoId(parsed.data.youtube_url);
  if (!videoId) {
    return NextResponse.json({ error: "That doesn't look like a valid YouTube URL." }, { status: 400 });
  }
  const durationSeconds = await getVideoDuration(videoId);

  const admin = createAdminClient();
  const { count } = await admin
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId);

  const { data: lesson, error } = await admin
    .from("lessons")
    .insert({
      ...parsed.data,
      module_id: moduleId,
      order_number: (count ?? 0) + 1,
      duration_seconds: durationSeconds,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ id: lesson.id, durationSeconds });
}
