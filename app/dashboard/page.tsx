import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrderedLessons } from "@/lib/courses";
import CertificateButton from "@/components/CertificateButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, course_id, status, courses(id, title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const courseCards = await Promise.all(
    (enrollments ?? []).map(async (enrollment) => {
      const course = enrollment.courses as unknown as { id: string; title: string } | null;
      if (!course) return null;

      const orderedLessons = await getOrderedLessons(supabase, course.id);
      const lessonIds = orderedLessons.map((l) => l.id);

      const { data: progressRows } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true)
        .in("lesson_id", lessonIds.length > 0 ? lessonIds : ["00000000-0000-0000-0000-000000000000"]);
      const completedIds = new Set((progressRows ?? []).map((p) => p.lesson_id));

      const total = orderedLessons.length;
      const done = completedIds.size;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      // Continue where you left off: first not-yet-completed lesson, or the
      // last lesson (to revisit) if the whole course is already done.
      const nextUp =
        orderedLessons.find((l) => !completedIds.has(l.id)) ?? orderedLessons[orderedLessons.length - 1];

      return { enrollment, course, total, done, pct, continueLessonId: nextUp?.id ?? null };
    }),
  );

  const courses = courseCards.filter((c): c is NonNullable<typeof c> => c !== null);

  const { data: certificateRows } = await supabase
    .from("certificates")
    .select("id, course_id")
    .eq("user_id", user.id);
  const certificateByCourseId = new Map((certificateRows ?? []).map((c) => [c.course_id, c.id]));

  return (
    <div className="container-page py-16">
      <h1 className="text-2xl font-bold mb-1">
        Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
      </h1>
      <p className="text-[var(--muted)] mb-10">Here&apos;s where you left off.</p>

      <h2 className="text-lg font-semibold mb-4">My Courses</h2>

      {courses.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[var(--muted)] mb-6">You haven&apos;t started any courses yet.</p>
          <Link href="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {courses.map(({ enrollment, course, total, done, pct, continueLessonId }) => (
            <div key={enrollment.id} className="card p-6">
              <h3 className="font-semibold mb-3">{course.title}</h3>
              <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden mb-2">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: "var(--primary)" }}
                />
              </div>
              <p className="text-sm text-[var(--muted)] mb-5">
                Progress: {pct}% ({done}/{total} lessons)
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={continueLessonId ? `/learn/${course.id}/${continueLessonId}` : `/courses/${course.id}`}
                  className="btn btn-primary"
                  style={{ padding: "8px 18px" }}
                >
                  {pct >= 100 ? "Review Course" : "Continue Learning"}
                </Link>
                {pct >= 100 && (
                  <CertificateButton
                    courseId={course.id}
                    existingCertificateId={certificateByCourseId.get(course.id) ?? null}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
