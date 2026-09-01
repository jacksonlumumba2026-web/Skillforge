"use client";

import { useState } from "react";
import Link from "next/link";
import MpesaPayButton from "@/components/MpesaPayButton";
import PayButton from "@/components/PayButton";
import ManualMpesaPayment from "@/components/ManualMpesaPayment";
import { useTranslate } from "@/components/LocaleProvider";

type Applied = { code: string; percentOff: number; discountedPrice: number };

export default function PurchaseSection({
  courseId,
  price,
  manualMpesaTill,
  manualMpesaSendMoney,
}: {
  courseId: string;
  price: number;
  manualMpesaTill?: { number: string; name: string };
  manualMpesaSendMoney?: { number: string; name: string };
}) {
  const t = useTranslate();
  const [showCodeField, setShowCodeField] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applied, setApplied] = useState<Applied | null>(null);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setApplying(true);
    setApplyError(null);
    const res = await fetch("/api/payments/discount-code/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, code: codeInput }),
    });
    const data = await res.json();
    setApplying(false);
    if (!res.ok) {
      setApplyError(data.error ?? "That code didn't work.");
      setApplied(null);
      return;
    }
    setApplied({ code: codeInput.trim(), percentOff: data.percentOff, discountedPrice: data.discountedPrice });
  }

  const effectivePrice = applied ? applied.discountedPrice : price;

  return (
    <div className="max-w-xs mx-auto space-y-4">
      {/* Mirrors the buttons rendered below -- M-Pesa (STK, or the manual till /
          send-money fallback) and Paystack card. Keep the two in step: a method
          named here that has no button below is a promise the page cannot keep. */}
      <p className="text-xs text-[var(--muted)]">
        {t("purchase.acceptedMethods")}: M-Pesa · Visa · Mastercard
      </p>

      {applied && (
        <p className="text-sm p-3 rounded-lg" style={{ background: "var(--surface)", color: "var(--success)" }}>
          {applied.percentOff === 100
            ? "Scholarship code applied — this course is free for you."
            : `${applied.percentOff}% off applied — KSh ${effectivePrice.toLocaleString()}.`}
        </p>
      )}

      <MpesaPayButton courseId={courseId} price={effectivePrice} discountCode={applied?.code} />
      <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
        <span className="flex-1 h-px" style={{ background: "var(--border)" }} />
        {t("purchase.or")}
        <span className="flex-1 h-px" style={{ background: "var(--border)" }} />
      </div>
      <PayButton courseId={courseId} price={effectivePrice} discountCode={applied?.code} />

      {(manualMpesaTill || manualMpesaSendMoney) && effectivePrice > 0 && (
        <ManualMpesaPayment
          courseId={courseId}
          price={effectivePrice}
          discountCode={applied?.code}
          till={manualMpesaTill}
          sendMoney={manualMpesaSendMoney}
        />
      )}

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
