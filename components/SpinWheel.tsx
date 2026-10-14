"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * "Spin to win" discount reveal.
 *
 * Every segment reads 10% OFF, and that is the point. A wheel showing
 * prizes nobody can land on — 50% off, a free course — while always
 * stopping at 10% is a misrepresented game of chance, which the Consumer
 * Protection Act treats as a misleading representation. Keeping every
 * segment identical preserves the whole feel of the thing (the spin, the
 * slowdown, the reveal) without putting a single untrue claim on screen.
 *
 * If you ever want genuinely different prizes, pick the winner on the
 * SERVER and make every displayed prize one you will honour. Do not pick it
 * in the browser: anyone can read the code and see the odds.
 */

const REWARD_CODE = "SPIN10";
const STORAGE_KEY = "skillpath.spinReward.v1";
const SEGMENTS = 8;

/** localStorage is an external store, so read it through the hook built for
 *  one: no state set during render or in an effect, and a server snapshot
 *  that cannot mismatch on hydration. Nothing mutates it behind our back,
 *  so subscribe is a no-op. */
const subscribeToStorage = () => () => {};
function readStoredReward() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    // Private mode, or storage disabled — they can spin again, which is
    // harmless because the prize never varies.
    return false;
  }
}

export default function SpinWheel({ onWin }: { onWin?: (code: string) => void }) {
  const [spinning, setSpinning] = useState(false);
  const [spunNow, setSpunNow] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const alreadyWon = useSyncExternalStore(subscribeToStorage, readStoredReward, () => false);
  const won = alreadyWon || spunNow;

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleSpin() {
    if (spinning || won) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const finish = () => {
      setSpinning(false);
      setSpunNow(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, REWARD_CODE);
      } catch {
        // Not worth failing the reward over.
      }
      // No handler means a logged-out visitor: reveal the code and let them
      // carry it to checkout. Discounts are one-per-learner, so there is
      // nothing to validate until there is a learner.
      onWin?.(REWARD_CODE);
    };

    if (reducedMotion) {
      finish();
      return;
    }

    setSpinning(true);
    // Five to seven whole turns plus a random landing angle. The angle is
    // cosmetic — every segment carries the same prize.
    const turns = 5 + Math.floor(Math.random() * 3);
    setRotation((r) => r + turns * 360 + Math.floor(Math.random() * 360));
    timer.current = setTimeout(finish, 4000);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(REWARD_CODE);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the code is on screen to type.
    }
  }

  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <p className="text-sm font-semibold mb-1">
        {won ? "You unlocked 10% off" : "Spin for a discount"}
      </p>
      <p className="text-xs text-[var(--muted)] mb-4">
        {won
          ? onWin
            ? "Use this code at checkout."
            : "Sign up and enter it at checkout."
          : "One spin, one discount on this Learning Path."}
      </p>

      <div className="relative mx-auto mb-4" style={{ width: 160, height: 160 }}>
        {/* Pointer */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 z-10"
          style={{
            top: -6,
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "14px solid var(--primary)",
          }}
        />

        <div
          className="w-full h-full rounded-full relative overflow-hidden"
          style={{
            background:
              "conic-gradient(var(--primary) 0 45deg, #1d4ed8 45deg 90deg, var(--primary) 90deg 135deg, #1d4ed8 135deg 180deg, var(--primary) 180deg 225deg, #1d4ed8 225deg 270deg, var(--primary) 270deg 315deg, #1d4ed8 315deg 360deg)",
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          }}
        >
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <span
              key={i}
              className="absolute text-[9px] font-bold text-white"
              style={{
                left: "50%",
                top: "50%",
                transformOrigin: "0 0",
                transform: `rotate(${i * (360 / SEGMENTS) + 22.5}deg) translate(38px, -4px)`,
                whiteSpace: "nowrap",
              }}
            >
              10% OFF
            </span>
          ))}
        </div>
      </div>

      {won ? (
        <div>
          <button
            type="button"
            onClick={handleCopy}
            className="font-mono font-bold text-lg px-3 py-1 rounded-md"
            style={{ background: "var(--background)", border: "1px dashed var(--primary)", color: "var(--primary)" }}
          >
            {REWARD_CODE}
          </button>
          <p className="text-xs text-[var(--muted)] mt-2">
            {copied ? "Copied." : onWin ? "Applied to your order below." : "Tap to copy."}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSpin}
          disabled={spinning}
          className="btn btn-primary w-full"
        >
          {spinning ? "Spinning…" : "Spin"}
        </button>
      )}
    </div>
  );
}
