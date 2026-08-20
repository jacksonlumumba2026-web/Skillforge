"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CourseLevel } from "@/lib/types";

export default function RequestCoursePage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<CourseLevel>("beginner");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (topic.trim().length < 3) {
      setError("Please enter a topic (at least 3 characters).");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/courses/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, level, goal }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.push(`/courses/${data.courseId}`);
  }

  return (
    <div className="container-page py-16 max-w-md">
      <h1 className="text-2xl font-bold mb-2">Request a course</h1>
      <p className="text-[var(--muted)] mb-8">
        Can&apos;t find what you want to learn? Tell us the topic and we&apos;ll build a course for
        you from real tutorial videos.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="topic">
            Topic
          </label>
          <input
            id="topic"
            className="field-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Video Editing with CapCut"
            disabled={loading}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="level">
            Skill level
          </label>
          <select
            id="level"
            className="field-input"
            value={level}
            onChange={(e) => setLevel(e.target.value as CourseLevel)}
            disabled={loading}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="goal">
            What do you want to be able to do? (optional)
          </label>
          <input
            id="goal"
            className="field-input"
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Edit short videos for Instagram"
            disabled={loading}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Generating your course… this can take a minute" : "Generate course"}
        </button>
      </form>
    </div>
  );
}
