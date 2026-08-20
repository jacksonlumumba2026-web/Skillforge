export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return (
    <div className="container-page py-16">
      <h1 className="text-2xl font-bold mb-2">Edit course</h1>
      <p className="text-[var(--muted)]">
        Modules, lessons, and course settings for {courseId} — coming in Phase 5.
      </p>
    </div>
  );
}
