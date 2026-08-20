import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

const moduleSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).default(""),
});

export async function POST(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = moduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { count } = await admin
    .from("modules")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  const { data: courseModule, error } = await admin
    .from("modules")
    .insert({ ...parsed.data, course_id: courseId, order_number: (count ?? 0) + 1 })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ id: courseModule.id });
}
