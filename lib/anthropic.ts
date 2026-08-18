import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { ChecklistItem } from "@/lib/types/database";

let client: Anthropic | null = null;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

export interface StepSummary {
  summary: string;
  checklist: ChecklistItem[];
}

const SYSTEM_PROMPT = `You write short, plain-English learning breakdowns for step-by-step tutorial paths.
Given a YouTube tutorial's title, channel, and description, produce:
1. A 2-3 sentence summary in plain English explaining what the learner will get out of this video.
2. A checklist of 3-5 concrete action items the learner should do while or after watching.

Respond with ONLY a JSON object of this exact shape, no markdown fences, no other text:
{"summary": "...", "checklist": ["...", "...", "..."]}`;

/** Generates a plain-English summary + action checklist for one path step's video using Claude. */
export async function generateStepSummary(input: {
  skillName: string;
  level: string;
  videoTitle: string;
  videoChannel: string;
  videoDescription: string;
}): Promise<StepSummary> {
  const userPrompt = `Skill: ${input.skillName} (${input.level} level)
Video title: ${input.videoTitle}
Channel: ${input.videoChannel}
Description: ${input.videoDescription.slice(0, 1500)}`;

  const response = await getClient().messages.create({
    model: "claude-opus-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    output_config: { effort: "low" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";

  return parseStepSummary(raw, input.videoTitle);
}

function parseStepSummary(raw: string, fallbackTitle: string): StepSummary {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    const summary = typeof parsed.summary === "string" ? parsed.summary : "";
    const checklist: ChecklistItem[] = Array.isArray(parsed.checklist)
      ? parsed.checklist
          .filter((item: unknown) => typeof item === "string" && item.trim())
          .slice(0, 5)
          .map((label: string) => ({ label }))
      : [];
    if (summary && checklist.length > 0) return { summary, checklist };
  } catch {
    // fall through to default below
  }
  return {
    summary: `Work through "${fallbackTitle}" and apply what it teaches before moving to the next step.`,
    checklist: [
      { label: "Watch the full video once without pausing" },
      { label: "Re-watch and follow along hands-on" },
      { label: "Practice the technique on your own example" },
    ],
  };
}
