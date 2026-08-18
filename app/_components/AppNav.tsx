"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AppNav({ label }: { label?: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="relative z-10 py-5 border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-2.5 font-bold text-lg">
          <span className="logo-mark">S</span>SkillForge
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {label && <span className="text-[var(--text-3)] hidden sm:inline">{label}</span>}
          <Link href="/dashboard" className="text-[var(--text-2)] hover:text-[var(--text-1)]">
            Dashboard
          </Link>
          <Link href="/billing" className="text-[var(--text-2)] hover:text-[var(--text-1)]">
            Billing
          </Link>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
