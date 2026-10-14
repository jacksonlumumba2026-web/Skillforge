import { NextResponse, type NextRequest } from "next/server";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE } from "@/lib/referrals";

/**
 * The share link: /r/ABC12345.
 *
 * It only remembers who sent the visitor and shows them the signup page. The
 * referral itself is recorded later, once there is a real authenticated
 * learner to attach it to — recording anything here would mean trusting a URL
 * that anyone can type.
 *
 * No lookup happens here either, deliberately. Checking the code now would
 * make this endpoint an oracle for guessing valid referral codes, and an
 * invalid one costs nothing: it is dropped silently when the claim runs.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const response = NextResponse.redirect(new URL("/register", request.url));

  // Only the shape a code can actually have. This value is written to a
  // cookie that is later compared against the database, so it is kept to
  // [A-Z0-9] and a sane length rather than storing whatever was in the path.
  const clean = code.trim().toUpperCase();
  if (/^[A-Z0-9]{4,32}$/.test(clean)) {
    response.cookies.set(REFERRAL_COOKIE, clean, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return response;
}
