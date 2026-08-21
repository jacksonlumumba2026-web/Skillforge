"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CertificateButton({
  courseId,
  existingCertificateId,
}: {
  courseId: string;
  existingCertificateId: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (existingCertificateId) {
    return (
      <Link href={`/certificate/${existingCertificateId}`} className="btn btn-secondary">
        🎓 View Certificate
      </Link>
    );
  }

  async function getCertificate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not issue certificate.");
      setLoading(false);
      return;
    }
    router.push(`/certificate/${data.id}`);
  }

  return (
    <div>
      <button onClick={getCertificate} className="btn btn-secondary" disabled={loading}>
        {loading ? "Generating…" : "🎓 Get Certificate"}
      </button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
