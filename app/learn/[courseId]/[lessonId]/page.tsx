import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrderedLessons } from "@/lib/courses";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import LessonControls from "./LessonControls";

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

  return (
    <div className="container-page py-10 max-w-3xl">
      <p className="text-sm text-[var(--muted)] mb-1">
        {course.title} · {lessonModule.title}
      </p>
      <h1 className="text-2xl font-bold mb-6">{lesson.title}</h1>

      <YouTubeEmbed url={lesson.youtube_url} title={lesson.title} />

      <div className="card p-6 mt-6 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">
          What you&apos;ll learn
        </h2>
        <p className="text-sm">{lesson.description || "No description yet."}</p>
      </div>

      <LessonControls
        lessonId={lesson.id}
        courseId={courseId}
        initialCompleted={completedIds.has(lesson.id)}
        nextLessonId={nextLesson?.id ?? null}
        totalLessons={orderedLessons.length}
        initialCompletedCount={completedIds.size}
      />
    </div>
  );
}
