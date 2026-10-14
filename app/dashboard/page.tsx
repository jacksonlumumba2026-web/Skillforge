import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";
import { getOrderedLessons } from "@/lib/courses";
import CertificateButton from "@/components/CertificateButton";
import ReminderSetup from "@/components/ReminderSetup";
import ReferralCard from "@/components/ReferralCard";
import { t, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, referral_code")
    .eq("user_id", user.id)
    .single();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, course_id, status, courses(id, title)")
    .eq("user_id", user.id)
    .in("status", ["active", "completed"])
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

  // Prompt to set up a daily study reminder once — right after their
  // first course, before they've made any choice about reminders yet.
  const { data: existingReminder } = await supabase
    .from("study_reminders")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const showReminderSetup = courses.length > 0 && !existingReminder;

  // Referral standing. The counts come through the user's own client, which
  // referrals_select_own already scopes to rows they are part of. The reward
  // codes need the service role: discount_codes has RLS on with no policies
  // at all, so nothing but the service role can read it — and the query is
  // pinned to this learner's own referral rows, never a free read of the
  // codes table.
  const { data: myReferrals } = await supabase
    .from("referrals")
    .select("qualified_at, reward_discount_code_id")
    .eq("referrer_user_id", user.id);

  const invited = (myReferrals ?? []).length;
  const qualified = (myReferrals ?? []).filter((r) => r.qualified_at !== null).length;

  const rewardCodeIds = (myReferrals ?? [])
    .map((r) => r.reward_discount_code_id)
    .filter((id): id is string => id !== null);

  let rewards: { code: string; used: boolean }[] = [];
  if (rewardCodeIds.length > 0) {
    const { data: rewardCodes } = await createAdminClient()
      .from("discount_codes")
      .select("code, redemption_count")
      .in("id", rewardCodeIds);
    rewards = (rewardCodes ?? []).map((c) => ({
      code: c.code,
      used: c.redemption_count > 0,
    }));
  }

  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get(LOCALE_COOKIE)?.value === "sw" ? "sw" : "en";

  return (
    <div className="container-page py-16">
      <h1 className="text-2xl font-bold mb-1">
        {t(locale, "dashboard.welcome")}
        {profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
      </h1>
      <p className="text-[var(--muted)] mb-10">{t(locale, "dashboard.subtitle")}</p>

      {showReminderSetup && <ReminderSetup />}

      {profile?.referral_code && (
        <ReferralCard
          shareUrl={`${SITE_URL}/r/${profile.referral_code}`}
          invited={invited}
          qualified={qualified}
          rewards={rewards}
        />
      )}

      <h2 className="text-lg font-semibold mb-4">My Learning Paths</h2>

      {courses.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[var(--muted)] mb-6">You haven&apos;t started any learning paths yet.</p>
          <Link href="/courses" className="btn btn-primary">
            Browse Learning Paths
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
                Learning Path Progress: {pct}% ({done}/{total} lessons)
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={continueLessonId ? `/learn/${course.id}/${continueLessonId}` : `/courses/${course.id}`}
                  className="btn btn-primary"
                  style={{ padding: "8px 18px" }}
                >
                  {pct >= 100 ? "Review Learning Path" : "Continue Learning"}
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
