"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslate } from "@/components/LocaleProvider";

export default function PayButton({
  courseId,
  price,
  discountCode,
}: {
  courseId: string;
  price: number;
  discountCode?: string;
}) {
  const router = useRouter();
  const t = useTranslate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, discountCode: discountCode || undefined }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not start payment. Please try again.");
      setLoading(false);
      return;
    }

    if (data.free) {
      router.push(`/courses/${data.courseId}?payment=success`);
      router.refresh();
      return;
    }
    window.location.href = data.authorizationUrl;
  }

  return (
    <div>
      <button className="btn btn-secondary w-full" onClick={handleClick} disabled={loading}>
        {loading ? "Redirecting to payment…" : `${t("purchase.payByCard")} — KSh ${price.toLocaleString()}`}
      </button>
      {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
    </div>
  );
}
