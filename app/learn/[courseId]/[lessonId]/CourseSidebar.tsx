import Link from "next/link";
import { formatDuration } from "@/lib/courses";
import type { LessonPreview } from "@/lib/types";

type ModuleLike = { id: string; title: string; order_number: number };

export default function CourseSidebar({
  courseId,
  currentLessonId,
  modules,
  levels,
  lessonsByModule,
  completedIds,
}: {
  courseId: string;
  currentLessonId: string;
  modules: ModuleLike[];
  levels?: { id: string; title: string; order_number: number; modules: ModuleLike[] }[];
  lessonsByModule: Map<string, LessonPreview[]>;
  completedIds: Set<string>;
}) {
  function renderModule(courseModule: ModuleLike) {
    return (
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
    );
  }

  if (levels && levels.length > 0) {
    return (
      <nav aria-label="Learning Path curriculum" className="space-y-8">
        {levels.map((level) => (
          <div key={level.id}>
            <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--primary)" }}>
              Level {level.order_number} — {level.title}
            </h2>
            {level.modules.length === 0 ? (
              <p className="text-xs text-[var(--muted)] italic">Coming soon.</p>
            ) : (
              <div className="space-y-5">{level.modules.map((courseModule) => renderModule(courseModule))}</div>
            )}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Learning Path curriculum" className="space-y-5">
      {modules.map((courseModule) => renderModule(courseModule))}
    </nav>
  );
}
