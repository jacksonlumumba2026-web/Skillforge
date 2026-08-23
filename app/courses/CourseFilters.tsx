"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COURSE_CATEGORY_LABEL } from "@/lib/courses";
import type { CourseCategory } from "@/lib/types";

const CATEGORIES = Object.keys(COURSE_CATEGORY_LABEL) as CourseCategory[];

export default function CourseFilters({
  initialSearch,
  initialCategory,
}: {
  initialSearch: string;
  initialCategory: CourseCategory | "";
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);

  function applyFilters(nextSearch: string, nextCategory: CourseCategory | "") {
    const params = new URLSearchParams();
    if (nextSearch.trim()) params.set("q", nextSearch.trim());
    if (nextCategory) params.set("category", nextCategory);
    router.push(params.toString() ? `/courses?${params.toString()}` : "/courses");
  }

  return (
    <div className="mb-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters(search, initialCategory);
        }}
        className="flex gap-3 mb-4"
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses…"
          className="field-input flex-1"
        />
        <button type="submit" className="btn btn-secondary">
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyFilters(search, "")}
          className="text-xs font-semibold px-3 py-1.5 rounded-full transition-opacity"
          style={{
            background: initialCategory === "" ? "var(--primary)" : "var(--surface)",
            color: initialCategory === "" ? "var(--primary-foreground, #fff)" : "var(--muted)",
          }}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => applyFilters(search, cat)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-opacity"
            style={{
              background: initialCategory === cat ? "var(--primary)" : "var(--surface)",
              color: initialCategory === cat ? "var(--primary-foreground, #fff)" : "var(--muted)",
            }}
          >
            {COURSE_CATEGORY_LABEL[cat]}
          </button>
        ))}
      </div>
    </div>
  );
}
