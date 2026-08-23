"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "pushing" | "waiting" | "error";

export default function MpesaPayButton({
  courseId,
  price,
  discountCode,
}: {
  courseId: string;
  price: number;
  discountCode?: string;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("pushing");

    const res = await fetch("/api/payments/mpesa/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, phone, discountCode: discountCode || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not start M-Pesa payment.");
      setStatus("error");
      return;
    }

    if (data.free) {
      router.push(`/courses/${data.courseId}?payment=success`);
      router.refresh();
      return;
    }

    setStatus("waiting");
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts += 1;
      const pollRes = await fetch(`/api/payments/mpesa/status?reference=${encodeURIComponent(data.reference)}`);
      const pollData = await pollRes.json();

      if (pollData.status === "success") {
        if (pollRef.current) clearInterval(pollRef.current);
        router.push(`/courses/${courseId}?payment=success`);
        router.refresh();
        return;
      }
      if (pollData.status === "failed") {
        if (pollRef.current) clearInterval(pollRef.current);
        setError(pollData.error ?? "Payment was not completed. Please try again.");
        setStatus("error");
        return;
      }
      if (attempts >= 30) {
        if (pollRef.current) clearInterval(pollRef.current);
        setError("This is taking longer than expected. If you completed the M-Pesa prompt, refresh this page in a moment.");
        setStatus("error");
      }
    }, 3000);
  }

  if (status === "waiting") {
    return (
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Check your phone — enter your M-Pesa PIN to complete the KSh {price.toLocaleString()} payment…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="tel"
        required
        placeholder="M-Pesa number, e.g. 0712345678"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="field-input"
        disabled={status === "pushing"}
      />
      <button type="submit" className="btn btn-secondary w-full" disabled={status === "pushing"}>
        {status === "pushing" ? "Sending prompt to your phone…" : `Pay KSh ${price.toLocaleString()} with M-Pesa`}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
