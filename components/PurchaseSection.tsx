"use client";

import { useState } from "react";
import Link from "next/link";
import PayButton from "@/components/PayButton";
import SpinWheel from "@/components/SpinWheel";
import { useTranslate } from "@/components/LocaleProvider";
import { BUNDLE_PRICE, BUNDLE_COURSE_COUNT } from "@/lib/pricing";

type Applied = { code: string; percentOff: number; discountedPrice: number };

export default function PurchaseSection({
  courseId,
  price,
}: {
  courseId: string;
  price: number;
}) {
  const t = useTranslate();
  const [showCodeField, setShowCodeField] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applied, setApplied] = useState<Applied | null>(null);

  // The server decides whether a code is valid and what it is worth. The
  // wheel hands a code to this same route rather than discounting anything
  // client-side, so a spun reward is checked exactly like a typed one.
  async function applyCode(rawCode: string) {
    const code = rawCode.trim();
    if (!code) return;
    setApplying(true);
    setApplyError(null);
    const res = await fetch("/api/payments/discount-code/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, code }),
    });
    const data = await res.json();
    setApplying(false);
    if (!res.ok) {
      // A logged-out visitor can spin the wheel but cannot have a code
      // checked, since discounts are one-per-learner and there is no learner
      // yet. Saying "you must be logged in" as if they did something wrong
      // is a poor first interaction — tell them the code is safe instead.
      setApplyError(
        res.status === 401
          ? `Sign in and enter ${code} at checkout to use it.`
          : (data.error ?? "That code didn't work."),
      );
      setApplied(null);
      return;
    }
    setApplied({ code, percentOff: data.percentOff, discountedPrice: data.discountedPrice });
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    await applyCode(codeInput);
  }

  const effectivePrice = applied ? applied.discountedPrice : price;

  return (
    <div className="max-w-xs mx-auto space-y-4">
      {applied && (
        <p className="text-sm p-3 rounded-lg" style={{ background: "var(--surface)", color: "var(--success)" }}>
          {applied.percentOff === 100
            ? "Scholarship code applied — this Learning Path is free for you."
            : `${applied.percentOff}% off applied — KSh ${effectivePrice.toLocaleString()}.`}
        </p>
      )}

      {!applied && <SpinWheel onWin={applyCode} />}

      {/* One button, deliberately. Paystack's own checkout page offers card
          AND M-Pesa, so a second in-app payment button would only duplicate
          what the gateway already does — and the previous in-app M-Pesa
          button was failing before Safaricom ever saw the request. */}
      <PayButton courseId={courseId} price={effectivePrice} discountCode={applied?.code} />

      <p className="text-xs text-[var(--muted)]">{t("purchase.acceptedMethods")}</p>

      <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
        <Link href="/bundle" className="text-sm font-medium" style={{ color: "var(--primary)" }}>
          Or pick any {BUNDLE_COURSE_COUNT} for KSh {BUNDLE_PRICE.toLocaleString()}
        </Link>
        <p className="text-xs text-[var(--muted)] mt-1">
          Choose the {BUNDLE_COURSE_COUNT} that suit you — far cheaper than buying them one at a time.
        </p>
      </div>

      {showCodeField ? (
        <form onSubmit={handleApply} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Discount code"
              className="field-input flex-1"
              disabled={applying || Boolean(applied)}
            />
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={applying || !codeInput.trim() || Boolean(applied)}
            >
              {applying ? "Checking…" : "Apply"}
            </button>
          </div>
          {applyError && <p className="text-xs text-red-600">{applyError}</p>}
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowCodeField(true)}
          className="text-xs font-medium"
          style={{ color: "var(--primary)" }}
        >
          {t("purchase.haveDiscountCode")}
        </button>
      )}

      <p className="text-xs text-[var(--muted)]">
        All sales are final — please review the curriculum above before buying. See our{" "}
        <Link href="/refund-policy" style={{ color: "var(--primary)" }}>
          Refund Policy
        </Link>
        .
      </p>
    </div>
  );
}
