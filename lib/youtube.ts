import "server-only";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface RawSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
  };
}

interface RawVideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
  };
  statistics: { viewCount?: string; likeCount?: string };
  contentDetails: { duration: string };
}

export interface CuratedVideo {
  videoId: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
}

/** Curriculum stage templates. Each template becomes one ordered step in the path. */
const STAGE_TEMPLATES: Record<"beginner" | "intermediate" | "advanced", string[]> = {
  beginner: [
    "{skill} for beginners full tutorial",
    "{skill} basics explained",
    "{skill} tools and setup for beginners",
    "{skill} first project walkthrough",
    "{skill} common beginner mistakes",
    "{skill} tips to improve fast",
  ],
  intermediate: [
    "{skill} intermediate tutorial",
    "{skill} core techniques breakdown",
    "{skill} workflow tips",
    "{skill} real project case study",
    "{skill} common pitfalls to avoid",
    "{skill} tips from professionals",
  ],
  advanced: [
    "{skill} advanced techniques",
    "{skill} professional workflow",
    "{skill} in-depth case study",
    "{skill} optimization and performance tips",
    "{skill} expert tips and tricks",
    "{skill} portfolio-level project",
  ],
};

function iso8601DurationToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match;
  return (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0);
}

function normalizeTitle(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter((w) => b.has(w)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

async function searchStage(query: string, apiKey: string): Promise<RawSearchItem[]> {
  const url = new URL(`${YOUTUBE_API_BASE}/search`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("order", "relevance");
  url.searchParams.set("safeSearch", "strict");
  url.searchParams.set("relevanceLanguage", "en");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url, { next: { revalidate: false } });
  if (!res.ok) throw new Error(`YouTube search failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.items ?? [];
}

async function fetchVideoDetails(videoIds: string[], apiKey: string): Promise<RawVideoItem[]> {
  if (videoIds.length === 0) return [];
  const url = new URL(`${YOUTUBE_API_BASE}/videos`);
  url.searchParams.set("part", "snippet,statistics,contentDetails");
  url.searchParams.set("id", videoIds.join(","));
  url.searchParams.set("key", apiKey);

  const res = await fetch(url, { next: { revalidate: false } });
  if (!res.ok) throw new Error(`YouTube videos.list failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.items ?? [];
}

function scoreVideo(v: RawVideoItem): number {
  const views = Number(v.statistics.viewCount ?? 0);
  const likes = Number(v.statistics.likeCount ?? 0);
  const duration = iso8601DurationToSeconds(v.contentDetails.duration);
  const ageDays = Math.max(
    1,
    (Date.now() - new Date(v.snippet.publishedAt).getTime()) / 86_400_000,
  );

  const viewScore = Math.log10(views + 1);
  const likeRatio = views > 0 ? likes / views : 0;
  const recencyScore = Math.max(0, 1 - ageDays / (365 * 4)); // decays over ~4 years

  let durationPenalty = 0;
  if (duration < 120) durationPenalty = 5; // too short to be a real tutorial
  else if (duration > 2700) durationPenalty = 2; // over 45 min, less step-sized
  else if (duration >= 300 && duration <= 1500) durationPenalty = -0.5; // 5-25 min sweet spot

  return viewScore + likeRatio * 20 + recencyScore * 1.5 - durationPenalty;
}

/**
 * Searches, ranks, and curates an ordered list of tutorial videos for a
 * skill+level, one per curriculum stage, deduplicated by topic and channel.
 */
export async function curateVideosForPath(
  skillName: string,
  level: "beginner" | "intermediate" | "advanced",
): Promise<CuratedVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("YOUTUBE_API_KEY is not configured");

  const stages = STAGE_TEMPLATES[level];
  const chosen: CuratedVideo[] = [];
  const usedVideoIds = new Set<string>();
  const usedChannelIds = new Set<string>();
  const chosenTitleWords: Set<string>[] = [];

  for (const template of stages) {
    const query = template.replace("{skill}", skillName);
    const searchResults = await searchStage(query, apiKey);
    const candidateIds = searchResults
      .map((r) => r.id?.videoId)
      .filter((id): id is string => Boolean(id) && !usedVideoIds.has(id));
    if (candidateIds.length === 0) continue;

    const details = await fetchVideoDetails(candidateIds, apiKey);

    let best: { video: RawVideoItem; score: number } | null = null;
    for (const video of details) {
      if (usedVideoIds.has(video.id)) continue;
      const titleWords = normalizeTitle(video.snippet.title);
      const isDuplicateTopic = chosenTitleWords.some(
        (existing) => jaccardSimilarity(existing, titleWords) > 0.6,
      );
      if (isDuplicateTopic) continue;

      // Mild penalty (not exclusion) for repeating a channel, to encourage
      // diversity without starving small niches that dominate a topic.
      const channelPenalty = usedChannelIds.has(video.snippet.channelId) ? 1.5 : 0;
      const score = scoreVideo(video) - channelPenalty;

      if (!best || score > best.score) best = { video, score };
    }

    if (!best) continue;

    chosen.push({
      videoId: best.video.id,
      title: best.video.snippet.title,
      description: best.video.snippet.description,
      channelId: best.video.snippet.channelId,
      channelTitle: best.video.snippet.channelTitle,
      publishedAt: best.video.snippet.publishedAt,
      durationSeconds: iso8601DurationToSeconds(best.video.contentDetails.duration),
      viewCount: Number(best.video.statistics.viewCount ?? 0),
      likeCount: Number(best.video.statistics.likeCount ?? 0),
    });
    usedVideoIds.add(best.video.id);
    usedChannelIds.add(best.video.snippet.channelId);
    chosenTitleWords.push(normalizeTitle(best.video.snippet.title));
  }

  return chosen;
}
