export const metadata = { title: "Terms of Service — SkillPath Africa" };

export default function TermsPage() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-[var(--muted)] mb-10">Last updated: 21 August 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold mb-2">1. Who we are</h2>
          <p>
            SkillPath Africa (&quot;we&quot;, &quot;us&quot;) is an online learning platform that
            organizes practical digital-skills courses — web development, digital marketing, design,
            freelancing, and more — into structured modules and lessons. By creating an account or
            buying a course, you agree to these Terms.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">2. What you&apos;re actually buying</h2>
          <p>
            Each lesson is built around a publicly available YouTube video from an independent
            creator or channel, selected and organized by us (in some cases with AI assistance) into
            a course structure, curriculum, and progress-tracking system. We don&apos;t own or
            control the underlying videos, and paying for a course doesn&apos;t grant rights to that
            video content beyond normal YouTube viewing — you&apos;re paying for the curation,
            structure, and learning experience we&apos;ve built around freely available material, not
            for exclusive or private content.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">3. Accounts</h2>
          <p>
            You need an account to buy or access courses. You&apos;re responsible for keeping your
            login credentials secure and for all activity under your account. Don&apos;t share your
            account or resell access to courses you&apos;ve purchased.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">4. Payments</h2>
          <p>
            Prices are shown in Kenyan Shillings (KES) and charged once per course through Paystack.
            We don&apos;t store your card or mobile money details — Paystack handles payment
            processing directly. Access is granted automatically once a payment is verified.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">5. Learning Path access</h2>
          <p>
            Once you&apos;ve paid for a Learning Path, you have ongoing access to it through your account for
            as long as SkillPath Africa operates, subject to these Terms. We may occasionally update,
            swap, or remove individual lesson videos (for example, if a video is taken down by its
            original creator) without changing the price you paid.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">6. AI-assisted courses</h2>
          <p>
            Some courses are generated on request from a topic you enter, using AI to select videos
            and write course descriptions. These are treated the same as any other course — same
            price, same access rules — but the curation was done automatically rather than
            hand-picked, and we can&apos;t guarantee the same level of review as our core catalog.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">7. Acceptable use</h2>
          <p>
            Don&apos;t scrape, redistribute, or resell course content or structure; don&apos;t attempt
            to bypass payment or access controls; don&apos;t use the platform for anything illegal.
            We may suspend accounts that violate this.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">8. Refunds</h2>
          <p>
            See our <a href="/refund-policy" style={{ color: "var(--primary)" }}>Refund Policy</a> for
            when and how refunds are available.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">9. Limitation of liability</h2>
          <p>
            The platform and its courses are provided &quot;as is&quot;. We don&apos;t guarantee that
            any course will lead to a specific job, income, or outcome. To the extent permitted by
            law, we&apos;re not liable for indirect or consequential losses arising from your use of
            the platform.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">10. Changes</h2>
          <p>
            We may update these Terms as the platform grows. Continued use after a change means you
            accept the updated Terms. Material changes will be reflected in the &quot;Last
            updated&quot; date above.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">11. Governing law</h2>
          <p>These Terms are governed by the laws of Kenya.</p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">12. Contact</h2>
          <p>
            Questions about these Terms:{" "}
            <a href="mailto:jacksonlumumba275@gmail.com" style={{ color: "var(--primary)" }}>
              jacksonlumumba275@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
