import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-[var(--border)]">
      <div className="container-page h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          SkillPath <span style={{ color: "var(--primary)" }}>Africa</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/courses" className="hidden sm:inline">
            Courses
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hidden sm:inline">
                Dashboard
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ padding: "8px 18px" }}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
