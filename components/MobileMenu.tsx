"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { t, type Locale } from "@/lib/i18n";

export default function MobileMenu({
  loggedIn,
  isAdmin,
  locale,
}: {
  loggedIn: boolean;
  isAdmin: boolean;
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const { setLocale } = useLocale();

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="p-2 -mr-2"
      >
        <span aria-hidden className="text-xl leading-none">
          {open ? "✕" : "☰"}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 border-b border-[var(--border)] bg-[var(--background)] shadow-sm">
          <nav className="container-page py-4 flex flex-col gap-1 text-sm font-medium">
            <Link href="/courses" className="py-2" onClick={() => setOpen(false)}>
              {t(locale, "nav.courses")}
            </Link>
            {loggedIn ? (
              <>
                <Link href="/dashboard" className="py-2" onClick={() => setOpen(false)}>
                  {t(locale, "nav.dashboard")}
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="py-2" onClick={() => setOpen(false)}>
                    {t(locale, "nav.admin")}
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login" className="py-2" onClick={() => setOpen(false)}>
                {t(locale, "nav.login")}
              </Link>
            )}

            {/* The SW/EN toggle in the navbar is hidden below the sm breakpoint,
                so without this there is no way to reach the Swahili translation
                on a phone — which is most of the audience. The label is the
                language you are switching TO, written in that language: a
                learner looking for Swahili scans for "Kiswahili", not for a
                two-letter code. Endonyms, so they are deliberately not run
                through t(). */}
            <button
              type="button"
              onClick={() => {
                setLocale(locale === "en" ? "sw" : "en");
                setOpen(false);
              }}
              className="py-2 text-left border-t border-[var(--border)] mt-1 pt-3"
              style={{ color: "var(--primary)" }}
            >
              {locale === "en" ? "Kiswahili" : "English"}
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
