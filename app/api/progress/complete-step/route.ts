import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { nextStreakCount } from "@/lib/streak";

const bodySchema = z.object({
  stepId: z.string().uuid(),
  pathId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const { stepId, pathId } = parsed.data;

  const { data: step } = await supabase
    .from("path_steps")
    .select("id, order_index, path_id")
    .eq("id", stepId)
    .single();
  if (!step || step.path_id !== pathId) {
    return NextResponse.json({ error: "step_not_found" }, { status: 404 });
  }

  const { error: progressError } = await supabase
    .from("step_progress")
    .upsert({ user_id: user.id, step_id: stepId }, { onConflict: "user_id,step_id", ignoreDuplicates: true });
  if (progressError) {
    return NextResponse.json({ error: "progress_write_failed" }, { status: 500 });
  }

  const { data: userPath } = await supabase
    .from("user_paths")
    .select("*")
    .eq("user_id", user.id)
    .eq("path_id", pathId)
    .single();
  if (!userPath) return NextResponse.json({ error: "not_enrolled" }, { status: 404 });

  const { count: totalSteps } = await supabase
    .from("path_steps")
    .select("id", { count: "exact", head: true })
    .eq("path_id", pathId);
  const { count: completedSteps } = await supabase
    .from("step_progress")
    .select("id, path_steps!inner(path_id)", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("path_steps.path_id", pathId);

  const isComplete = (totalSteps ?? 0) > 0 && completedSteps === totalSteps;
  const streakCount = nextStreakCount(userPath.last_activity_at, userPath.streak_count);

  const { data: updatedUserPath, error: updateError } = await supabase
    .from("user_paths")
    .update({
      current_step: Math.max(userPath.current_step, step.order_index + 1),
      last_activity_at: new Date().toISOString(),
      streak_count: streakCount,
      completed_at: isComplete ? (userPath.completed_at ?? new Date().toISOString()) : null,
    })
    .eq("id", userPath.id)
    .select()
    .single();
  if (updateError) return NextResponse.json({ error: "update_failed" }, { status: 500 });

  let certificateId: string | null = null;
  if (isComplete) {
    const { data: cert } = await supabase
      .from("certificates")
      .upsert(
        { user_id: user.id, path_id: pathId },
        { onConflict: "user_id,path_id", ignoreDuplicates: true },
      )
      .select("id")
      .maybeSingle();
    if (cert) {
      certificateId = cert.id;
    } else {
      const { data: existingCert } = await supabase
        .from("certificates")
        .select("id")
        .eq("user_id", user.id)
        .eq("path_id", pathId)
        .single();
      certificateId = existingCert?.id ?? null;
    }
  }

  return NextResponse.json({ userPath: updatedUserPath, isComplete, certificateId });
}
