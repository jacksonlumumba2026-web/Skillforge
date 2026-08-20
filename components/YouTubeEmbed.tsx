import { getYouTubeVideoId } from "@/lib/youtube";

export default function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return (
      <div
        className="card flex items-center justify-center text-sm text-[var(--muted)]"
        style={{ aspectRatio: "16 / 9" }}
      >
        Video not available yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16 / 9" }}>
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
