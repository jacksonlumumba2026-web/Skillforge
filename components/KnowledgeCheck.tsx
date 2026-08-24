"use client";

import { useState } from "react";
import type { KnowledgeCheckQuestion } from "@/lib/types";

// Self-check only — nothing here is scored or saved. Per the curriculum
// spec: "Later we will implement the actual assessment system." This is
// just a way for a learner to test their own understanding right now.
export default function KnowledgeCheck({ questions }: { questions: KnowledgeCheckQuestion[] }) {
  const [selected, setSelected] = useState<Record<number, number>>({});

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => {
        const pickedIndex = selected[qi];
        const answered = pickedIndex !== undefined;
        return (
          <div key={qi}>
            <p className="text-sm font-medium mb-2">{q.question}</p>
            <div className="space-y-1.5">
              {q.options.map((option, oi) => {
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
