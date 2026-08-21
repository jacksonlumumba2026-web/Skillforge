import type { Metadata } from "next";
import SellForm from "./SellForm";

export const metadata: Metadata = {
  title: "Teach on SkillPath Africa",
  description: "Interested in creating a course for SkillPath Africa? Tell us what you'd teach.",
};

export default function SellPage() {
  return (
    <div className="container-page py-16 max-w-xl">
      <h1 className="text-2xl font-bold mb-2">Teach on SkillPath Africa</h1>
      <p className="text-[var(--muted)] mb-8">
        We&apos;re exploring letting other instructors create courses on the platform. If you&apos;d
        like to teach a digital skill here, leave your details below — we&apos;re not onboarding
        instructors yet, but we&apos;ll reach out as soon as we open it up.
      </p>
      <SellForm />
    </div>
  );
}
