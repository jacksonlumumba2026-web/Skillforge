import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { CuratedVideo } from "@/lib/youtube";
import type { CourseLevel } from "@/lib/types";

let client: Anthropic | null = null;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

export interface GeneratedCourseContent {
  courseDescription: string;
  moduleTitles: string[];
  lessonDescriptions: string[];
}

const SYSTEM_PROMPT = `You write short, plain-English course content for a beginner-friendly digital skills platform.
Given a topic, skill level, an optional learner goal, and a list of curated tutorial videos (already grouped into modules), produce:
1. A 2-3 sentence course description selling what the learner will be able to do after finishing.
2. One short, specific title per module (not generic like "Module 1") reflecting the videos grouped under it.
3. One 1-2 sentence plain-English description per video, explaining what that specific lesson teaches.

Respond with ONLY a JSON object of this exact shape, no markdown fences, no other text:
{"courseDescription": "...", "moduleTitles": ["...", "..."], "lessonDescriptions": ["...", "..."]}`;

/** Groups lesson indexes into modules of up to `size` lessons each. */
export function chunkIntoModules<T>(items: T[], size = 2): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) groups.push(items.slice(i, i + size));
  return groups;
}

export async function generateCourseContent(input: {
  topic: string;
  level: CourseLevel;
  goal: string;
  videos: CuratedVideo[];
  moduleGroups: CuratedVideo[][];
}): Promise<GeneratedCourseContent> {
  const groupsDescription = input.moduleGroups
    .map(
      (group, i) =>
        `Module ${i + 1} videos:\n` +
        group
          .map((v) => `- "${v.title}" by ${v.channelTitle}: ${v.description.slice(0, 300)}`)
          .join("\n"),
    )
    .join("\n\n");

  const userPrompt = `Topic: ${input.topic}
Level: ${input.level}
Learner goal: ${input.goal || "Not specified — infer a sensible goal from the topic."}

${groupsDescription}`;

  const response = await getClient().messages.create({
    model: "claude-opus-5",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    output_config: { effort: "medium" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";

  return parseCourseContent(raw, input);
}

function parseCourseContent(
  raw: string,
  input: { topic: string; level: CourseLevel; videos: CuratedVideo[]; moduleGroups: CuratedVideo[][] },
): GeneratedCourseContent {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    const courseDescription =
      typeof parsed.courseDescription === "string" ? parsed.courseDescription : "";
    const moduleTitles: string[] = Array.isArray(parsed.moduleTitles)
      ? parsed.moduleTitles.filter((t: unknown) => typeof t === "string")
      : [];
    const lessonDescriptions: string[] = Array.isArray(parsed.lessonDescriptions)
      ? parsed.lessonDescriptions.filter((d: unknown) => typeof d === "string")
      : [];

    if (
      courseDescription &&
      moduleTitles.length === input.moduleGroups.length &&
      lessonDescriptions.length === input.videos.length
    ) {
      return { courseDescription, moduleTitles, lessonDescriptions };
    }
  } catch {
    // fall through to default below
  }

  return {
    courseDescription: `A practical, ${input.level}-level introduction to ${input.topic}.`,
    moduleTitles: input.moduleGroups.map((_, i) => `Part ${i + 1}`),
    lessonDescriptions: input.videos.map((v) => `Watch and follow along with "${v.title}".`),
  };
}
