import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import ShareButtons from "@/app/_components/ShareButtons";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: cert } = await admin
    .from("certificates")
    .select("*, learning_paths(title, level, skills(name, icon))")
    .eq("id", id)
    .single();
  if (!cert) notFound();

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", cert.user_id)
    .single();

  const path = cert.learning_paths as unknown as {
    title: string;
    level: string;
    skills: { name: string; icon: string };
  };
  const name = profile?.full_name || profile?.email || "SkillForge Learner";
  const date = new Date(cert.issued_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const imageUrl = `/api/certificates/${id}/image`;

  return (
    <div className="min-h-screen relative">
      <div className="bg-glow" />
      <div className="grain" />
      <header className="relative z-10 py-6">
        <div className="max-w-5xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-lg">
            <span className="logo-mark">S</span>SkillForge
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-10 text-center">
        <span className="tag">Certificate of completion</span>
        <h1 className="text-2xl sm:text-3xl mt-3 mb-8">{name}&apos;s achievement</h1>

        <div className="mb-10 rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)] shadow-[var(--shadow-glow)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={`Certificate of completion for ${name} — ${path.skills.name}`} className="w-full block" />
        </div>

        <p className="text-[var(--text-2)] mb-10">
          {name} completed the <strong>{path.title}</strong> path ({path.level} level) on {date}.
        </p>

        <ShareButtons imageUrl={imageUrl} />
      </main>
    </div>
  );
}
