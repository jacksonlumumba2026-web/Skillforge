"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ActiveToggle({ discountCodeId, initialActive }: { discountCodeId: string; initialActive: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const nextActive = !active;
    const res = await fetch(`/api/admin/discount-codes/${discountCodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: nextActive }),
    });
    if (res.ok) {
      setActive(nextActive);
      router.refresh();
    } else {
      alert("Could not update this code.");
    }
    setLoading(false);
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn btn-secondary" style={{ padding: "6px 14px" }}>
      {loading ? "…" : active ? "Deactivate" : "Activate"}
    </button>
  );
}
