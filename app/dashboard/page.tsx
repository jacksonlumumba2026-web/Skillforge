import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

      const { count: totalLessons } = await supabase
        .from("lessons")
        .select("id, modules!inner(course_id)", { count: "exact", head: true })
        .eq("modules.course_id", course.id);

      const { count: completedLessons } = await supabase
        .from("lesson_progress")
        .select("id, lessons!inner(modules!inner(course_id))", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true)
        .eq("lessons.modules.course_id", course.id);

      const { data: firstLesson } = await supabase
        .from("lessons")
        .select("id, modules!inner(course_id, order_number)")
        .eq("modules.course_id", course.id)
        .eq("modules.order_number", 1)
        .eq("order_number", 1)
        .maybeSingle();

      const total = totalLessons ?? 0;
      const done = completedLessons ?? 0;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      return { enrollment, course, total, done, pct, firstLessonId: firstLesson?.id ?? null };
    }),
  );

  const courses = courseCards.filter((c): c is NonNullable<typeof c> => c !== null);

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
          {courses.map(({ enrollment, course, total, done, pct, firstLessonId }) => (
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
              <Link
                href={firstLessonId ? `/learn/${course.id}/${firstLessonId}` : `/courses/${course.id}`}
                className="btn btn-primary"
                style={{ padding: "8px 18px" }}
              >
                Continue Learning
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
