"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { t, type Locale } from "@/lib/i18n";

export default function LogoutButton({ locale }: { locale: Locale }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: "8px 18px" }}>
      {t(locale, "nav.logout")}
    </button>
  );
}
