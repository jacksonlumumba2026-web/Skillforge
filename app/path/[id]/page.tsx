import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/app/_components/AppNav";
import PathPlayer from "./PathPlayer";

export default async function PathPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: pathId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/path/${pathId}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();
  const hasAccess =
    profile?.subscription_status === "trialing" || profile?.subscription_status === "active";

  const { data: path } = await supabase
    .from("learning_paths")
    .select("*, skills(*)")
    .eq("id", pathId)
    .single();
  if (!path) notFound();

  const skill = path.skills as unknown as { name: string; icon: string; category: string };

  if (!hasAccess) {
    return (
      <div className="min-h-screen relative">
        <div className="bg-glow" />
        <div className="grain" />
        <AppNav />
        <main className="relative z-10 max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="glass-panel p-12">
            <div className="text-3xl mb-4">{skill.icon}</div>
            <h1 className="text-2xl mb-3">{path.title}</h1>
            <p className="text-[var(--text-2)] mb-8">
              Start your free trial to unlock every step, video, and checklist in this path.
            </p>
            <Link href="/billing" className="btn btn-primary">
              Start Free Trial →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { data: steps } = await supabase
    .from("path_steps")
    .select("*")
    .eq("path_id", pathId)
    .order("order_index", { ascending: true });

  let { data: userPath } = await supabase
    .from("user_paths")
    .select("*")
    .eq("user_id", user.id)
    .eq("path_id", pathId)
    .maybeSingle();

  if (!userPath) {
    const { data: created } = await supabase
      .from("user_paths")
      .insert({ user_id: user.id, path_id: pathId })
      .select()
      .single();
    userPath = created;
  }

  const stepIds = (steps ?? []).map((s) => s.id);
  const { data: progressRows } = await supabase
    .from("step_progress")
    .select("step_id")
    .eq("user_id", user.id)
    .in("step_id", stepIds.length > 0 ? stepIds : ["00000000-0000-0000-0000-000000000000"]);
  const completedStepIds = (progressRows ?? []).map((r) => r.step_id);

  return (
    <div className="min-h-screen relative">
      <div className="bg-glow" />
      <div className="grain" />
      <AppNav label={path.title} />
      <PathPlayer
        pathId={pathId}
        pathTitle={path.title}
        skillIcon={skill.icon}
        steps={steps ?? []}
        completedStepIds={completedStepIds}
        initialCurrentStep={userPath?.current_step ?? 0}
        isPathComplete={Boolean(userPath?.completed_at)}
      />
    </div>
  );
}
