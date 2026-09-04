import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublishedCourses } from "@/lib/courses";
import { BUNDLE_PRICE, BUNDLE_COURSE_COUNT, SINGLE_COURSE_PRICE } from "@/lib/pricing";
import BundlePicker from "./BundlePicker";

export const metadata: Metadata = {
  title: `Any ${BUNDLE_COURSE_COUNT} Learning Paths for KSh ${BUNDLE_PRICE.toLocaleString()}`,
  description: `Choose any ${BUNDLE_COURSE_COUNT} Learning Paths that match your interests and get them all for KSh ${BUNDLE_PRICE.toLocaleString()}.`,
};

export default async function BundlePage() {
  const supabase = await createClient();
  const courses = await getPublishedCourses(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Courses the buyer already owns are shown but not selectable — the
  // checkout route rejects them anyway, and finding that out only at payment
  // time would be a miserable way to learn it.
  let ownedCourseIds: string[] = [];
  if (user) {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("user_id", user.id)
      .in("status", ["active", "completed"]);
    ownedCourseIds = (enrollments ?? []).map((e) => e.course_id);
  }

  const fullPrice = SINGLE_COURSE_PRICE * BUNDLE_COURSE_COUNT;

  return (
    <div className="container-page py-16">
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-3">
          Pick any {BUNDLE_COURSE_COUNT} for KSh {BUNDLE_PRICE.toLocaleString()}
        </h1>
        <p className="text-[var(--muted)]">
          Choose the {BUNDLE_COURSE_COUNT} Learning Paths that match what you actually want to do.
          Bought separately they would cost KSh {fullPrice.toLocaleString()}.
        </p>
      </div>

      {!user && (
        <div className="card p-5 mb-8 text-center max-w-md mx-auto">
          <p className="text-sm mb-3">Log in or create an account to buy a bundle.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="btn btn-secondary">
              Log in
            </Link>
            <Link href="/register" className="btn btn-primary">
              Create account
            </Link>
          </div>
        </div>
      )}

      <BundlePicker
        courses={courses.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category,
        }))}
        ownedCourseIds={ownedCourseIds}
        isLoggedIn={Boolean(user)}
      />
    </div>
  );
}
