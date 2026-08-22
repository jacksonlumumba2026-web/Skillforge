"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserBanToggle({
  userId,
  initialBanned,
}: {
  userId: string;
  initialBanned: boolean;
}) {
  const router = useRouter();
  const [banned, setBanned] = useState(initialBanned);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    if (!banned && !confirm("Ban this user? They'll be signed out and unable to log in until unbanned.")) {
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banned: !banned }),
    });
    if (res.ok) {
      setBanned((b) => !b);
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
        banned
          ? { background: "#dc2626", color: "white" }
          : { background: "var(--surface)", color: "var(--muted)" }
      }
    >
      {banned ? "Banned — unban" : "Active — ban"}
    </button>
  );
}
