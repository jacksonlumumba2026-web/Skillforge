"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types/database";
import type { AccessState } from "@/lib/access";
import { daysLeft } from "@/lib/access";
import { MPESA_PRICES_KES as PRICES_KES } from "@/lib/pricing";

type FlowState = "idle" | "requesting" | "waiting" | "success" | "error";

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 30; // ~90s

export default function MpesaPanel({
  profile,
  state,
}: {
  profile: Profile | null;
  state: AccessState;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [phone, setPhone] = useState(profile?.mpesa_phone ?? "");
  const [flow, setFlow] = useState<FlowState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const pollAttempts = useRef(0);

  const trialDays = state === "trialing" ? daysLeft(profile?.trial_ends_at ?? null) : null;
  const periodDays = state === "active" ? daysLeft(profile?.current_period_end ?? null) : null;

  async function poll(checkoutRequestId: string) {
    pollAttempts.current += 1;
    const res = await fetch(`/api/mpesa/status?checkoutRequestId=${checkoutRequestId}`);
    const data = await res.json();

    if (data.status === "success") {
      setFlow("success");
      setMessage("Payment received — your access is active.");
      router.refresh();
      return;
    }
    if (data.status === "failed" || data.status === "cancelled") {
      setFlow("error");
      setMessage(data.result_desc || "Payment wasn't completed. Please try again.");
      return;
    }
    if (pollAttempts.current >= POLL_MAX_ATTEMPTS) {
      setFlow("error");
      setMessage("We didn't hear back in time. If you approved the prompt, refresh in a minute — otherwise try again.");
      return;
    }
    setTimeout(() => poll(checkoutRequestId), POLL_INTERVAL_MS);
  }

  async function payWithMpesa() {
    if (!phone.trim()) {
      setFlow("error");
      setMessage("Enter the M-Pesa phone number to pay with.");
      return;
    }
    setFlow("requesting");
    setMessage(null);
    pollAttempts.current = 0;

    try {
      const res = await fetch("/api/mpesa/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFlow("error");
        setMessage(
          data.error === "invalid_phone_number"
            ? "That doesn't look like a valid Safaricom number."
            : "Couldn't start the M-Pesa payment. Please try again.",
        );
        return;
      }
      setFlow("waiting");
      setMessage("Check your phone and enter your M-Pesa PIN to approve the payment.");
      setTimeout(() => poll(data.checkoutRequestId), POLL_INTERVAL_MS);
    } catch {
      setFlow("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="space-y-8">
      {state !== "expired" && (
        <div className="card text-center" style={{ borderColor: state === "active" ? "var(--success)" : undefined }}>
          <div className="tag mb-2">{state === "active" ? "Active" : "Free trial"}</div>
          <p className="text-[var(--text-2)] text-sm">
            {state === "trialing" && `${trialDays} day${trialDays === 1 ? "" : "s"} left in your free trial.`}
            {state === "active" && `${periodDays} day${periodDays === 1 ? "" : "s"} left in your current period.`}
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {(["monthly", "annual"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlan(p)}
            className="card card-hover text-left"
            style={{
              borderColor: plan === p ? "var(--accent-1)" : undefined,
              background: plan === p ? "var(--surface-hover)" : undefined,
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 10, display: "flex", alignItems: "center",
              justifyContent: "center", background: "var(--grad-main)", marginBottom: 22, fontSize: "1.35rem",
            }}>
              {p === "monthly" ? "🎓" : "🚀"}
            </div>
            <h3 className="text-lg mb-2 capitalize">{p}</h3>
            <p className="text-sm text-[var(--text-2)] mb-4">
              {p === "monthly" ? "Full access, renews every 30 days." : "Full access for a full year — 2 months free."}
            </p>
            <div className="text-3xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              KSh {PRICES_KES[p].toLocaleString()}
            </div>
            <div className="text-xs text-[var(--text-3)] mt-1">
              {p === "monthly" ? "per month" : "per year"}
            </div>
          </button>
        ))}
      </div>

      <div className="max-w-md mx-auto">
        <label className="field-label" htmlFor="phone">
          M-Pesa phone number
        </label>
        <input
          id="phone"
          className="field-input mb-4"
          type="tel"
          placeholder="07XX XXX XXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={flow === "requesting" || flow === "waiting"}
        />

        {message && (
          <p
            className="text-sm mb-4"
            style={{ color: flow === "error" ? "var(--danger)" : "var(--text-2)" }}
          >
            {message}
          </p>
        )}

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={payWithMpesa}
          disabled={flow === "requesting" || flow === "waiting"}
        >
          {flow === "requesting" && "Sending prompt…"}
          {flow === "waiting" && "Waiting for approval…"}
          {(flow === "idle" || flow === "error" || flow === "success") &&
            `Pay KSh ${PRICES_KES[plan].toLocaleString()} with M-Pesa`}
        </button>
      </div>
    </div>
  );
}
