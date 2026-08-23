import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

const updateSchema = z.object({
  title: z.string().trim().min(3).max(150).optional(),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(150)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only.")
    .optional(),
  description: z.string().trim().min(1).max(2000).optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  category: z
    .enum(["business-freelancing", "marketing-growth", "design-creative", "tech-programming", "productivity-tools"])
    .nullable()
    .optional(),
  price: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
  display_order: z.number().int().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("courses").update(parsed.data).eq("id", courseId);
  if (error) {
    const message = error.code === "23505" ? "A course with that slug already exists." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();

  // Deleting cascades to modules/lessons/enrollments/payments — never do
  // that to a course real learners have paid for or enrolled in. Unpublish
  // instead so their access and payment history stay intact.
  const { count: enrollmentCount } = await admin
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);
  const { count: paymentCount } = await admin
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);
  if ((enrollmentCount ?? 0) > 0 || (paymentCount ?? 0) > 0) {
    return NextResponse.json(
      { error: "This course has real enrollments or payments — unpublish it instead of deleting." },
      { status: 400 },
    );
  }

  const { error } = await admin.from("courses").delete().eq("id", courseId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
