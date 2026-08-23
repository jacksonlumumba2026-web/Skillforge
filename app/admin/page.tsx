import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import PublishToggle from "./PublishToggle";

// Admin pages read via the service-role client, not the RLS-scoped one —
// courses.published=true is the only public read policy, so an admin
// browsing via the normal client would never see unpublished/draft
// courses. Access to this whole /admin section is already gated by
// middleware checking profiles.role === 'admin', so this is safe.
export default async function AdminPage() {
  const supabase = createAdminClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("display_order", { ascending: true });

  const courseIds = (courses ?? []).map((c) => c.id);
  const counts = new Map<string, { modules: number; lessons: number; enrollments: number }>();
  if (courseIds.length > 0) {
    const [{ data: modules }, { data: enrollments }] = await Promise.all([
      supabase.from("modules").select("id, course_id").in("course_id", courseIds),
      supabase.from("enrollments").select("id, course_id").in("course_id", courseIds),
    ]);
    const moduleIds = (modules ?? []).map((m) => m.id);
    const { data: lessons } = await supabase
      .from("lesson_previews")
      .select("id, module_id")
      .in("module_id", moduleIds.length > 0 ? moduleIds : ["00000000-0000-0000-0000-000000000000"]);

    const moduleToCourse = new Map((modules ?? []).map((m) => [m.id, m.course_id]));
    for (const c of courses ?? []) counts.set(c.id, { modules: 0, lessons: 0, enrollments: 0 });
    for (const m of modules ?? []) {
      const entry = counts.get(m.course_id);
      if (entry) entry.modules += 1;
    }
    for (const l of lessons ?? []) {
      const courseId = moduleToCourse.get(l.module_id);
      const entry = courseId ? counts.get(courseId) : undefined;
      if (entry) entry.lessons += 1;
    }
    for (const e of enrollments ?? []) {
      const entry = counts.get(e.course_id);
      if (entry) entry.enrollments += 1;
    }
  }

  return (
    <div className="container-page py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin — Courses</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/payments" className="text-sm" style={{ color: "var(--primary)" }}>
            Payments
          </Link>
          <Link href="/admin/discount-codes" className="text-sm" style={{ color: "var(--primary)" }}>
            Discount Codes
          </Link>
          <Link href="/admin/users" className="text-sm" style={{ color: "var(--primary)" }}>
            Users
          </Link>
          <Link href="/admin/instructor-applications" className="text-sm" style={{ color: "var(--primary)" }}>
            Instructor applications
          </Link>
          <Link href="/admin/courses/new" className="btn btn-primary">
            + New Course
          </Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
              <th className="p-4">Title</th>
              <th className="p-4">Level</th>
              <th className="p-4">Price</th>
              <th className="p-4">Modules</th>
              <th className="p-4">Lessons</th>
              <th className="p-4">Enrolled</th>
              <th className="p-4">Published</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {(courses ?? []).map((course) => {
              const c = counts.get(course.id) ?? { modules: 0, lessons: 0, enrollments: 0 };
              return (
                <tr key={course.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="p-4 font-medium">
                    <Link href={`/admin/courses/${course.id}`} style={{ color: "var(--primary)" }}>
                      {course.title}
                    </Link>
                    {course.generated_by && (
                      <span className="ml-2 text-xs text-[var(--muted)]">AI-generated</span>
                    )}
                  </td>
                  <td className="p-4 capitalize">{course.level}</td>
                  <td className="p-4">KSh {course.price.toLocaleString()}</td>
                  <td className="p-4">{c.modules}</td>
                  <td className="p-4">{c.lessons}</td>
                  <td className="p-4">{c.enrollments}</td>
                  <td className="p-4">
                    <PublishToggle courseId={course.id} initialPublished={course.published} />
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/courses/${course.id}`} className="btn btn-secondary" style={{ padding: "6px 14px" }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
