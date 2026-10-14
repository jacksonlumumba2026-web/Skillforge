import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimReferral, REFERRAL_COOKIE } from "@/lib/referrals";

/**
 * The other half of referral capture.
 *
 * /auth/callback handles every learner who arrives through an emailed link
 * or Google. But when Supabase is configured without email confirmation,
 * signUp() returns a session immediately and the browser never visits that
 * route — so the register page calls this instead. Without it, referrals
 * would silently stop working the day confirmation is switched off.
 *
 * Takes no body: the code comes from the httpOnly cookie the share link set,
 * and the learner comes from the session. There is nothing here a caller
 * could forge, which is why posting to it is harmless.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const response = NextResponse.json({ ok: true });

  const pending = request.cookies.get(REFERRAL_COOKIE)?.value;
  if (pending && user) await claimReferral(user.id, pending);
  if (pending) response.cookies.delete(REFERRAL_COOKIE);

  return response;
}
