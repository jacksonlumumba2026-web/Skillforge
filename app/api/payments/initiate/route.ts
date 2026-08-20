import { NextResponse } from "next/server";

// Starts a Paystack transaction for a course purchase. Implemented in Phase 4.
export async function POST() {
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
