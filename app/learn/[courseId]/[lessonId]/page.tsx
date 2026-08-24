import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrderedLessons, getSuggestedNextCourse, getLevelsForCourse, formatDuration } from "@/lib/courses";
import type { LessonPreview, Course } from "@/lib/types";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import DataSaverNote from "@/components/DataSaverNote";
import CertificateButton from "@/components/CertificateButton";
import CapstoneCard from "@/components/CapstoneCard";
import KnowledgeCheck from "@/components/KnowledgeCheck";
import LessonControls from "./LessonControls";
import CourseSidebar from "./CourseSidebar";
import type { KnowledgeCheckQuestion } from "@/lib/types";

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
    .select("id, title, capstone_title, capstone_brief")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) notFound();

  let capstoneSubmission: { submission_url: string; note: string | null } | null = null;
  if (course.capstone_brief) {
    const { data: submission } = await supabase
      .from("capstone_submissions")
      .select("submission_url, note")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    capstoneSubmission = submission ?? null;
  }

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
          View Learning Path
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
  const levels = await getLevelsForCourse(supabase, courseId);
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
          <p className="text-sm mb-3">{lesson.description || "No description yet."}</p>
          {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
            <ul className="text-sm list-disc list-inside space-y-1">
              {lesson.learning_objectives.map((objective, i) => (
                <li key={i}>{objective}</li>
              ))}
            </ul>
          )}
        </div>

        <YouTubeEmbed url={lesson.youtube_url} title={lesson.title} />
        <div className="mt-3">
          <DataSaverNote />
        </div>

        {lesson.notes && (
          <div className="card p-6 mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">Notes</h2>
            <p className="text-sm whitespace-pre-line">{lesson.notes}</p>
          </div>
        )}

        {lesson.practice_activity && (
          <div className="card p-6 mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">Practice</h2>
            <p className="text-sm whitespace-pre-line">{lesson.practice_activity}</p>
          </div>
        )}

        {lesson.knowledge_check && lesson.knowledge_check.length > 0 && (
          <div className="card p-6 mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">
              Knowledge Check
            </h2>
            <KnowledgeCheck questions={lesson.knowledge_check as KnowledgeCheckQuestion[]} />
          </div>
        )}

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
                  View Learning Path →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {course.capstone_title && course.capstone_brief && (
          <CapstoneCard
            courseId={courseId}
            title={course.capstone_title}
            brief={course.capstone_brief}
            existingSubmission={capstoneSubmission}
          />
        )}
        <CourseSidebar
          courseId={courseId}
          currentLessonId={lesson.id}
          modules={modules ?? []}
          levels={levels}
          lessonsByModule={lessonsByModule}
          completedIds={completedIds}
        />
      </div>
    </div>
  );
}
