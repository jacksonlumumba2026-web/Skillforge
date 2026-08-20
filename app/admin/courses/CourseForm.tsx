"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Course, CourseLevel } from "@/lib/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CourseForm({ course }: { course?: Course }) {
  const router = useRouter();
  const isEdit = Boolean(course);

  const [title, setTitle] = useState(course?.title ?? "");
  const [slug, setSlug] = useState(course?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(course?.description ?? "");
  const [level, setLevel] = useState<CourseLevel>(course?.level ?? "beginner");
  const [price, setPrice] = useState(course?.price ?? 500);
  const [displayOrder, setDisplayOrder] = useState(course?.display_order ?? 0);
  const [published, setPublished] = useState(course?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = { title, slug, description, level, price, display_order: displayOrder, published };
    const res = await fetch(isEdit ? `/api/admin/courses/${course!.id}` : "/api/admin/courses", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setSaving(false);
      return;
    }

    if (isEdit) {
      router.refresh();
    } else {
      router.push(`/admin/courses/${data.id}`);
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div>
        <label className="field-label" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className="field-input"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </div>

      <div>
        <label className="field-label" htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          className="field-input"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
        />
      </div>

      <div>
        <label className="field-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className="field-input"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="level">
            Level
          </label>
          <select
            id="level"
            className="field-input"
            value={level}
            onChange={(e) => setLevel(e.target.value as CourseLevel)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="price">
            Price (KSh)
          </label>
          <input
            id="price"
            type="number"
            min={0}
            className="field-input"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-end">
        <div>
          <label className="field-label" htmlFor="displayOrder">
            Display order (lower shows first)
          </label>
          <input
            id="displayOrder"
            type="number"
            className="field-input"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm pb-2.5">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Saving…" : isEdit ? "Save changes" : "Create course"}
      </button>
    </form>
  );
}
