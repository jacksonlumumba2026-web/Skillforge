"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CapstoneCard({
  courseId,
  title,
  brief,
  existingSubmission,
}: {
  courseId: string;
  title: string;
  brief: string;
  existingSubmission: { submission_url: string; note: string | null } | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(!existingSubmission);
  const [expanded, setExpanded] = useState(!existingSubmission);
  const [submissionUrl, setSubmissionUrl] = useState(existingSubmission?.submission_url ?? "");
  const [note, setNote] = useState(existingSubmission?.note ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/capstone/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, submissionUrl, note: note.trim() || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save your submission. Please try again.");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  return (
    <div className="card p-5 space-y-3">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Your Project{existingSubmission && !editing ? " · Submitted ✅" : ""}
          </p>
          <p className="font-semibold">{title}</p>
        </div>
        <span aria-hidden className="text-[var(--muted)]">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <>
          <p className="text-sm whitespace-pre-line text-[var(--muted)]">{brief}</p>

          {existingSubmission && !editing ? (
            <div className="text-sm space-y-2">
              <p>
                Submitted:{" "}
                <a
                  href={existingSubmission.submission_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium break-all"
                  style={{ color: "var(--primary)" }}
                >
                  {existingSubmission.submission_url}
                </a>
              </p>
              {existingSubmission.note && <p className="text-[var(--muted)]">{existingSubmission.note}</p>}
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs font-medium"
                style={{ color: "var(--primary)" }}
              >
                Update submission
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="url"
                required
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="Link to what you built (Google Doc, live site, GitHub, etc.)"
                className="field-input"
                disabled={loading}
              />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything you want us to know (optional)"
                className="field-input"
                disabled={loading}
              />
              <button type="submit" className="btn btn-primary w-full" disabled={loading || !submissionUrl.trim()}>
                {loading ? "Saving…" : "Submit my project"}
              </button>
              {error && <p className="text-xs text-red-600">{error}</p>}
            </form>
          )}
        </>
      )}
    </div>
  );
}
