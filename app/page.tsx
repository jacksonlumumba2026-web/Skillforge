import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  COURSE_CATEGORY_LABEL,
  countPublishedCourses,
  getPublishedCourses,
} from "@/lib/courses";
import CourseCard from "@/components/CourseCard";
import { t, tf, LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { BUNDLE_COURSE_COUNT, BUNDLE_PRICE, SINGLE_COURSE_PRICE } from "@/lib/pricing";
import type { CourseCategory } from "@/lib/types";

// Four claims, each checkable against the running product — see the note in
// lib/i18n.ts for what backs each one and what is deliberately not claimed.
const VALUE_PROPS = [
  { key: "payOnce", icon: "▣" },
  { key: "data", icon: "▤" },
  { key: "freeLesson", icon: "▶" },
  { key: "beginner", icon: "◈" },
] as const;

const CATEGORIES = Object.keys(COURSE_CATEGORY_LABEL) as CourseCategory[];

export default async function HomePage() {
  const supabase = await createClient();
  const [popularCourses, pathCount] = await Promise.all([
    getPublishedCourses(supabase, { limit: 6 }),
    countPublishedCourses(supabase),
  ]);
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get(LOCALE_COOKIE)?.value === "sw" ? "sw" : "en";

  return (
    <div>
      {/* Hero */}
      <section className="container-page pt-14 pb-16 sm:pt-20 sm:pb-20">
        <span
          className="inline-block text-xs font-medium px-3 py-1.5 rounded-full mb-6"
          style={{ background: "var(--surface)", color: "var(--muted)" }}
        >
          {t(locale, "home.heroBadge")}
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5 max-w-2xl">
          {t(locale, "home.heroTitle")}
          <br />
          <span style={{ color: "var(--primary)" }}>
            {tf(locale, "home.heroTitleAccent", { price: SINGLE_COURSE_PRICE })}
          </span>
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-xl mb-8">
          {t(locale, "home.heroSubtitle")}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/courses" className="btn btn-primary">
            {tf(locale, "home.browsePaths", { count: pathCount })}
          </Link>
          <Link href="/bundle" className="btn btn-secondary">
            {tf(locale, "home.bundleCta", {
              count: BUNDLE_COURSE_COUNT,
              price: BUNDLE_PRICE.toLocaleString(),
            })}
          </Link>
        </div>
      </section>

      {/* What you get — four cards, no headline above them. The claims are
          short enough to read at a glance, which a section title would slow. */}
      <section className="border-t border-[var(--border)]">
        <div className="container-page py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUE_PROPS.map(({ key, icon }) => (
              <div key={key} className="card p-5">
                <div className="text-lg mb-3" style={{ color: "var(--primary)" }} aria-hidden>
                  {icon}
                </div>
                <h2 className="font-semibold mb-1.5">{t(locale, `home.value.${key}`)}</h2>
                <p className="text-sm text-[var(--muted)]">
                  {tf(locale, `home.value.${key}Body`, { price: SINGLE_COURSE_PRICE })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular paths */}
      {popularCourses.length > 0 && (
        <section className="border-t border-[var(--border)]">
          <div className="container-page py-14">
            <h2 className="text-2xl font-bold mb-8">{t(locale, "home.popularTitle")}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {popularCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <Link
              href="/courses"
              className="text-sm font-medium underline underline-offset-4"
              style={{ color: "var(--primary)" }}
            >
              {t(locale, "home.seeAllPaths")}
            </Link>
          </div>
        </section>
      )}

      {/* Browse by area — the same categories the /courses filter chips use,
          so a click here lands on a filtered catalogue rather than a new page. */}
      <section className="border-t border-[var(--border)]">
        <div className="container-page py-14">
          <h2 className="text-2xl font-bold mb-6">{t(locale, "home.browseByArea")}</h2>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/courses?category=${category}`}
                className="text-sm px-4 py-2 rounded-full border transition-colors hover:border-[var(--primary)]"
                style={{ borderColor: "var(--border)" }}
              >
                {COURSE_CATEGORY_LABEL[category]}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
