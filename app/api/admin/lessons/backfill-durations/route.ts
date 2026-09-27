import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { getYouTubeVideoId, getVideoDurations } from "@/lib/youtube";

/**
 * Fills in lessons.duration_seconds from the YouTube Data API.
 *
 * Runs here rather than as a local script because YOUTUBE_API_KEY is stored
 * on Vercel as a SENSITIVE variable, which is write-only — it cannot be read
 * back through the API by anyone, so nothing outside a deployment can use it.
 * Running it as an admin route means the secret never leaves Vercel, and the
 * owner can re-run it whenever lessons are added rather than needing a
 * developer with a copy of the key.
 *
 * Durations are what let the app show a real data cost per lesson. Without
 * them lib/dataCost.ts returns null and the learner sees general guidance,
 * never an invented figure.
 *
 * Safe to re-run: only rows where duration_seconds is null are touched.
 * Nothing is inserted, deleted or re-parented and no lesson id changes, so
 * lesson_progress is unaffected.
 */

export const maxDuration = 60;

export async function POST() {
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!process.env.YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY is not set on this deployment." },
      { status: 503 },
    );
  }

  const admin = createAdminClient();
  const { data: lessons, error } = await admin
    .from("lessons")
    .select("id, youtube_url")
    .is("duration_seconds", null)
    .not("youtube_url", "is", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!lessons?.length) {
    return NextResponse.json({ scanned: 0, updated: 0, unavailable: [], message: "Nothing to do." });
  }

  // Videos are deliberately reused across lessons here — one long video
  // taught by chapter — so group by video id. That both cuts the number of
  // API calls and makes sure every lesson sharing a video gets the value.
  const lessonsByVideo = new Map<string, string[]>();
  let unparseable = 0;
  for (const lesson of lessons) {
    const videoId = getYouTubeVideoId(lesson.youtube_url);
    if (!videoId) {
      unparseable++;
      continue;
    }
    const existing = lessonsByVideo.get(videoId);
    if (existing) existing.push(lesson.id);
    else lessonsByVideo.set(videoId, [lesson.id]);
  }

  const videoIds = [...lessonsByVideo.keys()];
  const durations = await getVideoDurations(videoIds);

  // Group lesson ids by the duration they need, so each distinct value is a
  // single UPDATE ... IN (...) rather than one round trip per lesson.
  const idsBySeconds = new Map<number, string[]>();
  for (const [videoId, lessonIds] of lessonsByVideo) {
    const seconds = durations.get(videoId);
    if (!seconds) continue;
    const existing = idsBySeconds.get(seconds);
    if (existing) existing.push(...lessonIds);
    else idsBySeconds.set(seconds, [...lessonIds]);
  }

  let updated = 0;
  const failures: string[] = [];
  for (const [seconds, lessonIds] of idsBySeconds) {
    const { error: updateError } = await admin
      .from("lessons")
      .update({ duration_seconds: seconds })
      .in("id", lessonIds);
    if (updateError) failures.push(updateError.message);
    else updated += lessonIds.length;
  }

  // A video absent from the API response is deleted, private or blocked —
  // reported because that lesson's video will not play for learners either.
  const unavailable = videoIds.filter((id) => !durations.has(id));

  return NextResponse.json({
    scanned: lessons.length,
    distinctVideos: videoIds.length,
    updated,
    unparseableUrls: unparseable,
    unavailable,
    failures,
  });
}
