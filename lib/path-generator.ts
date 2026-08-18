import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { curateVideosForPath } from "@/lib/youtube";
import { generateStepSummary } from "@/lib/anthropic";
import type { LearningPath, PathStep, Skill, SkillLevel } from "@/lib/types/database";

/**
 * Returns the cached learning path + steps for a skill+level, generating and
 * caching it on first request. Concurrent requests for the same skill+level
 * are resolved by the DB's unique(skill_id, level) constraint — the loser of
 * the race just re-reads what the winner inserted.
 */
export async function getOrCreatePath(
  skill: Skill,
  level: SkillLevel,
): Promise<{ path: LearningPath; steps: PathStep[] }> {
  const admin = createAdminClient();

  const { data: existingPath } = await admin
    .from("learning_paths")
    .select("*")
    .eq("skill_id", skill.id)
    .eq("level", level)
    .maybeSingle();

  if (existingPath) {
    const { data: steps } = await admin
      .from("path_steps")
      .select("*")
      .eq("path_id", existingPath.id)
      .order("order_index", { ascending: true });
    return { path: existingPath, steps: steps ?? [] };
  }

  return generateAndCachePath(skill, level);
}

async function generateAndCachePath(
  skill: Skill,
  level: SkillLevel,
): Promise<{ path: LearningPath; steps: PathStep[] }> {
  const admin = createAdminClient();
  const videos = await curateVideosForPath(skill.name, level);

  if (videos.length === 0) {
    throw new Error(`No suitable videos found for ${skill.name} (${level})`);
  }

  const summaries = await Promise.all(
    videos.map((video) =>
      generateStepSummary({
        skillName: skill.name,
        level,
        videoTitle: video.title,
        videoChannel: video.channelTitle,
        videoDescription: video.description,
      }),
    ),
  );

  const levelLabel = level[0].toUpperCase() + level.slice(1);
  const { data: insertedPath, error: insertPathError } = await admin
    .from("learning_paths")
    .insert({
      skill_id: skill.id,
      level,
      title: `${skill.name}: ${levelLabel} Path`,
    })
    .select()
    .single();

  if (insertPathError) {
    // Another request won the race and inserted this skill+level first.
    if (insertPathError.code === "23505") {
      const { data: existingPath } = await admin
        .from("learning_paths")
        .select("*")
        .eq("skill_id", skill.id)
        .eq("level", level)
        .single();
      const { data: steps } = await admin
        .from("path_steps")
        .select("*")
        .eq("path_id", existingPath!.id)
        .order("order_index", { ascending: true });
      return { path: existingPath!, steps: steps ?? [] };
    }
    throw insertPathError;
  }

  const stepRows = videos.map((video, i) => ({
    path_id: insertedPath.id,
    order_index: i,
    title: video.title,
    youtube_video_id: video.videoId,
    video_title: video.title,
    video_channel: video.channelTitle,
    video_duration_seconds: video.durationSeconds,
    summary: summaries[i].summary,
    checklist: summaries[i].checklist,
  }));

  const { data: insertedSteps, error: insertStepsError } = await admin
    .from("path_steps")
    .insert(stepRows)
    .select()
    .order("order_index", { ascending: true });

  if (insertStepsError) throw insertStepsError;

  return { path: insertedPath, steps: insertedSteps ?? [] };
}
