import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDuration, getLevelsForCourse } from "@/lib/courses";
import { SITE_URL } from "@/lib/site";
import PurchaseSection from "@/components/PurchaseSection";
import StarRating from "@/components/StarRating";
import DataSaverNote from "@/components/DataSaverNote";
import ReviewForm from "./ReviewForm";
import type { CourseModule, LessonPreview } from "@/lib/types";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Tier label per module position for courses with the full 6-module
 *  beginner→professional→freelance progression (see has_career_path). */
const MODULE_TIER_LABEL: Record<number, string> = {
  1: "Beginner",
  2: "Beginner",
  3: "Intermediate",
  4: "Professional",
  5: "Capstone Project",
  6: "Freelance-Ready",
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

  const levels = await getLevelsForCourse(supabase, course.id);

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

  const { data: reviewRows } = await supabase
    .from("course_reviews")
    .select("*")
    .eq("course_id", course.id)
    .order("created_at", { ascending: false });
  const reviews = reviewRows ?? [];
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;
  const myReview = user ? reviews.find((r) => r.user_id === user.id) : undefined;

  const renderModuleCard = (courseModule: Pick<CourseModule, "id" | "title" | "order_number">) => {
    const moduleLessons = lessonsByModule.get(courseModule.id) ?? [];
    return (
      <div key={courseModule.id} className="card p-5">
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-[var(--muted)] flex items-center gap-2">
          <span>
            Module {courseModule.order_number} — {courseModule.title}
          </span>
          {levels.length === 0 && course.has_career_path && MODULE_TIER_LABEL[courseModule.order_number] && (
            <span
              className="normal-case text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "var(--surface)", color: "var(--primary)" }}
            >
              {MODULE_TIER_LABEL[courseModule.order_number]}
            </span>
          )}
        </h3>
        {moduleLessons.length === 0 ? (
          <p className="text-xs text-[var(--muted)] italic">Coming soon.</p>
        ) : (
          <ul className="space-y-3">
            {moduleLessons.map((lesson, i) => {
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
                  {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                    <ul className="text-xs text-[var(--muted)] mt-1 pl-6 list-disc list-inside">
                      {lesson.learning_objectives.map((objective, oi) => (
                        <li key={oi}>{objective}</li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: { "@type": "Organization", name: "SkillPath Africa", sameAs: SITE_URL },
    offers: { "@type": "Offer", price: course.price, priceCurrency: "KES" },
    ...(averageRating !== null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount: reviews.length,
      },
    }),
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
        {course.has_career_path ? "Beginner → Professional" : LEVEL_LABEL[course.level] ?? course.level}
      </span>
      <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
      {averageRating !== null && (
        <div className="mb-3">
          <StarRating rating={averageRating} reviewCount={reviews.length} />
        </div>
      )}
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

      <div className="mb-10">
        <DataSaverNote compact />
      </div>

      {course.capstone_title && course.capstone_brief && (
        <div className="card p-5 mb-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-1">
            What you&apos;ll build
          </p>
          <p className="font-semibold mb-2">{course.capstone_title}</p>
          <p className="text-sm text-[var(--muted)] whitespace-pre-line">{course.capstone_brief}</p>
        </div>
      )}

      {levels.length > 0 ? (
        <div className="space-y-10 mb-10">
          {levels.map((level) => (
            <div key={level.id}>
              <h2 className="text-lg font-semibold">
                Level {level.order_number} — {level.title}
              </h2>
              {level.description && (
                <p className="text-sm text-[var(--muted)] mt-1 mb-5">{level.description}</p>
              )}
              {level.modules.length === 0 ? (
                <p className="text-sm text-[var(--muted)] italic">Coming soon.</p>
              ) : (
                <div className="space-y-6 mt-5">{level.modules.map((courseModule) => renderModuleCard(courseModule))}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold mb-5">Curriculum</h2>
          <div className="space-y-6 mb-10">{(modules ?? []).map((courseModule) => renderModuleCard(courseModule))}</div>
        </>
      )}

      <div className="card p-6 text-center">
        {isEnrolled ? (
          <Link
            href={firstLesson ? `/learn/${course.id}/${firstLesson.id}` : "/dashboard"}
            className="btn btn-primary"
          >
            Continue Learning
          </Link>
        ) : user ? (
          <PurchaseSection
            courseId={course.id}
            price={course.price}
            manualMpesaTill={
              process.env.MPESA_TILL_NUMBER && process.env.MPESA_TILL_NAME
                ? { number: process.env.MPESA_TILL_NUMBER, name: process.env.MPESA_TILL_NAME }
                : undefined
            }
            manualMpesaSendMoney={
              process.env.MPESA_MANUAL_NUMBER && process.env.MPESA_MANUAL_NAME
                ? { number: process.env.MPESA_MANUAL_NUMBER, name: process.env.MPESA_MANUAL_NAME }
                : undefined
            }
          />
        ) : (
          <Link href="/register" className="btn btn-primary">
            Get Full Access — KSh {course.price.toLocaleString()}
          </Link>
        )}
      </div>

      <h2 className="text-lg font-semibold mt-14 mb-5">
        Reviews{reviews.length > 0 && ` (${reviews.length})`}
      </h2>

      {isEnrolled && (
        <div className="mb-6">
          <ReviewForm
            courseId={course.id}
            initialRating={myReview?.rating ?? 0}
            initialComment={myReview?.comment ?? ""}
          />
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{review.reviewer_name}</span>
                <StarRating rating={review.rating} />
              </div>
              {review.comment && <p className="text-sm text-[var(--muted)]">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
