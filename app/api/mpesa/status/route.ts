import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const checkoutRequestId = new URL(request.url).searchParams.get("checkoutRequestId");
  if (!checkoutRequestId) return NextResponse.json({ error: "missing_checkout_request_id" }, { status: 400 });

  // RLS scopes this to the caller's own transactions.
  const { data: tx } = await supabase
    .from("mpesa_transactions")
    .select("status, result_desc, mpesa_receipt_number")
    .eq("checkout_request_id", checkoutRequestId)
    .single();

  if (!tx) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(tx);
}
