import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

const updateSchema = z.object({
  active: z.boolean(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ discountCodeId: string }> }) {
  const { discountCodeId } = await params;
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("discount_codes")
    .update({ active: parsed.data.active })
    .eq("id", discountCodeId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
