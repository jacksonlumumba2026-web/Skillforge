"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddModuleForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not add module.");
      setSaving(false);
      return;
    }
    setTitle("");
    setDescription("");
    setOpen(false);
    setSaving(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-secondary">
        + Add module
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5 space-y-2">
      <input
        className="field-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Module title"
        required
      />
      <textarea
        className="field-input"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Module description"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Adding…" : "Add module"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
