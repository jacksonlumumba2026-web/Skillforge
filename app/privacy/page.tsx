export const metadata = { title: "Privacy Policy — SkillPath Africa" };

export default function PrivacyPage() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-[var(--muted)] mb-10">Last updated: 14 October 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold mb-2">1. Who we are</h2>
          <p>
            SkillPath Africa (&quot;we&quot;, &quot;us&quot;) runs this online learning platform. This
            policy explains what personal data we collect, why, who else can see it, and what you can
            do about it. It covers the website and everything you do while signed in.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">2. What we collect</h2>
          <p className="mb-3">Only what the platform actually needs to work:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Your account</strong> — name, email address, and the date you registered. If
              you sign in with Google, we receive your name and email address from Google, nothing
              else.
            </li>
            <li>
              <strong>Your password</strong> — handled by our authentication provider and stored only
              as a cryptographic hash. We never see or store the password itself.
            </li>
            <li>
              <strong>Payments</strong> — the amount, the course, the payment method, whether it
              succeeded, and a reference number. For M-Pesa we also store the phone number you asked
              us to charge and, where you enter one manually, the confirmation code.
            </li>
            <li>
              <strong>Learning activity</strong> — which Learning Paths you have access to, which
              lessons you have marked complete, any capstone project you submit, and any course review
              you write.
            </li>
            <li>
              <strong>Reminders and notifications</strong> — if you turn on study reminders, the time
              of day you chose and your time-zone offset; if you allow browser notifications, the
              subscription details your browser issues so we can send them.
            </li>
            <li>
              <strong>Messages you send us</strong> — for example an instructor application, which
              records your name, email, topic and message.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-2">3. What we never collect</h2>
          <p>
            We do not receive or store card numbers, CVV codes, bank details, or your M-Pesa PIN.
            Those go directly to the payment provider and never reach our servers.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">4. Why we hold it</h2>
          <p>
            To give you access to what you paid for, to keep your progress between devices, to issue
            certificates, to answer you when something goes wrong, and to keep the financial records a
            business is required to keep. We do not sell your data, and we do not use it for
            advertising.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">5. Who else can see it</h2>
          <p className="mb-3">
            We share data with the services needed to run the platform, and only what each one needs:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Supabase</strong> — hosts our database and handles sign-in.
            </li>
            <li>
              <strong>Vercel</strong> — hosts the website and keeps short-lived technical logs of
              requests, which include IP addresses.
            </li>
            <li>
              <strong>Paystack</strong> — processes card and bank payments.
            </li>
            <li>
              <strong>Safaricom (M-Pesa)</strong> — processes M-Pesa payments.
            </li>
            <li>
              <strong>Google</strong> — provides Google sign-in if you use it.
            </li>
          </ul>
          <p className="mt-3">
            These providers operate infrastructure outside Kenya, so your data may be stored or
            processed abroad. We share data with no one else, except where the law requires it.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">6. Lesson videos are on YouTube</h2>
          <p>
            Every lesson plays a YouTube video embedded from Google&apos;s servers. When a video
            loads, Google receives your IP address and can set its own cookies, under its own privacy
            policy rather than ours. This happens whether or not you have a Google account, and it is
            the one part of using this platform where another company observes you directly.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">7. Certificates are public</h2>
          <p>
            A certificate you earn has its own web page so you can share it with an employer. Anyone
            with the link can open it and see the name on the certificate, the Learning Path, and the
            date it was issued. That is the point of a certificate, but it is worth knowing before you
            share one. Ask us and we will take yours down.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">8. Cookies</h2>
          <p>
            We use a cookie to keep you signed in, and your browser&apos;s local storage to remember
            small preferences such as your language choice. We do not use advertising or tracking
            cookies. YouTube sets its own cookies when a lesson video plays, as described above.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">9. How long we keep it</h2>
          <p>
            Your account and learning records stay until you ask us to delete them. Payment records
            are kept longer, because tax and accounting rules in Kenya require it, even after an
            account is closed.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">10. Your rights</h2>
          <p className="mb-3">
            Under the Kenyan Data Protection Act, 2019 you can ask us to show you the data we hold
            about you, correct it if it is wrong, delete it, or stop using it in a particular way. You
            can also withdraw consent for things like study reminders at any time.
          </p>
          <p>
            Email us and we will respond. If you are not satisfied with how we handle it, you can
            complain to the Office of the Data Protection Commissioner (ODPC) in Kenya. Data
            protection rules change, so check the ODPC&apos;s current guidance rather than relying on
            this page alone.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">11. Children</h2>
          <p>
            The platform is meant for people aged 18 and over. If you are younger, use it only with a
            parent or guardian&apos;s involvement. If you believe a child has given us personal data
            without that, tell us and we will remove it.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">12. Changes</h2>
          <p>
            We may update this policy as the platform grows. Material changes will be reflected in the
            &quot;Last updated&quot; date above.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">13. Contact</h2>
          <p>
            Questions about your data, or a request to access or delete it:{" "}
            <a href="mailto:jacksonlumumba275@gmail.com" style={{ color: "var(--primary)" }}>
              jacksonlumumba275@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
