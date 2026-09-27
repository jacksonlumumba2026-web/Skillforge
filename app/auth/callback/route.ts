import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Turns the token in an emailed link into a real session cookie.
 *
 * Every Supabase email — confirm your address, reset your password, magic
 * link — lands the user back here. Two formats arrive in the wild depending
 * on how a project's email templates are written, so both are handled:
 *
 *   ?code=...                  PKCE, exchanged for a session
 *   ?token_hash=...&type=...   the {{ .TokenHash }} template style
 *
 * Without this route the browser client holds a PKCE verifier that nothing
 * ever redeems, so a reset link appears to work and then silently leaves the
 * user logged out.
 */

/**
 * `next` comes straight from a URL, so it is attacker-controlled. Only
 * same-site paths are allowed through: anything absolute, protocol-relative
 * (`//evil.com`) or backslash-escaped would turn this into an open redirect
 * that phishes a freshly authenticated user.
 */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/dashboard";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/dashboard";
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNext(searchParams.get("next"));

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "recovery" | "signup" | "email" | "magiclink" | "email_change",
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  // Expired, already used, or opened in a different browser from the one that
  // asked. Send them somewhere that explains it rather than a blank failure.
  const failed = next === "/reset-password" ? "/reset-password?expired=1" : "/login?link=expired";
  return NextResponse.redirect(`${origin}${failed}`);
}
