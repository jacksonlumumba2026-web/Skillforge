"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTranslate } from "@/components/LocaleProvider";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { safeRedirect } from "@/lib/safeRedirect";

function friendlyError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "An account with that email already exists. Try logging in instead.";
  }
  if (lower.includes("password") && (lower.includes("short") || lower.includes("weak"))) {
    return "That password is too weak. Use at least 8 characters.";
  }
  return message;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslate();
  // Where to land after signing up. A course page sends learners here to
  // unlock its free first lesson, so they should come straight back to it
  // rather than to an empty dashboard.
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in every field.");
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
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // Without this, Supabase builds the confirmation link from the
        // project's Site URL instead. That was still localhost:3000, so
        // every confirmation email sent a new learner to a page that
        // refuses to connect and they could never finish signing up —
        // which is the shape of a platform with almost no accounts.
        // Forgot-password and Google sign-in already pass their own.
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (signUpError) {
      setError(friendlyError(signUpError.message));
      setLoading(false);
      return;
    }

    if (!data.session) {
      // Email confirmation is required by the Supabase project settings, so
      // the session arrives later via /auth/callback — which records any
      // pending referral itself.
      router.push(
        redirectTo === "/dashboard"
          ? "/login?confirm=1"
          : `/login?confirm=1&redirect=${encodeURIComponent(redirectTo)}`,
      );
      return;
    }

    // Signed in straight away (confirmation turned off), so /auth/callback is
    // never visited and the referral cookie would otherwise go unredeemed.
    // Failing this must not block a successful signup, hence the catch.
    await fetch("/api/referrals/claim", { method: "POST" }).catch(() => {});

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="container-page py-16 max-w-md">
      <h1 className="text-2xl font-bold mb-2">{t("register.title")}</h1>
      <p className="text-[var(--muted)] mb-8">{t("register.subtitle")}</p>

      <GoogleSignInButton redirectTo={redirectTo} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="fullName">
            {t("register.fullNameLabel")}
          </label>
          <input
            id="fullName"
            className="field-input"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Wanjiku"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="email">
            {t("register.emailLabel")}
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
            {t("register.passwordLabel")}
          </label>
          <input
            id="password"
            className="field-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="confirmPassword">
            {t("register.confirmPasswordLabel")}
          </label>
          <input
            id="confirmPassword"
            className="field-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? t("register.submitting") : t("register.submit")}
        </button>
      </form>

      <p className="text-sm text-[var(--muted)] mt-6 text-center">
        {t("register.alreadyHaveAccount")}{" "}
        <Link
          href={redirectTo === "/dashboard" ? "/login" : `/login?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-medium"
          style={{ color: "var(--primary)" }}
        >
          {t("register.logIn")}
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  // useSearchParams() needs a Suspense boundary to prerender, same as /login.
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
