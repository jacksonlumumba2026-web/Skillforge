import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getPublishedCourses } from "@/lib/courses";
import CourseCard from "@/components/CourseCard";
import CourseFilters from "./CourseFilters";
import type { CourseCategory } from "@/lib/types";

const VALID_CATEGORIES: CourseCategory[] = [
  "business-freelancing",
  "marketing-growth",
  "design-creative",
  "tech-programming",
  "productivity-tools",
];

export const metadata: Metadata = {
  title: "Learning Paths",
  description:
    "Browse practical digital skills Learning Paths — web development, digital marketing, design, freelancing, and more.",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const search = q ?? "";
  const validCategory = VALID_CATEGORIES.includes(category as CourseCategory)
    ? (category as CourseCategory)
    : "";

  const supabase = await createClient();
  const courses = await getPublishedCourses(supabase, {
    search: search || undefined,
    category: validCategory || undefined,
  });
  const isFiltered = Boolean(search || validCategory);

  return (
    <div className="container-page py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">Learning Paths</h1>
        <p className="text-[var(--muted)]">
          Practical, beginner-friendly Learning Paths to help you build real digital skills.
        </p>
      </div>

      <CourseFilters initialSearch={search} initialCategory={validCategory} />

      {courses.length === 0 ? (
        <p className="text-center text-[var(--muted)]">
          {isFiltered ? "No Learning Paths match your search." : "No Learning Paths available yet."}
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      <p className="text-center text-[var(--muted)] mt-12">
        Can&apos;t find what you want to learn?{" "}
        <Link href="/courses/request" className="font-medium" style={{ color: "var(--primary)" }}>
          Request a Learning Path
        </Link>
      </p>
    </div>
  );
}
