"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { tf, t } from "@/lib/i18n";
import { BUNDLE_COURSE_COUNT, BUNDLE_PRICE } from "@/lib/pricing";

const DISMISSED_KEY = "bundleBarDismissed";

/**
 * Shown only where somebody is actually choosing what to buy — the home page
 * and the catalogue. Deliberately NOT on the lesson player (it would sit on
 * top of "mark lesson complete"), the auth pages, the dashboard, admin, or
 * /bundle itself, where it would be either an obstruction or an advert for
 * the page you are already on.
 */
function showsOn(pathname: string): boolean {
  return pathname === "/" || pathname === "/courses";
}

export default function BundleBar() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Starts hidden and is revealed here, so a viewer who dismissed it never
    // sees it flash on the way through. localStorage throws in some private
    // modes and returns nothing when site data is cleared, so a failure just
    // means the bar shows — never that the page breaks.
    // Reading localStorage during render is not possible (no window on the
    // server) and would produce a hydration mismatch, so an effect that runs
    // once on mount is correct here rather than the anti-pattern this rule
    // usually catches.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(window.localStorage.getItem(DISMISSED_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Per-viewer convenience only; nothing depends on it persisting.
    }
  }

  if (dismissed || !showsOn(pathname)) return null;

  return (
    <>
      {/* Occupies real layout space so the fixed bar never covers the last
          thing on the page. Only exists while the bar does. */}
      <div className="h-20 sm:hidden" aria-hidden />

      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
          background: "var(--background)",
          borderColor: "var(--border)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/bundle" className="btn btn-primary flex-1 text-center">
            {tf(locale, "home.bundleCta", {
              count: BUNDLE_COURSE_COUNT,
              price: BUNDLE_PRICE.toLocaleString(),
            })}
          </Link>
          <button
            onClick={dismiss}
            aria-label={t(locale, "bundleBar.dismiss")}
            className="p-2 -mr-1 text-xl leading-none"
            style={{ color: "var(--muted)" }}
          >
            <span aria-hidden>✕</span>
          </button>
        </div>
      </div>
    </>
  );
}
