import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Course, LessonPreview } from "@/lib/types";

export type CourseWithLessonCount = Course & { lessonCount: number };

/**
 * Published courses with a real lesson count. Counts go through the public
 * `lesson_previews` view (not `lessons` directly) because `lessons` rows
 * are RLS-gated to enrolled users — an anonymous visitor browsing
 * /courses would otherwise always see 0 lessons.
 */
export async function getPublishedCourses(
  supabase: SupabaseClient<Database>,
  limit?: number,
): Promise<CourseWithLessonCount[]> {
  let query = supabase
    .from("courses")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (limit) query = query.limit(limit);

  const { data: courses } = await query;
  if (!courses) return [];

  return Promise.all(
    courses.map(async (course) => {
      const { data: modules } = await supabase
        .from("modules")
        .select("id")
        .eq("course_id", course.id);
      const moduleIds = (modules ?? []).map((m) => m.id);

      let lessonCount = 0;
      if (moduleIds.length > 0) {
        const { count } = await supabase
          .from("lesson_previews")
          .select("id", { count: "exact", head: true })
          .in("module_id", moduleIds);
        lessonCount = count ?? 0;
      }

      return { ...course, lessonCount };
    }),
  );
}

/**
 * A course's lessons in curriculum order (module order, then lesson order
 * within each module) — used to find "next lesson" and to compute total
 * lesson counts for progress tracking. Uses the public `lesson_previews`
 * view for the same reason as above: it works for any visitor, not just
 * enrolled ones, and title/order is all this needs.
 */
export async function getOrderedLessons(
  supabase: SupabaseClient<Database>,
  courseId: string,
): Promise<LessonPreview[]> {
  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId)
    .order("order_number", { ascending: true });
  const moduleIds = (modules ?? []).map((m) => m.id);
  if (moduleIds.length === 0) return [];

  const { data: lessons } = await supabase
    .from("lesson_previews")
    .select("*")
    .in("module_id", moduleIds)
    .order("order_number", { ascending: true });

  const moduleOrder = new Map(moduleIds.map((id, i) => [id, i]));
  return [...(lessons ?? [])].sort(
    (a, b) => (moduleOrder.get(a.module_id) ?? 0) - (moduleOrder.get(b.module_id) ?? 0),
  );
}
