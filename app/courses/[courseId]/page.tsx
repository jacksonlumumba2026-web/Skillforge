import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDuration } from "@/lib/courses";
import { SITE_URL } from "@/lib/site";
import PayButton from "@/components/PayButton";
import type { LessonPreview } from "@/lib/types";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("title, description")
    .eq("id", courseId)
    .eq("published", true)
    .maybeSingle();
  if (!course) return {};

  return {
    title: course.title,
    description: course.description,
    alternates: { canonical: `${SITE_URL}/courses/${courseId}` },
    openGraph: { title: course.title, description: course.description, type: "website" },
  };
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { courseId } = await params;
  const { payment } = await searchParams;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("published", true)
    .maybeSingle();
  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, description, order_number")
    .eq("course_id", course.id)
    .order("order_number", { ascending: true });

  const moduleIds = (modules ?? []).map((m) => m.id);
  let lessonsByModule = new Map<string, LessonPreview[]>();
  if (moduleIds.length > 0) {
    const { data: lessons } = await supabase
      .from("lesson_previews")
      .select("*")
      .in("module_id", moduleIds)
      .order("order_number", { ascending: true });
    lessonsByModule = new Map();
    for (const lesson of lessons ?? []) {
      const list = lessonsByModule.get(lesson.module_id) ?? [];
      list.push(lesson);
      lessonsByModule.set(lesson.module_id, list);
    }
  }
  const lessonCount = [...lessonsByModule.values()].reduce((sum, l) => sum + l.length, 0);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .in("status", ["active", "completed"])
      .maybeSingle();
    isEnrolled = Boolean(enrollment);
  }

  const firstLesson = modules?.[0] ? lessonsByModule.get(modules[0].id)?.[0] : undefined;

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: { "@type": "Organization", name: "SkillPath Africa", sameAs: SITE_URL },
    offers: { "@type": "Offer", price: course.price, priceCurrency: "KES" },
  };

  return (
    <div className="container-page py-16 max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <span
        className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4"
        style={{ background: "var(--surface)", color: "var(--muted)" }}
      >
        {LEVEL_LABEL[course.level] ?? course.level}
      </span>
      <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
      <p className="text-[var(--muted)] mb-6">{course.description}</p>

      {payment === "success" && !isEnrolled && (
        <p className="text-sm mb-6 p-3 rounded-lg" style={{ background: "var(--surface)", color: "var(--success)" }}>
          Payment received — confirming your access, this can take a few seconds. Refresh if it doesn&apos;t update shortly.
        </p>
      )}
      {payment === "error" && (
        <p className="text-sm mb-6 p-3 rounded-lg text-red-600" style={{ background: "var(--surface)" }}>
          We couldn&apos;t confirm that payment. If you were charged, contact support — otherwise, try again below.
        </p>
      )}
      <div className="flex items-center gap-6 text-sm text-[var(--muted)] mb-10">
        <span>
          {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
        </span>
        <span className="font-semibold text-[var(--foreground)] text-base">
          KSh {course.price.toLocaleString()}
        </span>
      </div>

      <h2 className="text-lg font-semibold mb-5">Curriculum</h2>
      <div className="space-y-6 mb-10">
        {(modules ?? []).map((module) => (
          <div key={module.id} className="card p-5">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-[var(--muted)]">
              Module {module.order_number} — {module.title}
            </h3>
            <ul className="space-y-3">
              {(lessonsByModule.get(module.id) ?? []).map((lesson, i) => {
                const label = `Lesson ${i + 1} — ${lesson.title}`;
                const duration = lesson.duration_seconds ? formatDuration(lesson.duration_seconds) : null;
                return (
                  <li key={lesson.id}>
                    {isEnrolled ? (
                      <Link
                        href={`/learn/${course.id}/${lesson.id}`}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: "var(--primary)" }}
                      >
                        <span aria-hidden>▶</span> {label}
                        {duration && <span className="text-[var(--muted)]">· {duration}</span>}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <span aria-hidden>🔒</span> {label}
                        {duration && <span>· {duration}</span>}
                      </div>
                    )}
                    {lesson.description && (
                      <p className="text-xs text-[var(--muted)] mt-1 pl-6">{lesson.description}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="card p-6 text-center">
        {isEnrolled ? (
          <Link
            href={firstLesson ? `/learn/${course.id}/${firstLesson.id}` : "/dashboard"}
            className="btn btn-primary"
          >
            Continue Learning
          </Link>
        ) : user ? (
          <PayButton courseId={course.id} price={course.price} />
        ) : (
          <Link href="/register" className="btn btn-primary">
            Get Full Access — KSh {course.price.toLocaleString()}
          </Link>
        )}
      </div>
    </div>
  );
}
