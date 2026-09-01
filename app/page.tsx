import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getPublishedCourses } from "@/lib/courses";
import CourseCard from "@/components/CourseCard";
import { t, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

// Replaces the old aspirational "why learn digital skills" checks. These are
// claims about the product rather than about the learner's future, so each one
// can be checked against the running site -- see the note in lib/i18n.ts for
// what backs each key, and what deliberately is not claimed.
const PROOF_KEYS = [
  "home.proof.preview",
  "home.proof.levels",
  "home.proof.language",
  "home.proof.data",
  "home.proof.oneTime",
];

export default async function HomePage() {
  const supabase = await createClient();
  const popularCourses = await getPublishedCourses(supabase, { limit: 3 });
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get(LOCALE_COOKIE)?.value === "sw" ? "sw" : "en";

  return (
    <div>
      {/* Hero */}
      <section className="container-page py-20 sm:py-28 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-5 max-w-2xl mx-auto">
          {t(locale, "home.heroTitle")}
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-xl mx-auto mb-8">
          {t(locale, "home.heroSubtitle")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/courses" className="btn btn-secondary">
            {t(locale, "home.exploreCourses")}
          </Link>
          <Link href="/register" className="btn btn-primary">
            {t(locale, "home.startLearning")}
          </Link>
        </div>
        <p className="text-sm text-[var(--muted)] mt-5">{t(locale, "home.paymentLine")}</p>
      </section>

      {/* What you actually get */}
      <section className="border-t border-[var(--border)]">
        <div className="container-page py-16">
          <h2 className="text-2xl font-bold text-center mb-10">{t(locale, "home.proofTitle")}</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {PROOF_KEYS.map((key) => (
              <div key={key} className="text-center">
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "var(--surface)", color: "var(--primary)" }}
                >
                  ✓
                </div>
                <p className="text-sm font-medium">{t(locale, key)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular courses */}
      {popularCourses.length > 0 && (
        <section className="border-t border-[var(--border)]">
          <div className="container-page py-16">
            <h2 className="text-2xl font-bold text-center mb-10">{t(locale, "home.popularCoursesTitle")}</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              {popularCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <div className="text-center">
              <Link href="/courses" className="btn btn-secondary">
                {t(locale, "home.browseAllCourses")}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
