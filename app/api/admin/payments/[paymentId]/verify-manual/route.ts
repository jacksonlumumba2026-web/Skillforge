import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

// Audit-only — marks a manual M-Pesa payment as checked against the real
// M-Pesa statement. Access was already granted at submission time; this
// doesn't change that. Use the existing refund tool if a code turns out
// to be fake or reused.
export async function POST(_request: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("id, provider")
    .eq("id", paymentId)
    .maybeSingle();
  if (!payment || payment.provider !== "mpesa_manual") {
    return NextResponse.json({ error: "Not a manual M-Pesa payment." }, { status: 400 });
  }

  const { error } = await admin
    .from("payments")
    .update({ manual_verified_at: new Date().toISOString() })
    .eq("id", paymentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
