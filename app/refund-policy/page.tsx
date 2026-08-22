export const metadata = { title: "Refund Policy — SkillPath Africa" };

export default function RefundPolicyPage() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Refund Policy</h1>
      <p className="text-sm text-[var(--muted)] mb-10">Last updated: 22 August 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold mb-2">All sales are final</h2>
          <p>
            Once you&apos;ve paid for a course, that purchase is final. We don&apos;t offer refunds
            for changing your mind, not having time to finish a course, or expecting different
            content than what&apos;s taught. Every course page lists its curriculum and lesson
            count up front — please review it before you buy.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">The one exception: our mistake</h2>
          <p>
            If you were charged but never got access to a course due to a technical error on our
            end, or you were charged twice for the same course, we&apos;ll fix that — that&apos;s
            us correcting a billing error, not a refund for the course itself.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Report a billing error</h2>
          <p>
            Email{" "}
            <a href="mailto:jacksonlumumba275@gmail.com" style={{ color: "var(--primary)" }}>
              jacksonlumumba275@gmail.com
            </a>{" "}
            with the email address you used and which course it&apos;s for.
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
