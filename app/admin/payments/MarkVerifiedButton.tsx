"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkVerifiedButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch(`/api/admin/payments/${paymentId}/verify-manual`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not mark this payment verified.");
    }
    setLoading(false);
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn btn-secondary" style={{ padding: "6px 14px" }}>
      {loading ? "…" : "Mark Verified"}
    </button>
  );
}
