import Link from "next/link";
import { t, type Locale } from "@/lib/i18n";

export default function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-[var(--border)] mt-20">
      <div className="container-page py-8 text-sm text-[var(--muted)] flex flex-col sm:flex-row justify-between gap-4">
        <span>© {new Date().getFullYear()} SkillPath Africa</span>
        <span>{t(locale, "footer.tagline")}</span>
        <span className="flex gap-4">
          <Link href="/sell">{t(locale, "footer.teachWithUs")}</Link>
          <Link href="/terms">{t(locale, "footer.terms")}</Link>
          <Link href="/refund-policy">{t(locale, "footer.refunds")}</Link>
        </span>
      </div>
    </footer>
  );
}
