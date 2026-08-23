import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

const createSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[A-Za-z0-9-]+$/, "Code can only contain letters, numbers, and hyphens."),
  percentOff: z.number().int().min(1).max(100),
  maxRedemptions: z.number().int().min(1).nullable().default(null),
  expiresAt: z.string().datetime().nullable().default(null),
  note: z.string().trim().max(500).nullable().default(null),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("discount_codes").insert({
    code: parsed.data.code.toUpperCase(),
    percent_off: parsed.data.percentOff,
    max_redemptions: parsed.data.maxRedemptions,
    expires_at: parsed.data.expiresAt,
    note: parsed.data.note,
    created_by: auth.userId,
  });
  if (error) {
    const message = error.code === "23505" ? "A code with that name already exists." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
