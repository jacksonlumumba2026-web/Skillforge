"use client";

import { createContext, useContext, useState } from "react";
import { LOCALE_COOKIE, t, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({
  locale: "en",
  setLocale: () => {},
});

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  function setLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    setLocaleState(next);

    // A full reload, not router.refresh(). Every string on the page is
    // translated server-side from this cookie, and refresh() did not re-read
    // it: the cookie changed, the toggle's own label flipped, and the page
    // stayed in English. That made the switch look functional while doing
    // nothing, on desktop and mobile alike.
    //
    // Reloading costs a round trip, which matters on a slow connection — but
    // a learner changes language roughly once, and a switch that works beats
    // one that is cheap.
    window.location.reload();
  }

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

/** For client components — server components should read the cookie directly via next/headers. */
export function useLocale() {
  return useContext(LocaleContext);
}

/** Convenience hook: t(key) bound to the current client-side locale. */
export function useTranslate() {
  const { locale } = useLocale();
  return (key: string) => t(locale, key);
}
