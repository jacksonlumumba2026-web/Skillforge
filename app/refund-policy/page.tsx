export const metadata = { title: "Refund Policy — SkillPath Africa" };

export default function RefundPolicyPage() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Refund Policy</h1>
      <p className="text-sm text-[var(--muted)] mb-10">Last updated: 21 August 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold mb-2">When you can get a refund</h2>
          <p>
            You can request a full refund within <strong>48 hours</strong> of buying a course, as long
            as you haven&apos;t marked more than one lesson as complete in it. This gives you room to
            preview a course and change your mind if it&apos;s not what you expected.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">When we won&apos;t refund</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>More than 48 hours have passed since payment.</li>
            <li>You&apos;ve completed two or more lessons in the course.</li>
            <li>The request is for a reason unrelated to the course itself (e.g. changed your mind about learning the skill after finishing it).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Always refunded, no time limit</h2>
          <p>
            If you were charged but never got access to a course due to a technical error on our end,
            or you were charged twice for the same course, that&apos;s always refunded in full —
            contact us and we&apos;ll fix it, regardless of how much time has passed.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">How to request one</h2>
          <p>
            Email{" "}
            <a href="mailto:jacksonlumumba275@gmail.com" style={{ color: "var(--primary)" }}>
              jacksonlumumba275@gmail.com
            </a>{" "}
            with the email address you used to buy the course and which course it&apos;s for.
            Approved refunds are sent back to your original Paystack payment method and typically
            take 5-10 business days to reflect, depending on your bank or mobile money provider.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Questions</h2>
          <p>
            See our{" "}
            <a href="/terms" style={{ color: "var(--primary)" }}>
              Terms of Service
            </a>{" "}
            for the rest of our policies, or email us at the address above.
          </p>
        </section>
      </div>
    </div>
  );
}
