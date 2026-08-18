import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BillingPanel from "./BillingPanel";

export default async function BillingPage() {
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

  return (
    <div className="min-h-screen relative">
      <div className="bg-glow" />
      <div className="grain" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="tag">Billing</span>
          <h1 className="text-3xl sm:text-4xl mt-3 mb-3">
            {profile?.subscription_status ? "Your plan" : "Start your free trial"}
          </h1>
          <p className="text-[var(--text-2)]">
            {profile?.subscription_status
              ? "Manage your subscription, payment method, and invoices."
              : "7 days free, full access. Add a card to begin — you won't be charged until the trial ends."}
          </p>
        </div>
        <BillingPanel profile={profile} />
      </div>
    </div>
  );
}
