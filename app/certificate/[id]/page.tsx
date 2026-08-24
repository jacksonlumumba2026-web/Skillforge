import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("learner_name, courses(title)")
    .eq("id", id)
    .maybeSingle();
  const course = certificate?.courses as unknown as { title: string } | null;
  if (!certificate || !course) return {};

  return {
    title: `${certificate.learner_name}'s Certificate — ${course.title}`,
    description: `${certificate.learner_name} completed ${course.title} on SkillPath Africa.`,
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Publicly readable by design (certificates_select_public policy) — this
  // page has no auth check, since the point is a link anyone can open.
  const { data: certificate } = await supabase
    .from("certificates")
    .select("*, courses(title, level)")
    .eq("id", id)
    .maybeSingle();
  if (!certificate) notFound();

  const course = certificate.courses as unknown as { title: string; level: string } | null;
  if (!course) notFound();

  const issuedDate = new Date(certificate.issued_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container-page py-16 max-w-2xl">
      <div
        className="card p-12 text-center"
        style={{ border: "2px solid var(--primary)" }}
      >
        <p className="text-sm font-semibold tracking-wide uppercase mb-8" style={{ color: "var(--primary)" }}>
          SkillPath Africa — Certificate of Completion
        </p>
        <p className="text-sm text-[var(--muted)] mb-2">This certifies that</p>
        <h1 className="text-3xl font-bold mb-4">{certificate.learner_name}</h1>
        <p className="text-sm text-[var(--muted)] mb-2">has successfully completed</p>
        <h2 className="text-xl font-semibold mb-8">{course.title}</h2>
        <p className="text-sm text-[var(--muted)]">Issued {issuedDate}</p>
      </div>

      <div className="text-center mt-8">
        <Link href="/courses" className="text-sm" style={{ color: "var(--primary)" }}>
          Explore more Learning Paths on SkillPath Africa
        </Link>
      </div>
    </div>
  );
}
