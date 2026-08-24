import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Course, CourseCategory, CourseLevel, CourseModule, Level, LessonPreview } from "@/lib/types";

export const COURSE_CATEGORY_LABEL: Record<CourseCategory, string> = {
  "business-freelancing": "Business & Freelancing",
  "marketing-growth": "Marketing & Growth",
  "design-creative": "Design & Creative",
  "tech-programming": "Tech & Programming",
  "productivity-tools": "Productivity & Tools",
};

export type CourseWithLessonCount = Course & {
  lessonCount: number;
  averageRating: number | null;
  reviewCount: number;
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** "8 min" / "1h 5m" — never fabricated, only called when duration_seconds is set. */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${Math.max(minutes, 1)} min`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

/**
 * Published courses with a real lesson count. Counts go through the public
 * `lesson_previews` view (not `lessons` directly) because `lessons` rows
 * are RLS-gated to enrolled users — an anonymous visitor browsing
 * /courses would otherwise always see 0 lessons.
 */
export async function getPublishedCourses(
  supabase: SupabaseClient<Database>,
  options?: { limit?: number; search?: string; level?: CourseLevel; category?: CourseCategory },
): Promise<CourseWithLessonCount[]> {
  let query = supabase
    .from("courses")
    .select("*")
    .eq("published", true)
    .eq("curriculum_status", "published")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (options?.level) query = query.eq("level", options.level);
  if (options?.category) query = query.eq("category", options.category);
  if (options?.search) {
    const term = options.search.trim().replace(/[%_]/g, "");
    if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }
  if (options?.limit) query = query.limit(options.limit);

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

      const { data: reviewRows } = await supabase
        .from("course_reviews")
        .select("rating")
        .eq("course_id", course.id);
      const reviews = reviewRows ?? [];
      const reviewCount = reviews.length;
      const averageRating =
        reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : null;

      return { ...course, lessonCount, averageRating, reviewCount };
    }),
  );
}

/**
 * Recommends one published course to try next after finishing another —
 * the next one in the curated display_order the learner isn't already
 * enrolled in, so "next" follows the same deliberate business/creative/
 * technical mix the catalog was ordered for, not a random pick.
 */
export async function getSuggestedNextCourse(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Course | null> {
  const { data: enrollments } = await supabase.from("enrollments").select("course_id").eq("user_id", userId);
  const enrolledIds = (enrollments ?? []).map((e) => e.course_id);

  let query = supabase
    .from("courses")
    .select("*")
    .eq("published", true)
    .eq("curriculum_status", "published")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1);
  if (enrolledIds.length > 0) query = query.not("id", "in", `(${enrolledIds.join(",")})`);

  const { data } = await query.maybeSingle();
  return data ?? null;
}

export type LevelWithModules = Level & { modules: CourseModule[] };

/**
 * A course's Levels, each with its Modules attached — the grouping used to
 * render the Learning Path progression (Foundations, Core Skills, ...).
 * Returns [] for the many courses that haven't been migrated onto the
 * Level model yet (no rows in `levels`); callers should fall back to a
 * flat module list in that case, exactly like the page rendered before
 * Levels existed.
 */
export async function getLevelsForCourse(
  supabase: SupabaseClient<Database>,
  courseId: string,
): Promise<LevelWithModules[]> {
  const { data: levels } = await supabase
    .from("levels")
    .select("*")
    .eq("course_id", courseId)
    .order("order_number", { ascending: true });
  if (!levels || levels.length === 0) return [];

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("order_number", { ascending: true });

  const modulesByLevel = new Map<string, CourseModule[]>();
  for (const courseModule of modules ?? []) {
    if (!courseModule.level_id) continue;
    const list = modulesByLevel.get(courseModule.level_id) ?? [];
    list.push(courseModule);
    modulesByLevel.set(courseModule.level_id, list);
  }

  return levels.map((level) => ({ ...level, modules: modulesByLevel.get(level.id) ?? [] }));
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
