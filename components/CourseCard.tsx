import Link from "next/link";
import type { CourseWithLessonCount } from "@/lib/courses";
import StarRating from "@/components/StarRating";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function CourseCard({ course }: { course: CourseWithLessonCount }) {
  return (
    <div className="card p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "var(--surface)", color: "var(--muted)" }}
        >
          {course.has_career_path ? "Beginner → Professional" : LEVEL_LABEL[course.level] ?? course.level}
        </span>
      </div>

      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
      {course.averageRating !== null && (
        <div className="mb-2">
          <StarRating rating={course.averageRating} reviewCount={course.reviewCount} />
        </div>
      )}
      <p className="text-sm text-[var(--muted)] mb-5 flex-1">{course.description}</p>

      <div className="flex items-center justify-between text-sm text-[var(--muted)] mb-5">
        <span>
          {course.lessonCount} lesson{course.lessonCount === 1 ? "" : "s"}
        </span>
        <span className="font-semibold text-[var(--foreground)]">
          KSh {course.price.toLocaleString()}
        </span>
      </div>

      <Link href={`/courses/${course.id}`} className="btn btn-secondary w-full">
        View Course
      </Link>
    </div>
  );
}
