import { NextResponse } from "next/server";
import { isValidWebhookSignature, secretKeyMode } from "@/lib/paystack";
import { finalizePayment } from "@/lib/payments";

// Verifies Paystack webhook events and creates the enrollment on successful
// payment. Always re-verifies with Paystack directly rather than trusting
// this payload — the signature only proves the request came from Paystack,
// not that the transaction itself is genuinely successful.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!isValidWebhookSignature(rawBody, signature)) {
    // Log enough to diagnose without ever touching the secret. The common
    // cause is a mode mismatch: Paystack signs a LIVE charge with the live
    // key, which cannot match a server still holding a test key, so this
    // 401s, finalizePayment() never runs, and the payment stays `pending`
    // forever while the customer has actually been charged. That failure
    // was previously silent -- 10 payments died here unnoticed.
    console.error("[payments/webhook] signature check failed", {
      hasSignatureHeader: Boolean(signature),
      serverKeyMode: secretKeyMode(),
      bodyBytes: rawBody.length,
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.event === "charge.success" && event.data?.reference) {
    await finalizePayment(event.data.reference);
  }

  return NextResponse.json({ received: true });
}
