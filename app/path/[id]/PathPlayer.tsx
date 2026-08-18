"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PathStep } from "@/lib/types/database";
import YouTubePlayer from "@/app/_components/YouTubePlayer";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.round(seconds / 60);
  return `${m} min`;
}

export default function PathPlayer({
  pathId,
  pathTitle,
  skillIcon,
  steps,
  completedStepIds,
  initialCurrentStep,
  isPathComplete,
}: {
  pathId: string;
  pathTitle: string;
  skillIcon: string;
  steps: PathStep[];
  completedStepIds: string[];
  initialCurrentStep: number;
  isPathComplete: boolean;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(new Set(completedStepIds));
  const [selectedIndex, setSelectedIndex] = useState(
    Math.min(initialCurrentStep, Math.max(steps.length - 1, 0)),
  );
  const [marking, setMarking] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);

  const step = steps[selectedIndex];
  const pct = steps.length > 0 ? Math.round((completed.size / steps.length) * 100) : 0;

  useEffect(() => {
    if (!isPathComplete) return;
    fetch("/api/certificates/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathId }),
    })
      .then((res) => res.json())
      .then((data) => setCertificateId(data.certificateId ?? null))
      .catch(() => {});
  }, [isPathComplete, pathId]);

  async function markComplete() {
    if (!step || marking) return;
    setMarking(true);
    try {
      const res = await fetch("/api/progress/complete-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId: step.id, pathId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCompleted((prev) => new Set(prev).add(step.id));
        if (data.isComplete && data.certificateId) {
          setCertificateId(data.certificateId);
        } else if (selectedIndex < steps.length - 1) {
          setSelectedIndex(selectedIndex + 1);
        }
      }
    } finally {
      setMarking(false);
    }
  }

  const allDone = useMemo(() => steps.length > 0 && completed.size === steps.length, [
    completed,
    steps.length,
  ]);

  if (!step) {
    return (
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-[var(--text-2)]">This path has no steps yet.</p>
      </main>
    );
  }

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <span className="tag">
          {skillIcon} {pathTitle}
        </span>
        <div className="progress-track mt-4" style={{ maxWidth: 420 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-[var(--text-3)] mt-2">
          {completed.size} / {steps.length} steps complete
        </p>
      </div>

      {allDone && (
        <div className="card mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ borderColor: "var(--success)" }}>
          <div>
            <div className="font-semibold mb-1">🎉 Path complete!</div>
            <p className="text-sm text-[var(--text-2)]">Your certificate is ready to share.</p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            disabled={!certificateId}
            onClick={() => certificateId && router.push(`/certificate/${certificateId}`)}
          >
            {certificateId ? "View certificate" : "Preparing…"}
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <YouTubePlayer videoId={step.youtube_video_id} onEnded={() => {}} />

          <div className="mt-6">
            <h1 className="text-2xl mb-1">{step.title}</h1>
            <p className="text-xs text-[var(--text-3)] mb-5">
              {step.video_channel} · {formatDuration(step.video_duration_seconds)}
            </p>

            <div className="card mb-5">
              <h2 className="text-sm font-semibold text-[var(--text-2)] mb-2 uppercase tracking-wide">
                Breakdown
              </h2>
              <p className="text-sm leading-relaxed">{step.summary}</p>
            </div>

            <div className="card mb-6">
              <h2 className="text-sm font-semibold text-[var(--text-2)] mb-3 uppercase tracking-wide">
                Action checklist
              </h2>
              <ul className="space-y-2.5">
                {step.checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span
                      className="mt-0.5 w-4 h-4 rounded-[4px] border border-[var(--border-strong)] flex-shrink-0"
                      aria-hidden
                    />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="btn btn-primary"
              onClick={markComplete}
              disabled={marking || completed.has(step.id)}
            >
              {completed.has(step.id) ? "✓ Step complete" : marking ? "Saving…" : "Mark step complete"}
            </button>
          </div>
        </div>

        <aside>
          <h2 className="text-sm font-semibold text-[var(--text-2)] mb-4 uppercase tracking-wide">
            Path steps
          </h2>
          <ol className="space-y-2 scrollbar-thin" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {steps.map((s, i) => {
              const isDone = completed.has(s.id);
              const isActive = i === selectedIndex;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSelectedIndex(i)}
                    className="w-full text-left card"
                    style={{
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      borderColor: isActive ? "var(--accent-1)" : undefined,
                      background: isActive ? "var(--surface-hover)" : undefined,
                    }}
                  >
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        background: isDone ? "var(--grad-main)" : "rgba(255,255,255,.06)",
                        color: isDone ? "#fff" : "var(--text-3)",
                      }}
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-medium truncate">{s.title}</span>
                      <span className="block text-[10px] text-[var(--text-3)]">
                        {formatDuration(s.video_duration_seconds)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </main>
  );
}
