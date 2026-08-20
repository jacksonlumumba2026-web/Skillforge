"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishToggle({
  courseId,
  initialPublished,
}: {
  courseId: string;
  initialPublished: boolean;
}) {
  const router = useRouter();
  const [published, setPublished] = useState(initialPublished);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    if (res.ok) {
      setPublished((p) => !p);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={
        published
          ? { background: "var(--success)", color: "white" }
          : { background: "var(--surface)", color: "var(--muted)" }
      }
    >
      {published ? "Published" : "Draft"}
    </button>
  );
}
