/**
 * `?redirect=` comes straight from a URL, so it is attacker-controlled. Only
 * same-site paths are allowed through: anything absolute, protocol-relative
 * (`//evil.com`) or backslash-escaped would turn the login and signup pages
 * into an open redirect that sends a freshly authenticated learner to a
 * phishing page. Mirrors safeNext() in app/auth/callback/route.ts.
 */
export function safeRedirect(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw || !raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}
