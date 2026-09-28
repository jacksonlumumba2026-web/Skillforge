"use client";

import { useState } from "react";
import type { KnowledgeCheckQuestion } from "@/lib/types";

/**
 * Options are displayed in a shuffled order, not the order they are stored in.
 *
 * Across the catalogue the correct answer sits first in about two thirds of
 * questions — a natural consequence of writing the right answer first and the
 * distractors after it. Rendered in stored order that makes "tap the first
 * one" a winning strategy, and a self-check you can pass without reading is
 * not a self-check.
 *
 * The permutation is derived from the question text, so it is the SAME on the
 * server and in the browser (no hydration mismatch) and stable across
 * re-renders, while differing from question to question.
 */
function seededOrder(seed: string, length: number): number[] {
  // FNV-1a, enough mixing for a display permutation and identical everywhere.
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  const order = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0;
    // Take the HIGH bits: an LCG's low bits cycle short, and `hash % (i + 1)`
    // on them left the stored first option landing first twice as often as it
    // should — most of the bias this is meant to remove.
    const j = Math.floor((hash / 0x100000000) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Self-check only — nothing here is scored or saved. Per the curriculum
// spec: "Later we will implement the actual assessment system." This is
// just a way for a learner to test their own understanding right now.
export default function KnowledgeCheck({ questions }: { questions: KnowledgeCheckQuestion[] }) {
  const [selected, setSelected] = useState<Record<number, number>>({});

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => {
        // Stored indexes throughout — only the display order changes, so
        // correct_index keeps meaning what it says in the database.
        const pickedIndex = selected[qi];
        const answered = pickedIndex !== undefined;
        const order = seededOrder(q.question, q.options.length);
        return (
          <div key={qi}>
            <p className="text-sm font-medium mb-2">{q.question}</p>
            <div className="space-y-1.5">
              {order.map((oi) => {
                const option = q.options[oi];
                const isPicked = pickedIndex === oi;
                const isCorrect = oi === q.correct_index;
                let style: React.CSSProperties = { borderColor: "var(--border)" };
                if (answered && isCorrect) {
                  style = { borderColor: "var(--success)", background: "var(--surface)" };
                } else if (answered && isPicked && !isCorrect) {
                  style = { borderColor: "#dc2626", background: "var(--surface)" };
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={answered}
                    onClick={() => setSelected((s) => ({ ...s, [qi]: oi }))}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg border"
                    style={style}
                  >
                    {option}
                    {answered && isCorrect && " ✓"}
                    {answered && isPicked && !isCorrect && " ✗"}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
