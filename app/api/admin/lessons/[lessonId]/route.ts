import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { getYouTubeVideoId, getVideoDuration } from "@/lib/youtube";
import type { Lesson } from "@/lib/types";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(2000).optional(),
  youtube_url: z.string().trim().url().optional(),
  order_number: z.number().int().min(1).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const update: Partial<Lesson> = { ...parsed.data };
  if (parsed.data.youtube_url) {
    const videoId = getYouTubeVideoId(parsed.data.youtube_url);
    if (!videoId) {
      return NextResponse.json({ error: "That doesn't look like a valid YouTube URL." }, { status: 400 });
    }
    update.duration_seconds = await getVideoDuration(videoId);
  }

  const admin = createAdminClient();
  const { error } = await admin.from("lessons").update(update).eq("id", lessonId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();

  const { count } = await admin
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("lesson_id", lessonId);
  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Learners have progress on this lesson — edit it instead of deleting." },
      { status: 400 },
    );
  }

  const { error } = await admin.from("lessons").delete().eq("id", lessonId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
