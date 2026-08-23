"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateDiscountCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState(50);
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/discount-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        percentOff,
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        note: note.trim() || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create this code.");
      return;
    }

    setCode("");
    setPercentOff(50);
    setMaxRedemptions("");
    setExpiresAt("");
    setNote("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-8 grid gap-4 sm:grid-cols-2">
      <div>
        <label className="field-label" htmlFor="code">
          Code
        </label>
        <input
          id="code"
          className="field-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="SCHOLAR2026"
          required
        />
      </div>
      <div>
        <label className="field-label" htmlFor="percentOff">
          % off (100 = full scholarship)
        </label>
        <input
          id="percentOff"
          type="number"
          min={1}
          max={100}
          className="field-input"
          value={percentOff}
          onChange={(e) => setPercentOff(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <label className="field-label" htmlFor="maxRedemptions">
          Max redemptions (blank = unlimited)
        </label>
        <input
          id="maxRedemptions"
          type="number"
          min={1}
          className="field-input"
          value={maxRedemptions}
          onChange={(e) => setMaxRedemptions(e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="expiresAt">
          Expires (blank = never)
        </label>
        <input
          id="expiresAt"
          type="date"
          className="field-input"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="note">
          Note (internal — e.g. who this batch is for)
        </label>
        <input
          id="note"
          className="field-input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="August 2026 scholarship batch"
        />
      </div>
      <div className="sm:col-span-2 flex items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating…" : "Create code"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </form>
  );
}
