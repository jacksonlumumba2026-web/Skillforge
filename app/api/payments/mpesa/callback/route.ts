import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { finalizeMpesaPayment } from "@/lib/payments";

type StkCallbackItem = { Name: string; Value: string | number };

// Safaricom's async result push for an STK Push request. Unlike Paystack's
// webhook this carries no signature to verify, so we never trust its
// ResultCode alone — finalizeMpesaPayment() re-queries Safaricom directly
// before marking a payment successful. We still always respond with
// ResultCode 0 here so Safaricom stops retrying the callback.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const callback = body?.Body?.stkCallback;
  const checkoutRequestId: string | undefined = callback?.CheckoutRequestID;

  if (!checkoutRequestId) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const items: StkCallbackItem[] = callback?.CallbackMetadata?.Item ?? [];
  const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value;
  if (typeof receipt === "string") {
    const admin = createAdminClient();
    await admin
      .from("payments")
      .update({ mpesa_receipt: receipt })
      .eq("checkout_request_id", checkoutRequestId);
  }

  await finalizeMpesaPayment(checkoutRequestId);

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
