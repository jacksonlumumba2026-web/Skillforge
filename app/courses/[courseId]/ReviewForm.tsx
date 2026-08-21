"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({
  courseId,
  initialRating,
  initialComment,
}: {
  courseId: string;
  initialRating: number;
  initialComment: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Pick a star rating first.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, rating, comment }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save your review.");
      setSaving(false);
      return;
    }
    setSaved(true);
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5">
      <p className="text-sm font-semibold mb-3">
        {initialRating ? "Your review" : "Rate this course"}
      </p>
      <div className="flex gap-1 mb-3" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className="text-2xl leading-none"
            style={{ color: (hoverRating || rating) >= star ? "#f59e0b" : "var(--border)" }}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="field-input mb-3"
        rows={3}
        placeholder="What did you think of this course? (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {saved && !error && <p className="text-sm mb-3" style={{ color: "var(--success)" }}>Thanks for your review!</p>}
      <button type="submit" className="btn btn-primary" style={{ padding: "8px 18px" }} disabled={saving}>
        {saving ? "Saving…" : initialRating ? "Update review" : "Submit review"}
      </button>
    </form>
  );
}
