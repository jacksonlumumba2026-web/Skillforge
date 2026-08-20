import { NextResponse } from "next/server";

// Verifies Paystack webhook events and creates the enrollment on successful
// payment. This is the only place enrollments are created. Implemented in
// Phase 4.
export async function POST() {
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
