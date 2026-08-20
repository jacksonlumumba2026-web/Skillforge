import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublishedCourses } from "@/lib/courses";
import CourseCard from "@/components/CourseCard";

const WHY_LEARN = [
  "Get job-ready skills",
  "Start freelancing",
  "Build online businesses",
  "Work with modern technology",
  "Create new income opportunities",
];

export default async function HomePage() {
  const supabase = await createClient();
  const popularCourses = await getPublishedCourses(supabase, 3);

  return (
    <div>
      {/* Hero */}
      <section className="container-page py-20 sm:py-28 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-5 max-w-2xl mx-auto">
          Learn Digital Skills. Build Your Future.
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-xl mx-auto mb-8">
          Learn practical digital skills step by step through simple, structured courses
          designed for beginners.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/courses" className="btn btn-secondary">
            Explore Courses
          </Link>
          <Link href="/register" className="btn btn-primary">
            Start Learning
          </Link>
        </div>
      </section>

      {/* Why learn digital skills */}
      <section className="border-t border-[var(--border)]">
        <div className="container-page py-16">
          <h2 className="text-2xl font-bold text-center mb-10">Why Learn Digital Skills?</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {WHY_LEARN.map((reason) => (
              <div key={reason} className="text-center">
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "var(--surface)", color: "var(--primary)" }}
                >
                  ✓
                </div>
                <p className="text-sm font-medium">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular courses */}
      {popularCourses.length > 0 && (
        <section className="border-t border-[var(--border)]">
          <div className="container-page py-16">
            <h2 className="text-2xl font-bold text-center mb-10">Popular Courses</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              {popularCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <div className="text-center">
              <Link href="/courses" className="btn btn-secondary">
                Browse all courses
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
