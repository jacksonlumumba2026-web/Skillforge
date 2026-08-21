import { ImageResponse } from "next/og";

export const alt = "SkillPath Africa — Learn Digital Skills. Build Your Future.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#0f172a" }}>
          SkillPath <span style={{ color: "#2563eb", marginLeft: 16 }}>Africa</span>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#64748b", marginTop: 24, maxWidth: 900 }}>
          Learn practical digital skills — web development, digital marketing, design,
          freelancing, and more — through simple, structured courses.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            padding: "14px 28px",
            background: "#2563eb",
            color: "#ffffff",
            fontSize: 26,
            fontWeight: 600,
            borderRadius: 999,
          }}
        >
          Start learning today
        </div>
      </div>
    ),
    { ...size },
  );
}
