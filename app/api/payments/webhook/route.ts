import { NextResponse } from "next/server";
import { isValidWebhookSignature } from "@/lib/paystack";
import { finalizePayment } from "@/lib/payments";

// Verifies Paystack webhook events and creates the enrollment on successful
// payment. Always re-verifies with Paystack directly rather than trusting
// this payload — the signature only proves the request came from Paystack,
// not that the transaction itself is genuinely successful.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!isValidWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.event === "charge.success" && event.data?.reference) {
    await finalizePayment(event.data.reference);
  }

  return NextResponse.json({ received: true });
}
