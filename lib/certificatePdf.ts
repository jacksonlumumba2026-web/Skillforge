import { jsPDF } from "jspdf";
import { SITE_URL } from "@/lib/site";

/**
 * Draws a certificate as a landscape A4 PDF and returns the bytes.
 *
 * Kept apart from the route so the layout can be exercised directly with
 * awkward inputs — a very long name, a very long course title — without
 * needing a database or a running server.
 */

const BLUE = { r: 37, g: 99, b: 235 };
const SLATE = { r: 15, g: 23, b: 42 };
const MUTED = { r: 100, g: 116, b: 139 };

export type CertificateFields = {
  learnerName: string;
  courseTitle: string;
  issuedAt: string;
  certificateId: string;
};

export function renderCertificatePdf({
  learnerName,
  courseTitle,
  issuedAt,
  certificateId,
}: CertificateFields): Buffer {
  const issuedDate = new Date(issuedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centre = pageWidth / 2;

  doc.setDrawColor(BLUE.r, BLUE.g, BLUE.b);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.3);
  doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(BLUE.r, BLUE.g, BLUE.b);
  doc.text("SKILLPATH AFRICA", centre, 34, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("CERTIFICATE OF COMPLETION", centre, 43, { align: "center" });

  doc.setFontSize(11);
  doc.text("This certifies that", centre, 63, { align: "center" });

  // Shrink the name to fit rather than let it run off the page — names here
  // are routinely long, and a certificate with a clipped name is worthless.
  doc.setFont("helvetica", "bold");
  doc.setTextColor(SLATE.r, SLATE.g, SLATE.b);
  let nameSize = 34;
  doc.setFontSize(nameSize);
  while (doc.getTextWidth(learnerName) > pageWidth - 70 && nameSize > 14) {
    nameSize -= 2;
    doc.setFontSize(nameSize);
  }
  doc.text(learnerName, centre, 80, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("has successfully completed the Learning Path", centre, 94, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(SLATE.r, SLATE.g, SLATE.b);
  const titleLines = doc.splitTextToSize(courseTitle, pageWidth - 80) as string[];
  doc.text(titleLines, centre, 108, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text(`Issued ${issuedDate}`, centre, 108 + titleLines.length * 9 + 10, { align: "center" });

  // A certificate nobody can check is decoration, so every PDF carries the
  // address of the page that proves it.
  doc.setFontSize(8);
  doc.text(
    `Verify at ${SITE_URL.replace(/^https?:\/\//, "")}/certificate/${certificateId}`,
    centre,
    pageHeight - 20,
    { align: "center" },
  );

  return Buffer.from(doc.output("arraybuffer"));
}

/** Filename-safe course title for the Content-Disposition header. */
export function certificateFilename(courseTitle: string): string {
  const safe = courseTitle.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `SkillPath-${safe || "Certificate"}-Certificate.pdf`;
}
