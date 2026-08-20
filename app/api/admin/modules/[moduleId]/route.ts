import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(2000).optional(),
  order_number: z.number().int().min(1).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("modules").update(parsed.data).eq("id", moduleId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();

  // Deleting cascades to this module's lessons, and their lesson_progress —
  // don't erase a learner's completion history.
  const { data: lessons } = await admin.from("lessons").select("id").eq("module_id", moduleId);
  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length > 0) {
    const { count } = await admin
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .in("lesson_id", lessonIds);
    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Learners have progress on lessons in this module — edit instead of deleting." },
        { status: 400 },
      );
    }
  }

  const { error } = await admin.from("modules").delete().eq("id", moduleId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
