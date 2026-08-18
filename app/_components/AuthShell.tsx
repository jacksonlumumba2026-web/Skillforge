import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="bg-glow" />
      <div className="grain" />
      <header className="relative z-10 py-6">
        <div className="max-w-6xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-lg">
            <span className="logo-mark">S</span>SkillForge
          </Link>
        </div>
      </header>
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="glass-panel px-8 py-10 sm:px-10">
            <h1 className="text-2xl sm:text-3xl mb-2">{title}</h1>
            <p className="text-[var(--text-2)] text-sm mb-8">{subtitle}</p>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
