import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: cert } = await admin
    .from("certificates")
    .select("*, learning_paths(title, level, skills(name))")
    .eq("id", id)
    .single();
  if (!cert) return new Response("Not found", { status: 404 });

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", cert.user_id)
    .single();

  const path = cert.learning_paths as unknown as {
    title: string;
    level: string;
    skills: { name: string };
  };
  const name = profile?.full_name || profile?.email || "SkillForge Learner";
  const date = new Date(cert.issued_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#05060a",
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(139,92,246,0.35), transparent 45%), radial-gradient(circle at 85% 85%, rgba(34,211,238,0.25), transparent 45%)",
          fontFamily: "sans-serif",
          color: "#f5f6fb",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "88%",
            height: "80%",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 28,
            background: "rgba(255,255,255,0.04)",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 60,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              S
            </div>
            SkillForge
          </div>

          <div style={{ display: "flex", fontSize: 20, color: "#a6acc4", letterSpacing: 4, textTransform: "uppercase", marginBottom: 20 }}>
            Certificate of Completion
          </div>

          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, marginBottom: 20 }}>{name}</div>

          <div style={{ display: "flex", fontSize: 24, color: "#a6acc4", marginBottom: 8 }}>
            has successfully completed
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontWeight: 700,
              backgroundImage: "linear-gradient(120deg,#f5f6fb 0%,#c9cdf0 45%,#8b5cf6 100%)",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 30,
            }}
          >
            {path.skills.name} — {path.title}
          </div>

          <div style={{ display: "flex", fontSize: 18, color: "#6d7390" }}>Issued {date}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
