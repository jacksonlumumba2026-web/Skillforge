import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

const updateSchema = z.object({
  banned: z.boolean(),
});

// Bans/unbans via Supabase Auth's own ban_duration — reversible, and
// doesn't touch the account, enrollments, payments, or certificates at
// all, unlike deleting the user would. A banned user simply can't sign in.
export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (userId === auth.userId) {
    return NextResponse.json({ error: "You can't ban your own account." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    // Supabase has no literal "forever" — 100 years reads as permanent for
    // this platform's purposes; "none" clears the ban.
    ban_duration: parsed.data.banned ? "876600h" : "none",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
