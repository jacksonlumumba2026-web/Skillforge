import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({ pathId: z.string().uuid() });

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const { pathId } = parsed.data;

  const { count: totalSteps } = await supabase
    .from("path_steps")
    .select("id", { count: "exact", head: true })
    .eq("path_id", pathId);
  const { count: completedSteps } = await supabase
    .from("step_progress")
    .select("id, path_steps!inner(path_id)", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("path_steps.path_id", pathId);

  if (!totalSteps || completedSteps !== totalSteps) {
    return NextResponse.json({ error: "path_not_complete" }, { status: 409 });
  }

  const { data: cert, error } = await supabase
    .from("certificates")
    .upsert(
      { user_id: user.id, path_id: pathId },
      { onConflict: "user_id,path_id", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "issue_failed" }, { status: 500 });

  const certificateId =
    cert?.id ??
    (
      await supabase
        .from("certificates")
        .select("id")
        .eq("user_id", user.id)
        .eq("path_id", pathId)
        .single()
    ).data?.id;

  return NextResponse.json({ certificateId });
}
