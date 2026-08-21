"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CourseLevel } from "@/lib/types";

export default function CourseFilters({
  initialSearch,
  initialLevel,
}: {
  initialSearch: string;
  initialLevel: CourseLevel | "";
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [level, setLevel] = useState<CourseLevel | "">(initialLevel);

  function applyFilters(nextSearch: string, nextLevel: CourseLevel | "") {
    const params = new URLSearchParams();
    if (nextSearch.trim()) params.set("q", nextSearch.trim());
    if (nextLevel) params.set("level", nextLevel);
    router.push(params.toString() ? `/courses?${params.toString()}` : "/courses");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        applyFilters(search, level);
      }}
      className="flex flex-col sm:flex-row gap-3 mb-10"
    >
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search courses…"
        className="field-input flex-1"
      />
      <select
        value={level}
        onChange={(e) => {
          const nextLevel = e.target.value as CourseLevel | "";
          setLevel(nextLevel);
          applyFilters(search, nextLevel);
        }}
        className="field-input sm:w-48"
      >
        <option value="">All levels</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <button type="submit" className="btn btn-secondary">
        Search
      </button>
    </form>
  );
}
