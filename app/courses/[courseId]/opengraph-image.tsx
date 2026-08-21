import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const alt = "Course on SkillPath Africa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default async function Image({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("title, level, price")
    .eq("id", courseId)
    .eq("published", true)
    .maybeSingle();

  const title = course?.title ?? "SkillPath Africa";
  const level = course ? LEVEL_LABEL[course.level] ?? course.level : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#0f172a" }}>
          SkillPath <span style={{ color: "#2563eb", marginLeft: 10 }}>Africa</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {level && (
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 600,
                color: "#64748b",
                background: "#f8fafc",
                padding: "8px 20px",
                borderRadius: 999,
                marginBottom: 24,
                alignSelf: "flex-start",
              }}
            >
              {level}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#0f172a", maxWidth: 1000 }}>
            {title}
          </div>
        </div>

        {course && (
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: "#2563eb" }}>
            KSh {course.price.toLocaleString()} — one-time payment, lifetime access
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
