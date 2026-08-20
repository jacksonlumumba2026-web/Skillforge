import Link from "next/link";
import { formatDuration } from "@/lib/courses";
import type { LessonPreview } from "@/lib/types";

export default function CourseSidebar({
  courseId,
  currentLessonId,
  modules,
  lessonsByModule,
  completedIds,
}: {
  courseId: string;
  currentLessonId: string;
  modules: { id: string; title: string; order_number: number }[];
  lessonsByModule: Map<string, LessonPreview[]>;
  completedIds: Set<string>;
}) {
  return (
    <nav aria-label="Course curriculum" className="space-y-5">
      {modules.map((courseModule) => (
        <div key={courseModule.id}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">
            Module {courseModule.order_number} — {courseModule.title}
          </h2>
          <ul className="space-y-1">
            {(lessonsByModule.get(courseModule.id) ?? []).map((lesson) => {
              const isCurrent = lesson.id === currentLessonId;
              const isDone = completedIds.has(lesson.id);
              const duration = lesson.duration_seconds ? formatDuration(lesson.duration_seconds) : null;
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/learn/${courseId}/${lesson.id}`}
                    className="flex items-start gap-2 text-sm py-1.5 px-2 -mx-2 rounded-lg"
                    style={
                      isCurrent
                        ? { background: "var(--surface)", color: "var(--primary)", fontWeight: 600 }
                        : { color: isDone ? "var(--muted)" : "var(--foreground)" }
                    }
                  >
                    <span aria-hidden>{isDone ? "✅" : isCurrent ? "▶" : "○"}</span>
                    <span className="flex-1">
                      {lesson.title}
                      {duration && <span className="text-[var(--muted)]"> · {duration}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
