"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

/**
 * Google sign-in needs a client ID and secret configured on the Supabase
 * project itself, which nothing in this repo can check at build time. So the
 * button is opt-in: it renders only once NEXT_PUBLIC_GOOGLE_AUTH_ENABLED is
 * set, which the owner does after wiring Google up. Without that flag the
 * login page looks exactly as it did, rather than offering a button that
 * fails with "provider is not enabled" the moment somebody taps it.
 */
export const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export default function GoogleSignInButton({ redirectTo }: { redirectTo: string }) {
  const { locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!googleAuthEnabled) return null;

  async function handleClick() {
    setError(null);
    setLoading(true);

    // Google sends the user back to /auth/callback, which exchanges the code
    // for a session cookie and then forwards to `next` — the same route the
    // password-reset and email-confirmation links use.
    const next = encodeURIComponent(redirectTo);
    const { error: oauthError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });

    if (oauthError) {
      setError(t(locale, "auth.googleFailed"));
      setLoading(false);
    }
    // On success the browser is already navigating to Google; leaving the
    // button disabled avoids a second tap firing another redirect.
  }

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn btn-secondary w-full flex items-center justify-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
          />
          <path
            fill="#FBBC05"
            d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
          />
        </svg>
        {t(locale, "auth.continueWithGoogle")}
      </button>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <div className="flex items-center gap-3 mt-6">
        <span className="h-px flex-1" style={{ background: "var(--border)" }} />
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {t(locale, "auth.or")}
        </span>
        <span className="h-px flex-1" style={{ background: "var(--border)" }} />
      </div>
    </div>
  );
}
