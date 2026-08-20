export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  return (
    <div className="container-page py-16">
      <h1 className="text-2xl font-bold mb-2">Lesson player</h1>
      <p className="text-[var(--muted)]">
        Course {courseId}, lesson {lessonId} — video + progress coming in Phase 3.
      </p>
    </div>
  );
}
