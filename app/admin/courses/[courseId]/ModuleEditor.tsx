"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lesson, CourseModule } from "@/lib/types";

function LessonRow({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description);
  const [youtubeUrl, setYoutubeUrl] = useState(lesson.youtube_url);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, youtube_url: youtubeUrl }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save.");
      setSaving(false);
      return;
    }
    setEditing(false);
    setSaving(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-3 py-2 text-sm border-b border-[var(--border)] last:border-0">
        <span>
          {lesson.title}
          {lesson.duration_seconds && (
            <span className="text-[var(--muted)]"> · {Math.round(lesson.duration_seconds / 60)} min</span>
          )}
        </span>
        <span className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-xs" style={{ color: "var(--primary)" }}>
            Edit
          </button>
          <button onClick={remove} className="text-xs text-red-600">
            Delete
          </button>
        </span>
      </li>
    );
  }

  return (
    <li className="py-3 border-b border-[var(--border)] last:border-0 space-y-2">
      <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea
        className="field-input"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <input
        className="field-input"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        placeholder="YouTube URL"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={save} className="btn btn-primary" style={{ padding: "6px 14px" }} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={() => setEditing(false)} className="btn btn-secondary" style={{ padding: "6px 14px" }}>
          Cancel
        </button>
      </div>
    </li>
  );
}

function AddLessonForm({ moduleId }: { moduleId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/modules/${moduleId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, youtube_url: youtubeUrl }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not add lesson.");
      setSaving(false);
      return;
    }
    setTitle("");
    setDescription("");
    setYoutubeUrl("");
    setOpen(false);
    setSaving(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm mt-3" style={{ color: "var(--primary)" }}>
        + Add lesson
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-2">
      <input
        className="field-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Lesson title"
        required
      />
      <textarea
        className="field-input"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What will the learner get from this video?"
      />
      <input
        className="field-input"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
        required
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" style={{ padding: "6px 14px" }} disabled={saving}>
          {saving ? "Adding…" : "Add lesson"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary" style={{ padding: "6px 14px" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ModuleEditor({
  courseModule,
  lessons,
}: {
  courseModule: CourseModule;
  lessons: Lesson[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(courseModule.title);
  const [description, setDescription] = useState(courseModule.description);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/modules/${courseModule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  async function remove() {
    if (!confirm(`Delete module "${courseModule.title}" and all its lessons?`)) return;
    const res = await fetch(`/api/admin/modules/${courseModule.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        {editing ? (
          <div className="flex-1 space-y-2">
            <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea
              className="field-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={save} className="btn btn-primary" style={{ padding: "6px 14px" }} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="btn btn-secondary" style={{ padding: "6px 14px" }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--muted)]">
              Module {courseModule.order_number} — {courseModule.title}
            </h3>
            <span className="flex gap-3 shrink-0">
              <button onClick={() => setEditing(true)} className="text-xs" style={{ color: "var(--primary)" }}>
                Edit
              </button>
              <button onClick={remove} className="text-xs text-red-600">
                Delete
              </button>
            </span>
          </>
        )}
      </div>

      <ul>
        {lessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} />
        ))}
      </ul>
      <AddLessonForm moduleId={courseModule.id} />
    </div>
  );
}
