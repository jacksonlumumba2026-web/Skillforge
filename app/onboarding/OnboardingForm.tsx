"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Skill, SkillLevel } from "@/lib/types/database";

const LEVELS: { value: SkillLevel; label: string; blurb: string }[] = [
  { value: "beginner", label: "Beginner", blurb: "New to this — start from the fundamentals" },
  { value: "intermediate", label: "Intermediate", blurb: "Know the basics, ready to go deeper" },
  { value: "advanced", label: "Advanced", blurb: "Comfortable already, want to sharpen up" },
];

export default function OnboardingForm({ skills }: { skills: Skill[] }) {
  const router = useRouter();
  const [skillId, setSkillId] = useState<string | null>(null);
  const [level, setLevel] = useState<SkillLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!skillId || !level) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/paths/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId, level }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "generation_failed");
      router.push(`/path/${data.pathId}`);
    } catch {
      setError("Couldn't build your path just now. Please try again.");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-full mx-auto mb-6 border-2 border-[var(--accent-1)] border-t-transparent animate-spin" />
        <h2 className="text-xl mb-2">Building your path…</h2>
        <p className="text-[var(--text-2)] text-sm">
          Curating the best tutorials and writing your step-by-step breakdowns. This takes about
          20-30 seconds the first time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg mb-4">1. Choose a skill</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <button
              key={skill.id}
              type="button"
              onClick={() => setSkillId(skill.id)}
              className="card card-hover text-left"
              style={{
                padding: 20,
                borderColor: skillId === skill.id ? "var(--accent-1)" : undefined,
                background: skillId === skill.id ? "var(--surface-hover)" : undefined,
              }}
            >
              <div className="text-2xl mb-2">{skill.icon}</div>
              <div className="font-semibold text-sm mb-1">{skill.name}</div>
              <div className="text-xs text-[var(--text-3)]">{skill.category}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg mb-4">2. Your current level</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLevel(l.value)}
              className="card card-hover text-left"
              style={{
                padding: 20,
                borderColor: level === l.value ? "var(--accent-1)" : undefined,
                background: level === l.value ? "var(--surface-hover)" : undefined,
              }}
            >
              <div className="font-semibold text-sm mb-1">{l.label}</div>
              <div className="text-xs text-[var(--text-3)]">{l.blurb}</div>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-[var(--danger)] text-center">{error}</p>}

      <div className="text-center">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!skillId || !level}
          onClick={handleGenerate}
        >
          Build my path →
        </button>
      </div>
    </div>
  );
}
