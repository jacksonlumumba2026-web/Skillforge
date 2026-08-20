export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return (
    <div className="container-page py-16">
      <h1 className="text-2xl font-bold mb-2">Course detail</h1>
      <p className="text-[var(--muted)]">Course {courseId} — curriculum coming in Phase 1.</p>
    </div>
  );
}
