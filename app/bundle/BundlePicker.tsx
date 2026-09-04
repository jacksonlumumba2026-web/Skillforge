"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BUNDLE_PRICE, BUNDLE_COURSE_COUNT } from "@/lib/pricing";
import type { CourseCategory } from "@/lib/types";

type PickableCourse = {
  id: string;
  title: string;
  description: string;
  category: CourseCategory | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  "business-freelancing": "Business & Freelancing",
  "marketing-growth": "Marketing & Growth",
  "design-creative": "Design & Creative",
  "tech-programming": "Tech & Programming",
  "productivity-tools": "Productivity & Tools",
};

export default function BundlePicker({
  courses,
  ownedCourseIds,
  isLoggedIn,
}: {
  courses: PickableCourse[];
  ownedCourseIds: string[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const owned = useMemo(() => new Set(ownedCourseIds), [ownedCourseIds]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = BUNDLE_COURSE_COUNT - selected.size;
  const isComplete = remaining === 0;

  function toggle(id: string) {
    if (owned.has(id)) return;
    setError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < BUNDLE_COURSE_COUNT) {
        next.add(id);
      }
      return next;
    });
  }

  async function handlePay() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/payments/bundle/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseIds: [...selected] }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not start payment. Please try again.");
      setLoading(false);
      return;
    }
    if (data.free) {
      router.push("/dashboard?payment=success");
      router.refresh();
      return;
    }
    // Paystack is an external host, so a full navigation is correct here.
    window.location.href = data.authorizationUrl;
  }

  const visible = category ? courses.filter((c) => c.category === category) : courses;
  const categories = [...new Set(courses.map((c) => c.category).filter(Boolean))] as string[];

  return (
    <div>
      {/* Sticky summary — with a long list, the count and the pay button need
          to stay reachable without scrolling back to the top. */}
      <div
        className="sticky top-0 z-10 py-4 mb-6 -mx-4 px-4"
        style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">
              {selected.size} of {BUNDLE_COURSE_COUNT} chosen
            </p>
            <p className="text-xs text-[var(--muted)]">
              {isComplete
                ? `KSh ${BUNDLE_PRICE.toLocaleString()} for all ${BUNDLE_COURSE_COUNT}`
                : `Choose ${remaining} more`}
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handlePay}
            disabled={!isComplete || loading || !isLoggedIn}
            title={!isLoggedIn ? "Log in to buy a bundle" : undefined}
          >
            {loading ? "Taking you to checkout…" : `Pay Now — KSh ${BUNDLE_PRICE.toLocaleString()}`}
          </button>
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategory("")}
          className="text-xs px-3 py-1.5 rounded-full border"
          style={{
            borderColor: "var(--border)",
            background: category === "" ? "var(--primary)" : "transparent",
            color: category === "" ? "white" : "var(--foreground)",
          }}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="text-xs px-3 py-1.5 rounded-full border"
            style={{
              borderColor: "var(--border)",
              background: category === c ? "var(--primary)" : "transparent",
              color: category === c ? "white" : "var(--foreground)",
            }}
          >
            {CATEGORY_LABELS[c] ?? c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((course) => {
          const isOwned = owned.has(course.id);
          const isSelected = selected.has(course.id);
          const isBlocked = !isOwned && !isSelected && selected.size >= BUNDLE_COURSE_COUNT;
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => toggle(course.id)}
              disabled={isOwned || isBlocked}
              aria-pressed={isSelected}
              className="card p-4 text-left transition-opacity"
              style={{
                borderColor: isSelected ? "var(--primary)" : "var(--border)",
                borderWidth: isSelected ? 2 : 1,
                opacity: isOwned || isBlocked ? 0.5 : 1,
                cursor: isOwned || isBlocked ? "not-allowed" : "pointer",
              }}
            >
              <div className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs"
                  style={{
                    background: isSelected ? "var(--primary)" : "var(--surface)",
                    color: isSelected ? "white" : "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {isSelected ? "✓" : ""}
                </span>
                <div>
                  <p className="font-medium text-sm leading-snug">{course.title}</p>
                  {isOwned && (
                    <p className="text-xs mt-1" style={{ color: "var(--success)" }}>
                      You already own this
                    </p>
                  )}
                  <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{course.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-[var(--muted)] text-center py-8">
          No Learning Paths in that category yet.
        </p>
      )}
    </div>
  );
}
