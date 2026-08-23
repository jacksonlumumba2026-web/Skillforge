"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  function setLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    setLocaleState(next);
    router.refresh();
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
