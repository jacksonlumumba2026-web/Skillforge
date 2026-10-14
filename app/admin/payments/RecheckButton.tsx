"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Re-asks the provider about a payment that never finalized. The answer
// comes from Paystack/Safaricom, so the result is worth reading rather than
// dismissing — "failed" here means the provider says the money never
// arrived, not that the check went wrong.
export default function RecheckButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch(`/api/admin/payments/${paymentId}/recheck`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      alert(data.message ?? "Re-checked.");
      // The row's status may have changed either way, so refresh regardless.
      router.refresh();
    } else {
      alert(data.error ?? "Could not re-check this payment.");
    }
    setLoading(false);
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn btn-secondary" style={{ padding: "6px 14px" }}>
      {loading ? "Checking…" : "Re-check"}
    </button>
  );
}
