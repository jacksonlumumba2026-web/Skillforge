import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getOrCreatePath } from "@/lib/path-generator";
import { hasActiveAccess } from "@/lib/access";

const bodySchema = z.object({
  skillId: z.string().uuid(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("trial_ends_at, current_period_end")
    .eq("id", user.id)
    .single();
  if (!hasActiveAccess(profile)) {
    return NextResponse.json({ error: "subscription_required" }, { status: 402 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body", details: parsed.error.flatten() }, { status: 400 });
  }
  const { skillId, level } = parsed.data;

  const { data: skill } = await supabase.from("skills").select("*").eq("id", skillId).single();
  if (!skill) return NextResponse.json({ error: "skill_not_found" }, { status: 404 });

  try {
    const { path } = await getOrCreatePath(skill, level);

    const { error: enrollError } = await supabase
      .from("user_paths")
      .upsert(
        { user_id: user.id, path_id: path.id },
        { onConflict: "user_id,path_id", ignoreDuplicates: true },
      );
    if (enrollError) throw enrollError;

    return NextResponse.json({ pathId: path.id });
  } catch (err) {
    console.error("path generation failed", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
