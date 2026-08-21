import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-20">
      <div className="container-page py-8 text-sm text-[var(--muted)] flex flex-col sm:flex-row justify-between gap-4">
        <span>© {new Date().getFullYear()} SkillPath Africa</span>
        <span>Practical digital skills, one lesson at a time.</span>
        <span className="flex gap-4">
          <Link href="/sell">Teach with us</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refund-policy">Refunds</Link>
        </span>
      </div>
    </footer>
  );
}
