import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { accessState } from "@/lib/access";
import MpesaPanel from "./MpesaPanel";

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

  const state = accessState(profile);

  return (
    <div className="min-h-screen relative">
      <div className="bg-glow" />
      <div className="grain" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="tag">Billing</span>
          <h1 className="text-3xl sm:text-4xl mt-3 mb-3">
            {state === "expired" ? "Activate your access" : "Your plan"}
          </h1>
          <p className="text-[var(--text-2)]">
            {state === "trialing" && "You're in your free trial — pay anytime to keep access once it ends."}
            {state === "active" && "Manage your M-Pesa plan and renewal."}
            {state === "expired" &&
              "Pay with M-Pesa to unlock every skill path. You'll get an STK push prompt on your phone."}
          </p>
        </div>
        <MpesaPanel profile={profile} state={state} />
      </div>
    </div>
  );
}
