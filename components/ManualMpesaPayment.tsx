"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ManualMpesaPayment({
  courseId,
  price,
  discountCode,
  mpesaNumber,
  mpesaName,
}: {
  courseId: string;
  price: number;
  discountCode?: string;
  mpesaNumber: string;
  mpesaName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/payments/mpesa-manual/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, code, discountCode: discountCode || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not confirm your payment. Please check the code and try again.");
      setLoading(false);
      return;
    }

    router.push(`/courses/${data.courseId}?payment=success`);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium" style={{ color: "var(--primary)" }}>
        Or pay via M-Pesa Send Money
      </button>
    );
  }

  return (
    <div className="card p-4 text-left space-y-3">
      <p className="text-sm">
        Send <strong>KSh {price.toLocaleString()}</strong> via M-Pesa Send Money to{" "}
        <strong>{mpesaNumber}</strong> ({mpesaName}), then enter the confirmation code M-Pesa texts
        you below.
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="M-Pesa code, e.g. QJI7XXXX9A"
          className="field-input"
          disabled={loading}
          maxLength={10}
        />
        <button type="submit" className="btn btn-secondary w-full" disabled={loading || !code.trim()}>
          {loading ? "Confirming…" : "I've sent it — confirm my code"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>
      <p className="text-xs text-[var(--muted)]">
        You&apos;ll get access right away. We spot-check codes against our M-Pesa statement — a
        fake or reused code will have access revoked.
      </p>
    </div>
  );
}
