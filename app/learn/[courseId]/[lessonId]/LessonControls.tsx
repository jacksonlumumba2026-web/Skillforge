"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LessonControls({
  lessonId,
  courseId,
  initialCompleted,
  nextLessonId,
  totalLessons,
  initialCompletedCount,
}: {
  lessonId: string;
  courseId: string;
  initialCompleted: boolean;
  nextLessonId: string | null;
  totalLessons: number;
  initialCompletedCount: number;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [completedCount, setCompletedCount] = useState(initialCompletedCount);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const courseFinished = totalLessons > 0 && completedCount >= totalLessons;
  const milestoneMessage = courseFinished
    ? "🎉 Course Completed!"
    : pct >= 75
      ? "🚀 Almost there — just a bit more!"
      : pct >= 50
        ? "🔥 Halfway there — keep going!"
        : pct >= 25
          ? "💪 Great start — keep the momentum!"
          : null;

  async function markComplete() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/progress/complete-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      if (!res.ok) {
        setError("Couldn't save your progress. Please try again.");
        return;
      }
      // This button only renders while !completed, so this is always a new completion.
      setCompleted(true);
      setCompletedCount((c) => c + 1);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden mb-2">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: "var(--primary)" }}
          />
        </div>
        <p className="text-sm text-[var(--muted)]">
          {completedCount} / {totalLessons} lessons completed ({pct}%)
        </p>
      </div>

      {milestoneMessage && (
        <p
          className="text-sm font-semibold mb-4"
          style={{ color: courseFinished ? "var(--success)" : "var(--primary)" }}
        >
          {milestoneMessage}
        </p>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex flex-wrap gap-3">
        {!completed && (
          <button className="btn btn-primary" onClick={markComplete} disabled={saving}>
            {saving ? "Saving…" : "Mark Lesson Complete"}
          </button>
        )}

        {completed && nextLessonId && (
          <Link href={`/learn/${courseId}/${nextLessonId}`} className="btn btn-primary">
            Next Lesson →
          </Link>
        )}

        {completed && !nextLessonId && (
          <Link href="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
