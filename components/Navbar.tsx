import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import MobileMenu from "@/components/MobileMenu";
import LanguageToggle from "@/components/LanguageToggle";
import { t, type Locale } from "@/lib/i18n";

export default async function Navbar({ locale }: { locale: Locale }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="border-b border-[var(--border)] relative">
      <div className="container-page h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          SkillPath <span style={{ color: "var(--primary)" }}>Africa</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/courses" className="hidden sm:inline">
            {t(locale, "nav.courses")}
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hidden sm:inline">
                {t(locale, "nav.dashboard")}
              </Link>
              {isAdmin && (
                <Link href="/admin" className="hidden sm:inline">
                  {t(locale, "nav.admin")}
                </Link>
              )}
              <LogoutButton locale={locale} />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline">
                {t(locale, "nav.login")}
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: "8px 18px" }}>
                {t(locale, "nav.getStarted")}
              </Link>
            </>
          )}
          <LanguageToggle />
          <MobileMenu loggedIn={Boolean(user)} isAdmin={isAdmin} locale={locale} />
        </nav>
      </div>
    </header>
  );
}
