import Link from "next/link";
import { COURSE_CATEGORY_LABEL, type CourseWithLessonCount } from "@/lib/courses";
import StarRating from "@/components/StarRating";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function CourseCard({ course }: { course: CourseWithLessonCount }) {
  return (
    // The whole card is the link rather than a button at the bottom: it is a
    // far bigger tap target on a phone, which is where nearly all of this
    // audience browses from.
    <Link href={`/courses/${course.id}`} className="card p-6 flex flex-col hover:border-[var(--primary)] transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        {course.category && (
          <span
            className="text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: "var(--primary)" }}
          >
            {COURSE_CATEGORY_LABEL[course.category]}
          </span>
        )}
        <span className="text-[11px] text-[var(--muted)] whitespace-nowrap">
          {course.has_career_path ? "Beginner → Professional" : LEVEL_LABEL[course.level] ?? course.level}
        </span>
      </div>

      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
      {course.averageRating !== null && (
        <div className="mb-2">
          <StarRating rating={course.averageRating} reviewCount={course.reviewCount} />
        </div>
      )}
      <p className="text-sm text-[var(--muted)] mb-5 flex-1 line-clamp-3">{course.description}</p>

      <div className="flex items-center justify-between text-sm text-[var(--muted)] mb-2">
        <span>
          {course.lessonCount} lesson{course.lessonCount === 1 ? "" : "s"}
          {course.levelCount > 1 && ` · ${course.levelCount} levels`}
        </span>
        <span className="font-semibold" style={{ color: "var(--primary)" }}>
          KSh {course.price.toLocaleString()}
        </span>
      </div>

      {/* Depth, stated plainly. Written material varies across the catalog
          while the deepening pass works through it, so a buyer sees what
          they are getting rather than assuming every lesson is the same. */}
      <p className="text-xs text-[var(--muted)]">
        {course.guidedLessonCount === 0
          ? "Curated video lessons"
          : course.guidedLessonCount === course.lessonCount
            ? "Every lesson has written notes, a practice task and a knowledge check"
            : `${course.guidedLessonCount} with written notes, practice tasks and knowledge checks`}
      </p>
    </Link>
  );
}
