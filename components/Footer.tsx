import Link from "next/link";
import { t, tf, type Locale } from "@/lib/i18n";
import { BUNDLE_COURSE_COUNT, BUNDLE_PRICE } from "@/lib/pricing";

export default function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-[var(--border)] mt-20">
      <div className="container-page py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          <div>
            <p className="font-semibold mb-2">SkillPath Africa</p>
            <p className="text-sm text-[var(--muted)] max-w-xs">{t(locale, "footer.blurb")}</p>
          </div>

          <div>
            <p className="font-semibold mb-3 text-sm">{t(locale, "footer.learn")}</p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>
                <Link href="/courses">{t(locale, "footer.allPaths")}</Link>
              </li>
              <li>
                <Link href="/bundle">
                  {tf(locale, "home.bundleCta", {
                    count: BUNDLE_COURSE_COUNT,
                    price: BUNDLE_PRICE.toLocaleString(),
                  })}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-3 text-sm">{t(locale, "footer.company")}</p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>
                <Link href="/sell">{t(locale, "footer.teachWithUs")}</Link>
              </li>
              <li>
                <Link href="/terms">{t(locale, "footer.terms")}</Link>
              </li>
              <li>
                <Link href="/refund-policy">{t(locale, "footer.refunds")}</Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-sm text-[var(--muted)] pt-6 border-t border-[var(--border)]">
          © {new Date().getFullYear()} SkillPath Africa — {t(locale, "footer.tagline")}
        </p>
      </div>
    </footer>
  );
}
