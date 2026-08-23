"use client";

import { useLocale } from "@/components/LocaleProvider";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "sw" : "en")}
      className="text-xs font-semibold px-2 py-1 rounded-md hidden sm:inline"
      style={{ background: "var(--surface)", color: "var(--muted)" }}
      aria-label="Switch language"
    >
      {locale === "en" ? "SW" : "EN"}
    </button>
  );
}
