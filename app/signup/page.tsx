"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/app/_components/AuthShell";
import GoogleButton from "@/app/_components/GoogleButton";

function SignupForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      // Email confirmation is required by the Supabase project settings.
      router.push("/login?confirm=1");
      return;
    }

    router.push("/onboarding");
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            className="field-input"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="field-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="field-input"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Creating account…" : "Create account & continue"}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs text-[var(--text-3)]">or</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <GoogleButton label="Sign up with Google" />

      <p className="text-xs text-[var(--text-3)] mt-6">
        No payment info needed — your 7-day free trial starts right away. Pay with M-Pesa only
        if you want to keep going after that.
      </p>
      <p className="text-sm text-[var(--text-2)] mt-6 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent-3)] font-medium">
          Log in
        </Link>
      </p>
    </>
  );
}

export default function SignupPage() {
  return (
    <AuthShell
      title="Start your free trial"
      subtitle="7 days free, full access, no card required."
    >
      <SignupForm />
    </AuthShell>
  );
}
