"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTranslate } from "@/components/LocaleProvider";

type Status = "checking" | "ready" | "expired";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslate();

  const [status, setStatus] = useState<Status>(
    searchParams.get("expired") === "1" ? "expired" : "checking",
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "expired") return;
    // The recovery link is redeemed by /auth/callback before we get here, so
    // by now there is either a session or the link was stale. Checking up
    // front means a dead link says so, instead of only failing after the user
    // has typed a new password twice.
    let active = true;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (active) setStatus(data.user ? "ready" : "expired");
      });
    return () => {
      active = false;
    };
  }, [status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });

    if (updateError) {
      // A session that expired between loading the page and submitting lands
      // here, so offer the way out rather than a dead end.
      if (updateError.message.toLowerCase().includes("session")) {
        setStatus("expired");
        return;
      }
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (status === "checking") {
    return <p className="text-[var(--muted)]">Checking your link…</p>;
  }

  if (status === "expired") {
    return (
      <>
        <h1 className="text-2xl font-bold mb-2">{t("reset.expiredTitle")}</h1>
        <p className="text-[var(--muted)] mb-8">{t("reset.expiredBody")}</p>
        <Link href="/forgot-password" className="btn btn-primary w-full">
          {t("reset.requestNew")}
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">{t("reset.title")}</h1>
      <p className="text-[var(--muted)] mb-8">{t("reset.subtitle")}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="password">
            {t("reset.passwordLabel")}
          </label>
          <input
            id="password"
            className="field-input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="confirmPassword">
            {t("reset.confirmLabel")}
          </label>
          <input
            id="confirmPassword"
            className="field-input"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? t("reset.submitting") : t("reset.submit")}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="container-page py-16 max-w-md">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
