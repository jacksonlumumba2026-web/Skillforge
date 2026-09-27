"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Result = {
  scanned: number;
  distinctVideos?: number;
  updated: number;
  unparseableUrls?: number;
  unavailable: string[];
  failures?: string[];
  message?: string;
};

/**
 * Runs the duration backfill on the server, where YOUTUBE_API_KEY lives.
 * Durations are what allow a real per-lesson data cost to be shown instead
 * of general guidance.
 */
export default function BackfillDurationsButton({ missing }: { missing: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/admin/lessons/backfill-durations", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Backfill failed.");
      return;
    }
    setResult(data);
    router.refresh();
  }

  return (
    <div className="card p-5 mb-8">
      <h2 className="text-sm font-semibold mb-1">Lesson video durations</h2>
      <p className="text-sm text-[var(--muted)] mb-4">
        {missing > 0
          ? `${missing} lessons have no duration, so they show general data-saving guidance instead of a real "this lesson uses about N MB" figure.`
          : "Every lesson with a video has a duration, so learners see a real data cost per lesson."}
      </p>

      <button onClick={run} className="btn btn-secondary" disabled={loading || missing === 0}>
        {loading ? "Looking up durations…" : "Backfill durations from YouTube"}
      </button>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      {result && (
        <div className="text-sm mt-3 space-y-1">
          <p style={{ color: "var(--success)" }}>
            Updated {result.updated} of {result.scanned} lessons
            {result.distinctVideos ? ` from ${result.distinctVideos} distinct videos` : ""}.
          </p>
          {result.unparseableUrls ? (
            <p className="text-[var(--muted)]">
              {result.unparseableUrls} lesson URLs could not be read as YouTube links.
            </p>
          ) : null}
          {result.unavailable.length > 0 && (
            <p className="text-[var(--muted)]">
              {result.unavailable.length} videos returned nothing — deleted, private or blocked.
              Those lessons will not play for learners either: {result.unavailable.join(", ")}
            </p>
          )}
          {result.failures?.length ? (
            <p className="text-red-600">{result.failures.length} updates failed.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
