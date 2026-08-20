import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Course } from "@/lib/types";

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
