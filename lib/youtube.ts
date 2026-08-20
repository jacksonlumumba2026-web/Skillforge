/** Extracts the video ID from common YouTube URL formats (watch, youtu.be, embed). */
export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.replace("/embed/", "") || null;
    }
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}
