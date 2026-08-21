import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

// Public — no login required, this is a lead-capture form, not an
// authenticated action. RLS on instructor_applications has no anon/
// authenticated policies at all, so this route (service role) is the
// only way in.
const applicationSchema = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(255),
  topic: z.string().trim().min(1).max(200),
  message: z.string().trim().max(2000).default(""),
  // Honeypot: a real browser never fills this hidden field in; a bot that
  // fills every field will trip it.
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { name, email, topic, message } = parsed.data;
  const admin = createAdminClient();
  const { error } = await admin.from("instructor_applications").insert({ name, email, topic, message });
  if (error) return NextResponse.json({ error: "Could not submit — please try again." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
