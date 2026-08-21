import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const alt = "SkillPath Africa Certificate of Completion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("learner_name, courses(title)")
    .eq("id", id)
    .maybeSingle();
  const course = certificate?.courses as unknown as { title: string } | null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "80px",
          background: "#ffffff",
          fontFamily: "sans-serif",
          border: "16px solid #2563eb",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, fontWeight: 600, color: "#2563eb", letterSpacing: 2 }}>
          SKILLPATH AFRICA — CERTIFICATE OF COMPLETION
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#64748b", marginTop: 40 }}>
          This certifies that
        </div>
        <div style={{ display: "flex", fontSize: 60, fontWeight: 700, color: "#0f172a", marginTop: 16 }}>
          {certificate?.learner_name ?? "SkillPath Africa Learner"}
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#64748b", marginTop: 32 }}>
          has successfully completed
        </div>
        <div style={{ display: "flex", fontSize: 38, fontWeight: 600, color: "#0f172a", marginTop: 16, textAlign: "center" }}>
          {course?.title ?? "a SkillPath Africa course"}
        </div>
      </div>
    ),
    { ...size },
  );
}
