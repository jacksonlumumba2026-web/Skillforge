import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublishedCourses } from "@/lib/courses";
import CourseCard from "@/components/CourseCard";
import CourseFilters from "./CourseFilters";
import type { CourseLevel } from "@/lib/types";

const VALID_LEVELS: CourseLevel[] = ["beginner", "intermediate", "advanced"];

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; level?: string }>;
}) {
  const { q, level } = await searchParams;
  const search = q ?? "";
  const validLevel = VALID_LEVELS.includes(level as CourseLevel) ? (level as CourseLevel) : "";

  const supabase = await createClient();
  const courses = await getPublishedCourses(supabase, {
    search: search || undefined,
    level: validLevel || undefined,
  });
  const isFiltered = Boolean(search || validLevel);

  return (
    <div className="container-page py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">Courses</h1>
        <p className="text-[var(--muted)]">
          Practical, beginner-friendly courses to help you build real digital skills.
        </p>
      </div>

      <CourseFilters initialSearch={search} initialLevel={validLevel} />

      {courses.length === 0 ? (
        <p className="text-center text-[var(--muted)]">
          {isFiltered ? "No courses match your search." : "No courses available yet."}
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
          Request a course
        </Link>
      </p>
    </div>
  );
}
