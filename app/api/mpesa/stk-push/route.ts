import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initiateStkPush, normalizeKenyanPhone } from "@/lib/mpesa";
import { MPESA_PRICES_KES } from "@/lib/pricing";

const bodySchema = z.object({
  plan: z.enum(["monthly", "annual"]),
  phone: z.string().min(9),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const { plan } = parsed.data;

  let phone: string;
  try {
    phone = normalizeKenyanPhone(parsed.data.phone);
  } catch {
    return NextResponse.json({ error: "invalid_phone_number" }, { status: 400 });
  }

  const amountKes = MPESA_PRICES_KES[plan];
  const admin = createAdminClient();

  const { data: tx, error: insertError } = await admin
    .from("mpesa_transactions")
    .insert({ user_id: user.id, plan, amount_kes: amountKes, phone, status: "pending" })
    .select()
    .single();
  if (insertError || !tx) {
    return NextResponse.json({ error: "transaction_create_failed" }, { status: 500 });
  }

  try {
    const stk = await initiateStkPush({
      phone,
      amountKes,
      accountReference: `SkillForge-${user.id.slice(0, 8)}`,
      transactionDesc: `SkillForge ${plan} plan`,
    });

    await admin
      .from("mpesa_transactions")
      .update({
        merchant_request_id: stk.MerchantRequestID,
        checkout_request_id: stk.CheckoutRequestID,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tx.id);
    await admin.from("profiles").update({ mpesa_phone: phone }).eq("id", user.id);

    return NextResponse.json({
      transactionId: tx.id,
      checkoutRequestId: stk.CheckoutRequestID,
      customerMessage: stk.CustomerMessage,
    });
  } catch (err) {
    console.error("STK push failed", err);
    await admin
      .from("mpesa_transactions")
      .update({
        status: "failed",
        result_desc: err instanceof Error ? err.message : "STK push failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", tx.id);
    return NextResponse.json({ error: "stk_push_failed" }, { status: 502 });
  }
}
