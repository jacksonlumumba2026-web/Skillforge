import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrderedLessons, getSuggestedNextCourse, formatDuration } from "@/lib/courses";
import type { LessonPreview, Course } from "@/lib/types";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import CertificateButton from "@/components/CertificateButton";
import LessonControls from "./LessonControls";
import CourseSidebar from "./CourseSidebar";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/learn/${courseId}/${lessonId}`);

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) notFound();

  // Full lesson content is RLS-gated to enrolled users. If this comes back
  // empty, distinguish "doesn't exist" from "exists but you haven't paid"
  // via the public preview, rather than a plain 404 either way.
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, modules(id, title, course_id)")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson) {
    const { data: preview } = await supabase
      .from("lesson_previews")
      .select("id")
      .eq("id", lessonId)
      .maybeSingle();
    if (!preview) notFound();

    return (
      <div className="container-page py-16 max-w-lg text-center">
        <h1 className="text-2xl font-bold mb-3">This lesson is locked</h1>
        <p className="text-[var(--muted)] mb-8">
          You need access to {course.title} to watch this lesson.
        </p>
        <Link href={`/courses/${course.id}`} className="btn btn-primary">
          View course
        </Link>
      </div>
    );
  }

  const lessonModule = lesson.modules as unknown as {
    id: string;
    title: string;
    course_id: string;
  } | null;
  if (!lessonModule || lessonModule.course_id !== courseId) notFound();

  const orderedLessons = await getOrderedLessons(supabase, courseId);
  const currentIndex = orderedLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = currentIndex >= 0 ? orderedLessons[currentIndex + 1] : undefined;

  const lessonIds = orderedLessons.map((l) => l.id);
  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("completed", true)
    .in("lesson_id", lessonIds.length > 0 ? lessonIds : ["00000000-0000-0000-0000-000000000000"]);
  const completedIds = new Set((progressRows ?? []).map((p) => p.lesson_id));

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, order_number")
    .eq("course_id", courseId)
    .order("order_number", { ascending: true });
  const lessonsByModule = new Map<string, LessonPreview[]>();
  for (const previewLesson of orderedLessons) {
    const list = lessonsByModule.get(previewLesson.module_id) ?? [];
    list.push(previewLesson);
    lessonsByModule.set(previewLesson.module_id, list);
  }

  const duration = lesson.duration_seconds ? formatDuration(lesson.duration_seconds) : null;

  const isCourseFullyCompleted = orderedLessons.length > 0 && completedIds.size >= orderedLessons.length;
  let suggestedNextCourse: Course | null = null;
  let existingCertificateId: string | null = null;
  if (isCourseFullyCompleted) {
    [suggestedNextCourse, existingCertificateId] = await Promise.all([
      getSuggestedNextCourse(supabase, user.id),
      supabase
        .from("certificates")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle()
        .then(({ data }) => data?.id ?? null),
    ]);
  }

  return (
    <div className="container-page py-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start max-w-6xl">
      <div>
        <p className="text-sm text-[var(--muted)] mb-1">
          {course.title} · {lessonModule.title}
        </p>
        <h1 className="text-2xl font-bold mb-6">{lesson.title}</h1>

        <div className="card p-6 mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">
            What you&apos;ll learn{duration && <span className="normal-case font-normal"> · {duration}</span>}
          </h2>
          <p className="text-sm">{lesson.description || "No description yet."}</p>
        </div>

        <YouTubeEmbed url={lesson.youtube_url} title={lesson.title} />

        <div className="mt-8">
          <LessonControls
            lessonId={lesson.id}
            courseId={courseId}
            initialCompleted={completedIds.has(lesson.id)}
            nextLessonId={nextLesson?.id ?? null}
            totalLessons={orderedLessons.length}
            initialCompletedCount={completedIds.size}
          />
        </div>

        {isCourseFullyCompleted && (
          <div className="mt-6 flex flex-wrap gap-4 items-start">
            <CertificateButton courseId={courseId} existingCertificateId={existingCertificateId} />
            {suggestedNextCourse && (
              <div className="card p-5 flex-1 min-w-[240px]">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">
                  Keep the momentum going
                </p>
                <p className="text-sm mb-3">
                  Try <strong>{suggestedNextCourse.title}</strong> next.
                </p>
                <Link
                  href={`/courses/${suggestedNextCourse.id}`}
                  className="text-sm font-medium"
                  style={{ color: "var(--primary)" }}
                >
                  View course →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <CourseSidebar
        courseId={courseId}
        currentLessonId={lesson.id}
        modules={modules ?? []}
        lessonsByModule={lessonsByModule}
        completedIds={completedIds}
      />
    </div>
  );
}
