"use client";

import { useState } from "react";
import Link from "next/link";
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
          </nav>
        </div>
      )}
    </div>
  );
}
