import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();
  const hasAccess =
    profile?.subscription_status === "trialing" || profile?.subscription_status === "active";
  if (!hasAccess) redirect("/billing?required=1");

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="min-h-screen relative">
      <div className="bg-glow" />
      <div className="grain" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="tag">Let&apos;s get started</span>
          <h1 className="text-3xl sm:text-4xl mt-3 mb-3">What do you want to master?</h1>
          <p className="text-[var(--text-2)]">
            Pick a skill and your current level — we&apos;ll build your path instantly.
          </p>
        </div>
        <OnboardingForm skills={skills ?? []} />
      </div>
    </div>
  );
}
