"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTranslate } from "@/components/LocaleProvider";

export default function ForgotPasswordPage() {
  const t = useTranslate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);

    // Supabase deliberately returns no error for an address that isn't
    // registered, so account enumeration is already prevented upstream and
    // there is nothing to gain by hiding real failures here. An outage that
    // silently told people to check their inbox would be worse than useless.
    if (resetError) {
      setError(
        resetError.message.toLowerCase().includes("rate")
          ? "Too many attempts. Please wait a few minutes and try again."
          : "Could not send the email just now. Please try again in a moment.",
      );
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="container-page py-16 max-w-md">
        <h1 className="text-2xl font-bold mb-2">{t("forgot.sentTitle")}</h1>
        <p className="text-[var(--muted)] mb-8">{t("forgot.sentBody")}</p>
        <Link href="/login" className="btn btn-primary w-full">
          {t("forgot.backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-16 max-w-md">
      <h1 className="text-2xl font-bold mb-2">{t("forgot.title")}</h1>
      <p className="text-[var(--muted)] mb-8">{t("forgot.subtitle")}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="email">
            {t("forgot.emailLabel")}
          </label>
          <input
            id="email"
            className="field-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? t("forgot.submitting") : t("forgot.submit")}
        </button>
      </form>

      <p className="text-sm text-[var(--muted)] mt-6 text-center">
        <Link href="/login" className="font-medium" style={{ color: "var(--primary)" }}>
          {t("forgot.backToLogin")}
        </Link>
      </p>
    </div>
  );
}
