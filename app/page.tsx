import Link from "next/link";
import "./marketing.css";
import LandingInteractions from "./_components/LandingInteractions";

export default function LandingPage() {
  return (
    <div className="m-root">
      <div className="bg-glow" />
      <div className="grain" />
      <LandingInteractions />

      <header id="siteHeader" className="m-header">
        <div className="m-container">
          <nav className="m-nav">
            <Link href="#top" className="m-logo">
              <span className="logo-mark">S</span>SkillForge
            </Link>
            <ul className="m-nav-links" id="navLinks">
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#process">How it works</a>
              </li>
              <li>
                <a href="#paths">Skill paths</a>
              </li>
              <li>
                <a href="#testimonials">Reviews</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
            <div className="m-nav-cta">
              <Link href="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Start Free Trial
              </Link>
              <button className="m-nav-toggle" id="navToggle" aria-label="Menu">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="m-hero">
          <div className="m-container">
            <div className="m-hero-grid">
              <div data-reveal>
                <span className="m-eyebrow">
                  <span className="dot"></span> New — AI-curated learning paths from YouTube
                </span>
                <h1>
                  Master any <span className="grad">digital skill</span>, one guided path at a
                  time.
                </h1>
                <p className="lead">
                  Pick a skill. SkillForge instantly builds the clearest, fastest route to
                  mastery — hand-picked YouTube lessons, ordered step-by-step, with
                  plain-English breakdowns at every stage.
                </p>
                <div className="m-hero-ctas">
                  <Link href="/signup" className="btn btn-primary">
                    Start Free Trial →
                  </Link>
                  <a href="#process" className="btn btn-ghost">
                    See how it works
                  </a>
                </div>
                <div className="m-trust-row">
                  <div className="m-trust-item">
                    <div className="m-avatars">
                      <span>JD</span>
                      <span>MK</span>
                      <span>AR</span>
                    </div>
                    <span>12,000+ learners</span>
                  </div>
                  <div className="m-trust-item">
                    <span className="m-stars">★★★★★</span> 4.9/5 average rating
                  </div>
                </div>
              </div>

              <div className="m-hero-visual" data-reveal>
                <div className="m-mock-frame">
                  <div className="m-float-card streak">
                    <div>🔥</div>
                    <div>
                      <div className="num">7 days</div>
                      <div className="lbl">learning streak</div>
                    </div>
                  </div>
                  <div className="m-mock-frame-top">
                    <div className="m-mock-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div className="m-mock-path-title">YOUR PATH · GRAPHIC DESIGN</div>
                  </div>
                  <div className="progress-track" style={{ marginBottom: 20 }}>
                    <div className="progress-fill" style={{ width: "42%" }} />
                  </div>
                  <div className="m-lesson-row">
                    <div className="m-lesson-thumb">✓</div>
                    <div className="m-lesson-meta">
                      <div className="t">Design fundamentals &amp; color theory</div>
                      <div className="d">12 min · Step 1</div>
                    </div>
                    <div className="m-lesson-status">Done</div>
                  </div>
                  <div className="m-lesson-row">
                    <div className="m-lesson-thumb">▶</div>
                    <div className="m-lesson-meta">
                      <div className="t">Typography that doesn&apos;t look amateur</div>
                      <div className="d">18 min · Step 2</div>
                    </div>
                    <div className="m-lesson-status">Now</div>
                  </div>
                  <div className="m-lesson-row">
                    <div className="m-lesson-thumb">▶</div>
                    <div className="m-lesson-meta">
                      <div className="t">Layout, grids &amp; visual hierarchy</div>
                      <div className="d">21 min · Step 3</div>
                    </div>
                    <div className="m-lesson-status">Next</div>
                  </div>
                  <div className="m-lesson-row">
                    <div className="m-lesson-thumb">🔒</div>
                    <div className="m-lesson-meta">
                      <div className="t">Build your first client project</div>
                      <div className="d">34 min · Step 4</div>
                    </div>
                    <div className="m-lesson-status">Locked</div>
                  </div>
                  <div className="m-float-card rate">
                    <div>📈</div>
                    <div>
                      <div className="num">98%</div>
                      <div className="lbl">path completion rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF / STATS */}
        <section>
          <div className="m-container">
            <div className="m-stats-bar" data-reveal>
              <div className="m-stat">
                <div className="n">12,400+</div>
                <div className="l">active learners</div>
              </div>
              <div className="m-stat">
                <div className="n">300+</div>
                <div className="l">curated skill paths</div>
              </div>
              <div className="m-stat">
                <div className="n">4.9 / 5</div>
                <div className="l">average path rating</div>
              </div>
              <div className="m-stat">
                <div className="n">6.2×</div>
                <div className="l">faster than self-guided search</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features">
          <div className="m-container">
            <div className="m-section-head" data-reveal>
              <span className="tag">Why SkillForge</span>
              <h2>Stop searching. Start mastering.</h2>
              <p>
                Every path is built to remove the guesswork — so your time goes into learning,
                not into deciding what to watch next.
              </p>
            </div>
            <div className="m-feature-grid">
              {[
                {
                  icon: "🧭",
                  title: "Personalized skill paths",
                  body: "Tell us what you want to learn and your current level — get a custom curriculum built just for you, not a generic playlist.",
                },
                {
                  icon: "🎬",
                  title: "Best-of-YouTube curation",
                  body: "We scan and rank thousands of tutorials so you only ever watch the clearest, most highly-rated lesson for each step.",
                },
                {
                  icon: "📋",
                  title: "Step-by-step breakdowns",
                  body: "Every video comes with a plain-English summary and action checklist, so nothing gets lost in a 40-minute tutorial.",
                },
                {
                  icon: "📊",
                  title: "Progress you can see",
                  body: "Track streaks, completion, and mastery milestones — the same dopamine loop that makes habits stick, built for learning.",
                },
                {
                  icon: "🕒",
                  title: "Learn at your own pace",
                  body: "Bite-sized sessions fit around a job, school, or family life. Ten focused minutes a day compounds fast.",
                },
                {
                  icon: "🏆",
                  title: "Certificates of mastery",
                  body: "Finish a path and earn a shareable certificate — proof of skill you can add straight to your resume or LinkedIn.",
                },
              ].map((f) => (
                <div className="card card-hover m-card" data-reveal key={f.title}>
                  <div className="m-icon-box">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process">
          <div className="m-container">
            <div className="m-section-head" data-reveal>
              <span className="tag">How it works</span>
              <h2>From &quot;no idea where to start&quot; to mastery in four steps.</h2>
              <p>No fluff, no decision fatigue — SkillForge does the planning so you can just press play.</p>
            </div>
            <div className="m-timeline">
              {[
                {
                  num: "01",
                  title: "Choose your skill",
                  body: "Browse our curated digital skills — from graphic design to copywriting, video editing to AI tools — or search for exactly what you need.",
                },
                {
                  num: "02",
                  title: "Get your custom path",
                  body: "Our engine builds a step-by-step curriculum from the best YouTube lessons available, ordered from fundamentals to fluency.",
                },
                {
                  num: "03",
                  title: "Learn with guided breakdowns",
                  body: "Watch each lesson with a plain-English summary and action checklist alongside it, so every minute of video counts.",
                },
                {
                  num: "04",
                  title: "Track progress & master it",
                  body: "Hit milestones, keep your streak alive, and finish with a certificate that proves what you've learned.",
                },
              ].map((s) => (
                <div className="m-step" data-reveal key={s.num}>
                  <div className="m-step-num">{s.num}</div>
                  <div className="m-step-body">
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SKILL PATHS */}
        <section id="paths">
          <div className="m-container">
            <div className="m-section-head" data-reveal>
              <span className="tag">Popular right now</span>
              <h2>Explore in-demand skill paths</h2>
              <p>A sample of the curated paths learners are working through this month.</p>
            </div>
            <div className="m-path-grid">
              {[
                { grad: "g1", level: "Beginner", title: "Graphic Design Fundamentals", weeks: "6 weeks", lessons: "24 lessons" },
                { grad: "g2", level: "Intermediate", title: "Copywriting That Converts", weeks: "4 weeks", lessons: "18 lessons" },
                { grad: "g3", level: "Beginner", title: "Video Editing Essentials", weeks: "5 weeks", lessons: "22 lessons" },
                { grad: "g4", level: "Beginner", title: "No-Code App Development", weeks: "7 weeks", lessons: "28 lessons" },
                { grad: "g5", level: "Intermediate", title: "Digital Marketing & SEO", weeks: "6 weeks", lessons: "26 lessons" },
                { grad: "g6", level: "Beginner", title: "AI Tools & Prompt Engineering", weeks: "3 weeks", lessons: "15 lessons" },
              ].map((p) => (
                <div className="m-path-card" data-reveal key={p.title}>
                  <div className={`m-path-thumb ${p.grad}`}>
                    <span className="lvl">{p.level}</span>
                  </div>
                  <div className="m-path-body">
                    <h3>{p.title}</h3>
                    <div className="meta">
                      <span>🕒 {p.weeks}</span>
                      <span>📚 {p.lessons}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials">
          <div className="m-container">
            <div className="m-section-head" data-reveal>
              <span className="tag">Learner stories</span>
              <h2>Loved by people building real skills</h2>
              <p>A few examples of the outcomes SkillForge paths are designed to deliver.</p>
            </div>
            <div className="m-testi-grid">
              {[
                {
                  quote: "I'd bookmarked a dozen 'learn design' playlists and never finished one. SkillForge turned it into an actual path — I shipped my first freelance project in six weeks.",
                  initials: "NA",
                  name: "Nia A.",
                  role: "Freelance Designer",
                },
                {
                  quote: "The step-by-step breakdowns are the whole thing for me. I stopped rewatching videos trying to catch what I missed — it's all summarized right there.",
                  initials: "DT",
                  name: "Daniel T.",
                  role: "Marketing Associate",
                },
                {
                  quote: "I'm learning no-code development ten minutes a day between meetings. The streak tracker is annoyingly effective at keeping me consistent.",
                  initials: "RK",
                  name: "Rina K.",
                  role: "Product Manager",
                },
              ].map((t) => (
                <div className="m-testi-card" data-reveal key={t.name}>
                  <span className="stars m-stars">★★★★★</span>
                  <p className="quote">&quot;{t.quote}&quot;</p>
                  <div className="m-testi-person">
                    <div className="m-testi-avatar">{t.initials}</div>
                    <div>
                      <div className="name">{t.name}</div>
                      <div className="role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing">
          <div className="m-container">
            <div className="m-section-head" data-reveal>
              <span className="tag">Simple pricing</span>
              <h2>Try any skill path free for 7 days</h2>
              <p>Full access, no restrictions. Cancel anytime before your trial ends and you won&apos;t be charged.</p>
            </div>
            <div
              className="m-feature-grid"
              style={{ maxWidth: 900, margin: "0 auto", gridTemplateColumns: "1fr 1fr" }}
            >
              <div className="card card-hover m-card" data-reveal>
                <div className="m-icon-box">🎓</div>
                <h3>Monthly</h3>
                <p style={{ marginBottom: 18 }}>Full access to every skill path, updated monthly.</p>
                <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "2.2rem", fontWeight: 700, marginBottom: 4 }}>
                  $19<span style={{ fontSize: "1rem", color: "var(--text-3)", fontFamily: "var(--font-inter)", fontWeight: 500 }}>/mo</span>
                </div>
                <div style={{ color: "var(--text-3)", fontSize: ".82rem", marginBottom: 24 }}>after your free 7-day trial</div>
                <Link href="/signup?plan=monthly" className="btn btn-primary btn-block">
                  Start Free Trial
                </Link>
              </div>
              <div className="card card-hover m-card" data-reveal style={{ borderColor: "var(--accent-1)", position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    top: -12,
                    right: 24,
                    background: "var(--grad-main)",
                    padding: "4px 14px",
                    borderRadius: 100,
                    fontSize: ".72rem",
                    fontWeight: 700,
                  }}
                >
                  BEST VALUE
                </span>
                <div className="m-icon-box">🚀</div>
                <h3>Annual</h3>
                <p style={{ marginBottom: 18 }}>Same full access — 2 months free versus paying monthly.</p>
                <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "2.2rem", fontWeight: 700, marginBottom: 4 }}>
                  $15<span style={{ fontSize: "1rem", color: "var(--text-3)", fontFamily: "var(--font-inter)", fontWeight: 500 }}>/mo</span>
                </div>
                <div style={{ color: "var(--text-3)", fontSize: ".82rem", marginBottom: 24 }}>billed annually, after trial</div>
                <Link href="/signup?plan=annual" className="btn btn-primary btn-block">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className="m-container">
            <div className="m-section-head" data-reveal>
              <span className="tag">Questions</span>
              <h2>Frequently asked questions</h2>
            </div>
            <div className="m-faq-list" data-reveal>
              {[
                {
                  q: "How does SkillForge actually work?",
                  a: "You choose a digital skill and your current level. SkillForge builds a step-by-step path from the best available YouTube tutorials, each with a plain-English breakdown and checklist so you know exactly what to do at every stage.",
                },
                {
                  q: "Is the free trial really free?",
                  a: "Yes — you get full access to every skill path for 7 days. Cancel any time before the trial ends and you won't be charged.",
                },
                {
                  q: "Do I need a YouTube account?",
                  a: "No. Videos play right inside SkillForge using YouTube's official player — you don't need a separate YouTube login to follow a path.",
                },
                {
                  q: "How long does it take to learn a skill?",
                  a: "It depends on the skill and your pace, but most paths are designed to take you from fundamentals to a real, usable project in 3–7 weeks at 15–30 minutes a day.",
                },
                {
                  q: "What skills can I learn?",
                  a: "A hand-picked, growing set of paths across design, marketing, development, video, writing, and AI tools — with new paths added regularly based on learner requests.",
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes, cancel with one click from your billing settings — no calls, no forms, no hassle.",
                },
              ].map((item, i) => (
                <details key={item.q} open={i === 0}>
                  <summary>{item.q}</summary>
                  <div className="m-faq-a">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section>
          <div className="m-container">
            <div className="m-cta-panel" data-reveal>
              <h2>Your next skill is one path away.</h2>
              <p>Join 12,000+ learners already mastering digital skills the guided way.</p>
              <div className="m-hero-ctas">
                <Link href="/signup" className="btn btn-primary">
                  Start Free Trial →
                </Link>
              </div>
              <div className="m-cta-note">No credit card charge until your 7-day trial ends · Cancel anytime</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="m-footer">
        <div className="m-container">
          <div className="m-footer-grid">
            <div className="m-footer-brand">
              <Link href="#top" className="m-logo">
                <span className="logo-mark">S</span>SkillForge
              </Link>
              <p>The fastest way to go from curious to competent — one guided, YouTube-powered learning path at a time.</p>
              <div className="m-social-row">
                <a href="#" aria-label="Twitter">𝕏</a>
                <a href="#" aria-label="Instagram">◎</a>
                <a href="#" aria-label="LinkedIn">in</a>
              </div>
            </div>
            <div className="m-footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#process">How it works</a>
              <a href="#paths">Skill paths</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="m-footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Contact</a>
            </div>
            <div className="m-footer-col">
              <h4>Legal</h4>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
          <div className="m-footer-bottom">
            <span>© 2026 SkillForge. All rights reserved.</span>
            <span>Built for learners everywhere.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
