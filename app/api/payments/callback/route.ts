import { NextResponse } from "next/server";
import { finalizePayment } from "@/lib/payments";

// Paystack redirects the browser here after checkout. The webhook is the
// authoritative path, but it can be delayed, so this also verifies and
// finalizes directly — finalizePayment is idempotent, so whichever of the
// two runs first wins and the other is a no-op.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(`${origin}/courses?payment=error`);
  }

  const result = await finalizePayment(reference);
  if (!result.ok) {
    return NextResponse.redirect(`${origin}/courses?payment=error`);
  }

  return NextResponse.redirect(`${origin}/courses/${result.courseId}?payment=success`);
}
