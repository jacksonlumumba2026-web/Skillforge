"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefundButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (
      !confirm(
        "Mark this payment refunded and revoke the learner's access? This doesn't move any money — refund them via Paystack or M-Pesa first, then confirm here.",
      )
    ) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/payments/${paymentId}/refund`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not refund this payment.");
    }
    setLoading(false);
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn btn-secondary" style={{ padding: "6px 14px" }}>
      {loading ? "Refunding…" : "Refund"}
    </button>
  );
}
