"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTranslate } from "@/components/LocaleProvider";

function friendlyError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email before logging in — check your inbox.";
  }
  return message;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslate();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const justRegistered = searchParams.get("confirm") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(friendlyError(signInError.message));
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <>
      {justRegistered && (
        <p className="text-sm mb-4" style={{ color: "var(--primary)" }}>
          {t("login.confirmEmail")}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="email">
            {t("login.emailLabel")}
          </label>
          <input
            id="email"
            className="field-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="password">
            {t("login.passwordLabel")}
          </label>
          <input
            id="password"
            className="field-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? t("login.submitting") : t("login.submit")}
        </button>
      </form>

      <p className="text-sm text-[var(--muted)] mt-6 text-center">
        {t("login.newHere")}{" "}
        <Link href="/register" className="font-medium" style={{ color: "var(--primary)" }}>
          {t("login.createAccount")}
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  const t = useTranslate();
  return (
    <div className="container-page py-16 max-w-md">
      <h1 className="text-2xl font-bold mb-2">{t("login.title")}</h1>
      <p className="text-[var(--muted)] mb-8">{t("login.subtitle")}</p>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
