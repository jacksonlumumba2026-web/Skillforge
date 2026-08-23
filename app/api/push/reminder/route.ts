import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24-hour)."),
  enabled: z.boolean(),
});

// Caller's own client — study_reminders_upsert_own/update_own already
// require auth.uid() = user_id.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { error } = await supabase.from("study_reminders").upsert(
    {
      user_id: user.id,
      reminder_time: `${parsed.data.reminderTime}:00`,
      enabled: parsed.data.enabled,
    },
    { onConflict: "user_id" },
  );
  if (error) return NextResponse.json({ error: "Could not save reminder." }, { status: 400 });

  return NextResponse.json({ ok: true });
}
