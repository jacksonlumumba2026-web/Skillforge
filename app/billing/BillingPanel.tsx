"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types/database";

const STATUS_LABEL: Record<string, string> = {
  trialing: "Free trial",
  active: "Active",
  past_due: "Payment past due",
  canceled: "Canceled",
  incomplete: "Incomplete",
};

function daysLeft(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export default function BillingPanel({ profile }: { profile: Profile | null }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function startCheckout(plan: "monthly" | "annual") {
    setLoading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(null);
  }

  async function openPortal() {
    setLoading("portal");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(null);
  }

  if (profile?.subscription_status) {
    const remaining = profile.subscription_status === "trialing" ? daysLeft(profile.trial_ends_at) : null;
    return (
      <div className="glass-panel p-8 max-w-lg mx-auto text-center">
        <div className="tag mb-3">{STATUS_LABEL[profile.subscription_status] ?? profile.subscription_status}</div>
        {remaining !== null && (
          <p className="text-[var(--text-2)] mb-6">
            {remaining} day{remaining === 1 ? "" : "s"} left in your free trial.
          </p>
        )}
        {profile.subscription_status === "past_due" && (
          <p className="text-[var(--danger)] text-sm mb-6">
            Your last payment failed — update your card to keep access.
          </p>
        )}
        <button className="btn btn-primary" onClick={openPortal} disabled={loading === "portal"}>
          {loading === "portal" ? "Opening…" : "Manage billing"}
        </button>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
      <div className="card card-hover">
        <div className="m-icon-box" style={{
          width: 52, height: 52, borderRadius: 10, display: "flex", alignItems: "center",
          justifyContent: "center", background: "var(--grad-main)", marginBottom: 22, fontSize: "1.35rem",
        }}>🎓</div>
        <h3 className="text-lg mb-2">Monthly</h3>
        <p className="text-sm text-[var(--text-2)] mb-4">Full access to every skill path.</p>
        <div className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          $19<span className="text-sm font-normal text-[var(--text-3)]">/mo</span>
        </div>
        <div className="text-xs text-[var(--text-3)] mb-6">after your free 7-day trial</div>
        <button
          className="btn btn-primary btn-block"
          onClick={() => startCheckout("monthly")}
          disabled={loading === "monthly"}
        >
          {loading === "monthly" ? "Redirecting…" : "Start Free Trial"}
        </button>
      </div>
      <div className="card card-hover" style={{ borderColor: "var(--accent-1)" }}>
        <div style={{
          width: 52, height: 52, borderRadius: 10, display: "flex", alignItems: "center",
          justifyContent: "center", background: "var(--grad-main)", marginBottom: 22, fontSize: "1.35rem",
        }}>🚀</div>
        <h3 className="text-lg mb-2">Annual</h3>
        <p className="text-sm text-[var(--text-2)] mb-4">Same access — 2 months free.</p>
        <div className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          $15<span className="text-sm font-normal text-[var(--text-3)]">/mo</span>
        </div>
        <div className="text-xs text-[var(--text-3)] mb-6">billed annually, after trial</div>
        <button
          className="btn btn-primary btn-block"
          onClick={() => startCheckout("annual")}
          disabled={loading === "annual"}
        >
          {loading === "annual" ? "Redirecting…" : "Start Free Trial"}
        </button>
      </div>
    </div>
  );
}
