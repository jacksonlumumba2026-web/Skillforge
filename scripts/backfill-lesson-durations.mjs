#!/usr/bin/env node
/**
 * Fills in lessons.duration_seconds from the YouTube Data API.
 *
 * Nothing in the app fabricates a data-cost figure — an estimate is shown
 * only where the real video length is known. This is what makes it known.
 *
 * Usage:
 *   YOUTUBE_API_KEY=... NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/backfill-lesson-durations.mjs [--dry-run]
 *
 * Safe to re-run: it only touches rows where duration_seconds is null, so a
 * second run after a partial failure picks up exactly what is left. Nothing
 * is inserted, deleted or re-parented, and no lesson id changes, so
 * lesson_progress is untouched.
 */

import { createClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--dry-run");
const API_KEY = process.env.YOUTUBE_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing env. Need YOUTUBE_API_KEY, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

/** Same extraction rules as lib/youtube.ts, including Shorts and /live/. */
const PATH_PREFIXES = ["/embed/", "/shorts/", "/live/", "/v/"];
function videoIdFrom(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    const prefix = PATH_PREFIXES.find((p) => parsed.pathname.startsWith(p));
    if (prefix) {
      return parsed.pathname.slice(prefix.length).split("/").filter(Boolean)[0] ?? null;
    }
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

/** ISO 8601 duration (PT1H2M3S) to seconds. */
function parseIsoDuration(iso) {
  const m = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso ?? "");
  if (!m) return null;
  const [, d, h, min, s] = m.map((v) => (v ? Number(v) : 0));
  return d * 86400 + h * 3600 + min * 60 + s;
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const { data: lessons, error } = await supabase
  .from("lessons")
  .select("id, youtube_url")
  .is("duration_seconds", null)
  .not("youtube_url", "is", null);

if (error) {
  console.error("Could not read lessons:", error.message);
  process.exit(1);
}

console.log(`${lessons.length} lessons without a duration.`);

// Map video id -> the lessons using it. Videos are reused across lessons by
// design (one long video taught by chapter), so this both de-duplicates the
// API calls and makes sure every lesson sharing a video gets the value.
const byVideoId = new Map();
let unparseable = 0;
for (const lesson of lessons) {
  const id = videoIdFrom(lesson.youtube_url);
  if (!id) {
    unparseable++;
    continue;
  }
  if (!byVideoId.has(id)) byVideoId.set(id, []);
  byVideoId.get(id).push(lesson.id);
}

const videoIds = [...byVideoId.keys()];
console.log(
  `${videoIds.length} distinct videos to look up` +
    (unparseable ? `, ${unparseable} lesson URLs could not be parsed` : ""),
);

const durations = new Map();
const missing = [];

// The videos endpoint takes up to 50 ids per call, so 735 lessons is a
// handful of requests rather than hundreds.
for (let i = 0; i < videoIds.length; i += 50) {
  const batch = videoIds.slice(i, i + 50);
  const url =
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails` +
    `&id=${batch.join(",")}&key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`YouTube API returned ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const body = await res.json();

  const returned = new Set();
  for (const item of body.items ?? []) {
    const seconds = parseIsoDuration(item.contentDetails?.duration);
    if (seconds) {
      durations.set(item.id, seconds);
      returned.add(item.id);
    }
  }
  // An id absent from the response is deleted, private or region-blocked —
  // worth reporting, because that lesson's video does not play either.
  for (const id of batch) if (!returned.has(id)) missing.push(id);

  console.log(`  looked up ${Math.min(i + 50, videoIds.length)}/${videoIds.length}`);
}

if (missing.length) {
  console.log(`\n${missing.length} videos returned nothing (deleted, private or blocked):`);
  console.log("  " + missing.join(", "));
}

const updates = [];
for (const [videoId, lessonIds] of byVideoId) {
  const seconds = durations.get(videoId);
  if (!seconds) continue;
  for (const lessonId of lessonIds) updates.push({ lessonId, seconds });
}

console.log(`\n${updates.length} lessons can be updated.`);
if (DRY_RUN) {
  console.log("--dry-run: stopping before writing.");
  process.exit(0);
}

let written = 0;
for (const { lessonId, seconds } of updates) {
  const { error: updateError } = await supabase
    .from("lessons")
    .update({ duration_seconds: seconds })
    .eq("id", lessonId);
  if (updateError) {
    console.error(`  failed on ${lessonId}: ${updateError.message}`);
    continue;
  }
  written++;
  if (written % 50 === 0) console.log(`  wrote ${written}/${updates.length}`);
}

console.log(`\nDone. ${written} lessons now carry a real duration.`);
