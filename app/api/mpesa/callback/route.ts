import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MpesaPlan } from "@/lib/types/database";

interface StkCallbackItem {
  Name: string;
  Value?: string | number;
}

interface StkCallbackBody {
  Body?: {
    stkCallback?: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: { Item: StkCallbackItem[] };
    };
  };
}

const PERIOD_DAYS: Record<MpesaPlan, number> = { monthly: 30, annual: 365 };

// Safaricom expects this exact acknowledgement shape regardless of what we
// did with the payload — anything else gets retried repeatedly.
const ACK = NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

export async function POST(request: Request) {
  let body: StkCallbackBody;
  try {
    body = await request.json();
  } catch {
    return ACK;
  }

  const callback = body.Body?.stkCallback;
  if (!callback?.CheckoutRequestID) return ACK;

  const admin = createAdminClient();
  const { data: tx } = await admin
    .from("mpesa_transactions")
    .select("*")
    .eq("checkout_request_id", callback.CheckoutRequestID)
    .maybeSingle();
  if (!tx) return ACK;

  if (callback.ResultCode === 0) {
    const items = callback.CallbackMetadata?.Item ?? [];
    const get = (name: string) => items.find((i) => i.Name === name)?.Value;
    const receipt = get("MpesaReceiptNumber");

    await admin
      .from("mpesa_transactions")
      .update({
        status: "success",
        mpesa_receipt_number: receipt ? String(receipt) : null,
        result_desc: callback.ResultDesc,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tx.id);

    const { data: profile } = await admin
      .from("profiles")
      .select("current_period_end")
      .eq("id", tx.user_id)
      .single();

    const base =
      profile?.current_period_end && new Date(profile.current_period_end).getTime() > Date.now()
        ? new Date(profile.current_period_end)
        : new Date();
    const periodDays = PERIOD_DAYS[tx.plan];
    const newPeriodEnd = new Date(base.getTime() + periodDays * 86_400_000);

    await admin
      .from("profiles")
      .update({ current_period_end: newPeriodEnd.toISOString(), updated_at: new Date().toISOString() })
      .eq("id", tx.user_id);
  } else {
    const cancelled = callback.ResultCode === 1032;
    await admin
      .from("mpesa_transactions")
      .update({
        status: cancelled ? "cancelled" : "failed",
        result_desc: callback.ResultDesc,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tx.id);
  }

  return ACK;
}
