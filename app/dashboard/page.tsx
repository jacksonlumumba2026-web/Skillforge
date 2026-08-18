import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { accessState, daysLeft, hasActiveAccess } from "@/lib/access";
import AppNav from "@/app/_components/AppNav";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const hasAccess = hasActiveAccess(profile);
  const state = accessState(profile);

  const { data: userPaths } = await supabase
    .from("user_paths")
    .select("*, learning_paths(*, skills(*))")
    .eq("user_id", user.id)
    .order("last_activity_at", { ascending: false });

  const pathCards = await Promise.all(
    (userPaths ?? []).map(async (up) => {
      const path = up.learning_paths as unknown as {
        id: string;
        title: string;
        level: string;
        skills: { name: string; icon: string; category: string };
      };
      const { count: totalSteps } = await supabase
        .from("path_steps")
        .select("id", { count: "exact", head: true })
        .eq("path_id", up.path_id);
      const { count: completedSteps } = await supabase
        .from("step_progress")
        .select("id, path_steps!inner(path_id)", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("path_steps.path_id", up.path_id);

      const total = totalSteps ?? 0;
      const done = completedSteps ?? 0;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      return { userPath: up, path, total, done, pct };
    }),
  );

  const bestStreak = pathCards.reduce((max, p) => Math.max(max, p.userPath.streak_count), 0);
  const trialDays = state === "trialing" ? daysLeft(profile?.trial_ends_at ?? null) : null;

  return (
    <div className="min-h-screen relative">
      <div className="bg-glow" />
      <div className="grain" />
      <AppNav label={profile?.full_name ?? profile?.email ?? undefined} />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {!hasAccess && (
          <div
            className="card mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{ borderColor: "var(--accent-warm)" }}
          >
            <div>
              <div className="font-semibold mb-1">Your free trial has ended</div>
              <p className="text-sm text-[var(--text-2)]">
                Pay with M-Pesa to keep access to every skill path.
              </p>
            </div>
            <Link href="/billing" className="btn btn-primary btn-sm">
              Activate access
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <span className="tag">Your dashboard</span>
            <h1 className="text-3xl sm:text-4xl mt-2">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="card" style={{ padding: "16px 22px", textAlign: "center" }}>
              <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                🔥 {bestStreak}
              </div>
              <div className="text-xs text-[var(--text-3)] mt-1">day streak</div>
            </div>
            {trialDays !== null && (
              <div className="card" style={{ padding: "16px 22px", textAlign: "center" }}>
                <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {trialDays}
                </div>
                <div className="text-xs text-[var(--text-3)] mt-1">trial days left</div>
              </div>
            )}
          </div>
        </div>

        {pathCards.length === 0 ? (
          <div className="glass-panel p-14 text-center">
            <h2 className="text-xl mb-3">You haven&apos;t started a path yet</h2>
            <p className="text-[var(--text-2)] mb-8">
              Pick a skill and your level — SkillForge builds your step-by-step curriculum
              instantly.
            </p>
            <Link href={hasAccess ? "/onboarding" : "/billing"} className="btn btn-primary">
              {hasAccess ? "Choose your first skill →" : "Activate access →"}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {pathCards.map(({ userPath, path, total, done, pct }) => (
              <Link key={userPath.id} href={`/path/${userPath.path_id}`} className="card card-hover block">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-2xl">{path.skills.icon}</div>
                  {userPath.completed_at && (
                    <span className="tag" style={{ color: "var(--success)" }}>
                      Completed
                    </span>
                  )}
                </div>
                <h3 className="text-lg mb-1">{path.title}</h3>
                <p className="text-xs text-[var(--text-3)] mb-4 capitalize">{path.level} level</p>
                <div className="progress-track mb-2">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-[var(--text-3)]">
                  <span>
                    {done} / {total} steps
                  </span>
                  <span>🔥 {userPath.streak_count} day streak</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pathCards.length > 0 && hasAccess && (
          <div className="text-center mt-10">
            <Link href="/onboarding" className="btn btn-ghost">
              + Start another skill path
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
