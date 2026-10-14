"use client";

import { useState } from "react";

type Reward = { code: string; used: boolean };

/**
 * The learner's own referral panel: their link, how it's going, and any
 * discount codes they have earned.
 *
 * Deliberately honest about the condition. "Invite a friend, get 10% off"
 * with the purchase requirement buried is the kind of promise that produces
 * a support complaint rather than a referral, so the rule is in the first
 * sentence a learner reads.
 */
export default function ReferralCard({
  shareUrl,
  invited,
  qualified,
  rewards,
}: {
  shareUrl: string;
  invited: number;
  qualified: number;
  rewards: Reward[];
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context, or permission refused). The
      // link is on screen in a selectable field, so there is still a way.
    }
  }

  const unusedRewards = rewards.filter((r) => !r.used);
  // Someone the link brought in who hasn't bought yet. Worth naming, because
  // it is the difference between "nothing is happening" and "nearly there".
  const pending = invited - qualified;

  return (
    <div className="card p-6 mb-10">
      <h2 className="font-semibold mb-1">Invite a friend, get 10% off</h2>
      <p className="text-sm text-[var(--muted)] mb-5">
        Share your link. When someone signs up through it and buys their first Learning Path, you
        get a 10% discount code to use on your next one.
      </p>

      <label className="field-label" htmlFor="referral-link">
        Your link
      </label>
      <div className="flex gap-2 mb-5">
        <input
          id="referral-link"
          className="field-input flex-1 font-mono text-xs"
          value={shareUrl}
          readOnly
          onFocus={(e) => e.currentTarget.select()}
        />
        <button type="button" onClick={handleCopy} className="btn btn-secondary whitespace-nowrap">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="flex gap-6 text-sm mb-1">
        <div>
          <span className="font-semibold text-base">{invited}</span>{" "}
          <span className="text-[var(--muted)]">signed up</span>
        </div>
        <div>
          <span className="font-semibold text-base">{qualified}</span>{" "}
          <span className="text-[var(--muted)]">bought a Learning Path</span>
        </div>
      </div>
      {pending > 0 && (
        <p className="text-xs text-[var(--muted)]">
          {pending === 1
            ? "1 person has signed up but not bought yet — your discount unlocks when they do."
            : `${pending} people have signed up but not bought yet — a discount unlocks for each one who does.`}
        </p>
      )}

      {rewards.length > 0 && (
        <div className="mt-5 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-medium mb-2">
            {unusedRewards.length > 0 ? "Your discount codes" : "Discount codes you've used"}
          </p>
          <div className="flex flex-wrap gap-2">
            {rewards.map((reward) => (
              <span
                key={reward.code}
                className="font-mono text-sm px-2.5 py-1 rounded-md"
                style={
                  reward.used
                    ? {
                        background: "var(--surface)",
                        color: "var(--muted)",
                        textDecoration: "line-through",
                      }
                    : {
                        background: "var(--background)",
                        border: "1px dashed var(--primary)",
                        color: "var(--primary)",
                      }
                }
              >
                {reward.code}
              </span>
            ))}
          </div>
          {unusedRewards.length > 0 && (
            <p className="text-xs text-[var(--muted)] mt-2">
              Enter {unusedRewards.length === 1 ? "it" : "one"} at checkout. Each code works once.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
