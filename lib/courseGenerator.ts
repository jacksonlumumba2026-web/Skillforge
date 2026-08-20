import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { curateVideosForTopic } from "@/lib/youtube";
import { chunkIntoModules, generateCourseContent } from "@/lib/courseContent";
import { slugify } from "@/lib/courses";
import type { CourseLevel } from "@/lib/types";

const PRICE_KES = 500;
const LESSONS_PER_MODULE = 2;
const DAILY_GENERATION_LIMIT = 3;

export type GenerateCourseResult =
  | { ok: true; courseId: string; slug: string; reused: boolean }
  | { ok: false; error: string };

/**
 * Curates YouTube videos for a learner-requested topic, writes AI-generated
 * course/module/lesson copy, and persists the whole course as a normal
 * published, paid course via the service-role client (RLS would otherwise
 * block a student from inserting into courses/modules/lessons directly).
 */
export async function generateCourseForRequest(input: {
  topic: string;
  level: CourseLevel;
  goal: string;
  requestedBy: string;
}): Promise<GenerateCourseResult> {
  const topic = input.topic.trim();
  if (!topic) return { ok: false, error: "Topic is required." };

  const slug = slugify(topic.length > 60 ? `${topic.slice(0, 60)}-${input.level}` : `${topic}-${input.level}`);
  if (!slug) return { ok: false, error: "Couldn't derive a slug from that topic." };

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("courses")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    return { ok: true, courseId: existing.id, slug: existing.slug, reused: true };
  }

  // Cap actual generations (not cache hits above) per learner per day —
  // each one is a real cost (YouTube quota + an Anthropic call), and
  // nothing else here rate-limits repeated requests.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: generatedToday } = await admin
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("generated_by", input.requestedBy)
    .gte("created_at", since);
  if ((generatedToday ?? 0) >= DAILY_GENERATION_LIMIT) {
    return {
      ok: false,
      error: `You've reached today's limit of ${DAILY_GENERATION_LIMIT} new course requests. Try again tomorrow, or check if one of your existing courses already covers this.`,
    };
  }

  const videos = await curateVideosForTopic(topic, input.level);
  if (videos.length === 0) {
    return { ok: false, error: "Couldn't find enough tutorial videos for that topic. Try rephrasing it." };
  }

  const moduleGroups = chunkIntoModules(videos, LESSONS_PER_MODULE);
  const content = await generateCourseContent({
    topic,
    level: input.level,
    goal: input.goal,
    videos,
    moduleGroups,
  });

  const { data: course, error: courseError } = await admin
    .from("courses")
    .insert({
      slug,
      title: topic,
      description: content.courseDescription,
      level: input.level,
      price: PRICE_KES,
      published: true,
      generated_by: input.requestedBy,
    })
    .select("id, slug")
    .single();
  if (courseError || !course) {
    return { ok: false, error: courseError?.message ?? "Failed to create course." };
  }

  let lessonCursor = 0;
  for (const [i, group] of moduleGroups.entries()) {
    const { data: courseModule, error: moduleError } = await admin
      .from("modules")
      .insert({
        course_id: course.id,
        title: content.moduleTitles[i] ?? `Part ${i + 1}`,
        description: `Videos ${lessonCursor + 1}-${lessonCursor + group.length} of the ${topic} curriculum.`,
        order_number: i + 1,
      })
      .select("id")
      .single();
    if (moduleError || !courseModule) {
      return { ok: false, error: moduleError?.message ?? "Failed to create a module." };
    }

    const lessonRows = group.map((video, j) => ({
      module_id: courseModule.id,
      title: video.title,
      description: content.lessonDescriptions[lessonCursor + j] ?? `Watch and follow along with "${video.title}".`,
      youtube_url: `https://www.youtube.com/watch?v=${video.videoId}`,
      order_number: j + 1,
      duration_seconds: video.durationSeconds,
    }));
    const { error: lessonError } = await admin.from("lessons").insert(lessonRows);
    if (lessonError) {
      return { ok: false, error: lessonError.message };
    }

    lessonCursor += group.length;
  }

  return { ok: true, courseId: course.id, slug: course.slug, reused: false };
}
