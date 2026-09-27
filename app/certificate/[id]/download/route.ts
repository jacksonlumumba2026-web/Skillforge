import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderCertificatePdf, certificateFilename } from "@/lib/certificatePdf";

/**
 * Serves a certificate as a landscape A4 PDF.
 *
 * Generated on the server on purpose. Building it in the browser would ship
 * jsPDF — several hundred kilobytes — to every learner who opens the page, on
 * a platform whose stated promise is being light on data, and it would need
 * the learner's name and course title plumbed into every place a download
 * link appears. As a route it is a plain link that behaves identically from
 * the dashboard, the course page and the certificate page, and costs nothing
 * until somebody actually asks for it.
 *
 * Public for the same reason the certificate page is: the point of a
 * certificate is a link its holder can hand to an employer.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("learner_name, issued_at, courses(title)")
    .eq("id", id)
    .maybeSingle();

  const course = certificate?.courses as unknown as { title: string } | null;
  if (!certificate || !course) {
    return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
  }

  const pdf = renderCertificatePdf({
    learnerName: certificate.learner_name,
    courseTitle: course.title,
    issuedAt: certificate.issued_at,
    certificateId: id,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${certificateFilename(course.title)}"`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
