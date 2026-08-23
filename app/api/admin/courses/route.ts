import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

const courseSchema = z.object({
  title: z.string().trim().min(3).max(150),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(150)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only."),
  description: z.string().trim().min(1).max(2000),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  category: z
    .enum(["business-freelancing", "marketing-growth", "design-creative", "tech-programming", "productivity-tools"])
    .nullable()
    .default(null),
  price: z.number().int().min(0),
  published: z.boolean().default(false),
  display_order: z.number().int().default(0),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = courseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: course, error } = await admin
    .from("courses")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) {
    const message = error.code === "23505" ? "A course with that slug already exists." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ id: course.id });
}
