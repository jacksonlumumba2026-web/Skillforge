# SkillPath Africa

A simple, paid digital-skills learning platform. Structured courses →
modules → lessons, each lesson backed by a YouTube video. Users pay once per
course (Paystack) to unlock it.

Next.js (App Router) + TypeScript + Tailwind CSS, Supabase (auth + Postgres +
RLS), Paystack (payments), plain YouTube embeds. Deploys to Vercel.

Architecturally simple by design — no microservices, one Postgres database,
server-enforced access control (RLS) instead of clever frontend tricks —
even as the feature set has deliberately grown well past the original v1
scope (AI course generation, an admin dashboard, certificates, reviews,
SEO). Every new table still follows the same access pattern: RLS enforces
who can read/write directly, and privileged server-side writes go through
either the caller's own RLS-respecting client or the service role, never a
custom authorization layer bolted on top.

## Status: All 5 phases + AI course generator + curated catalog + SEO + engagement features complete

- [x] **Ratings & reviews** — an enrolled learner can rate (1-5 stars) and
      review a course from its detail page (`/api/reviews`, upsert —
      editing overwrites their own review). Enforced entirely by RLS
      (`course_reviews_insert_own_enrolled`), the same "caller's own client,
      not the service role" pattern as `lesson_progress` — verified live
      that an enrolled insert succeeds and a non-enrolled one is rejected.
      Reviews are public (social proof for buyers who haven't purchased
      yet); `reviewer_name` is snapshotted at write time since `profiles`
      has no public read policy to join a live name from — same approach
      as `certificates.learner_name`. Average rating shows on `CourseCard`,
      the course detail page, and in the page's `AggregateRating` JSON-LD.

- [x] **SEO** — real per-page metadata (title template, description,
      Open Graph, Twitter card) via `metadataBase` in `app/layout.tsx`;
      `/courses/[courseId]` gets `generateMetadata()` per course plus
      `Course` JSON-LD structured data; `app/sitemap.ts` lists every
      published course (regenerated on each request, so new courses from
      the daily catalog job or `/courses/request` show up automatically);
      `app/robots.ts` disallows the private routes
      (`/dashboard`, `/admin`, `/learn`, `/courses/request`). No OG image
      yet — social previews are text-only until one's added.
- [x] **"Teach on SkillPath Africa" waitlist** (`/sell`) — a lead-capture
      form, not real seller accounts. Submissions go into
      `instructor_applications` (service-role only — no RLS read/write
      policies for anon/authenticated at all) via `POST
      /api/instructor-applications`, viewable at
      `/admin/instructor-applications`. Deliberately just a waitlist so we
      can gauge real demand before building the much bigger marketplace
      machinery a real multi-seller model would need (seller onboarding,
      content review, revenue splits, payouts).

- [x] **Phase 0** — Project structure, config, DB schema, Supabase clients,
      middleware, stub pages/routes for everything in the plan.
- [x] **Phase 1** — Homepage (hero, why-learn section, popular courses),
      `/courses` grid, `/courses/[courseId]` detail with real curriculum
      (modules + lesson titles via the public `lesson_previews` view,
      locked with a 🔒 for non-enrolled visitors, unlocked with links into
      `/learn` for enrolled ones).
- [x] **Phase 2** — Live Supabase project, full schema, email/password
      auth (register/login/logout), profiles auto-created on signup,
      protected `/dashboard`, RLS on every table.
- [x] **Phase 3** — Lesson player (`/learn/[courseId]/[lessonId]`): YouTube
      embed, description, Mark Lesson Complete, Next Lesson, progress bar,
      "Course Completed!" state. `/learn` is auth-protected; a locked
      lesson (exists but not enrolled) shows a clear message instead of a
      bare 404. Dashboard's Continue Learning now points at the next
      *incomplete* lesson, not always the first.
- [x] **AI course generator** — `/courses/request`: a logged-in learner
      types a topic, level, and optional goal; the server curates real
      YouTube tutorials (`lib/youtube.ts`), writes course/module/lesson
      copy with Claude (`lib/courseContent.ts`), and persists the whole
      thing as a normal published, paid (KES 500) course
      (`lib/courseGenerator.ts`, `POST /api/courses/generate`). Requesting
      the same topic+level again reuses the existing course instead of
      generating a duplicate. `courses.generated_by` records who triggered
      it, for future admin visibility. Capped at 3 new generations per
      learner per 24h (cache hits on an already-generated topic don't
      count) — each real generation costs an Anthropic call plus YouTube
      quota, so nothing else here rate-limits repeated requests.
- [x] **Curated catalog** — real, hand-researched courses (not
      placeholders), added in daily batches of 10 by an automated job
      (`trig_01XLqpWy1SvSGEFaiTqEhPrC`, 11 days total). Day 1
      (`0006_curated_catalog.sql`): Freelancing, Web Development for
      Beginners, Graphic Design, Digital Marketing, AI Tools for Everyday
      Work, Video Editing, Social Media Management, Virtual Assistance &
      Data Entry, Copywriting & Content Writing, Excel & Spreadsheets for
      Work. Day 2 (`0012_curated_catalog_day2.sql`): UI/UX Design (Figma),
      E-commerce & Online Selling, Email Marketing, Cybersecurity & Online
      Safety, Presentation Design, SEO, Google Ads & Facebook Ads, Project
      Management Tools, Instagram & TikTok Growth, Google Workspace
      Productivity. Day 3 (`0016_curated_catalog_day3.sql`): Python
      Programming for Beginners, Data Analysis & Visualization, Bookkeeping
      & QuickBooks, Mobile Photography & Content Creation, Podcasting &
      Voice-Over Basics, Transcription & Translation Freelancing, YouTube
      Channel Growth & Video SEO, Customer Service & Virtual Call Center
      Skills, Resume Writing/LinkedIn/Personal Branding, 3D Design &
      Animation (Blender). Day 4 (`0028_curated_catalog_day4.sql`):
      Affiliate Marketing, WordPress Website Building (No-Code), No-Code App
      Building (Adalo, Glide & FlutterFlow), Online Tutoring & Course
      Creation, Personal Finance & Budgeting Basics, Public Speaking &
      Communication Skills, WhatsApp Business & Facebook Marketplace
      Selling, Time Management & Productivity for Remote Workers, Digital
      Illustration (Procreate & Adobe Fresco), Virtual Event Planning &
      Webinar Hosting. Day 5 (`0041_curated_catalog_day5.sql`): IT Support
      & Help Desk Fundamentals, SQL & Databases for Beginners, Cloud
      Computing Fundamentals (AWS), Workflow Automation with Zapier, Sales
      & Lead Generation for Small Business, Technical Writing &
      Documentation — six, not ten: four researched topics (Motion
      Graphics, GA4, Grant Writing, Digital Products) were dropped because
      their videos' channels couldn't be confirmed by two independent
      searches, and shipping guessed attribution into a paid product is
      worse than shipping fewer courses. Day 6
      (`0043_curated_catalog_day6.sql`): Motion Graphics with After Effects
      — one, not six. Five researched topics (Google Analytics 4, Grant &
      Proposal Writing, Creating & Selling Digital Products, Notion for Work
      & Business, Proofreading & Editing) were dropped on the same rule.
      The constraint is environmental rather than a shortage of good
      topics: `WebFetch` to youtube.com is blocked by the egress proxy, so
      a video's channel can never be read off its page and verification is
      always circumstantial. Motion Graphics shipped precisely because
      every one of its six videos is on an official Adobe channel, and
      Adobe embeds the channel in the video title ("| Adobe Video"), which
      is the strongest attribution signal available here. Backed by real YouTube tutorials
      from established channels. Written by hand instead of spending Anthropic/YouTube API
      calls on topics already known to be wanted — the AI generator is
      reserved for topics outside this set. `courses.display_order`
      controls the deliberate ordering on `/courses` so it alternates
      between quick-win/business, creative, and technical skills instead of
      reading as a wall of similar courses.
- [x] **Beginner-to-professional depth expansion** — every course in the
      catalog was widened from 3 modules/6 lessons (beginner only) to 6
      modules/12 lessons spanning beginner → intermediate → professional,
      so a learner finishes job-ready instead of just aware of the basics.
      For each course, the original module 3 ("Working Like a Pro" or
      equivalent, already solid professional-tier content) is bumped to
      `order_number = 5`, and three new modules are inserted: an
      intermediate-technique module (order 3), a real-world applied-project
      module (order 4), and a freelance/career/scaling module (order 6).
      Shipped in 5 migrations (`0020`-`0024`, ~6 courses each). Every one of
      the 150+ new lesson videos was sourced via web research and
      independently verified (two separate corroborating searches per
      video, plus personal re-verification of anything only single-sourced)
      before being added — this project also caught and fixed a live bug
      where an entire course ("Web Development for Beginners") had 20 fake
      `REPLACE_ME` placeholder video URLs from the original scaffold,
      undetected until a full-catalog video-health audit.
- [x] **Phase 4** — Paystack payment + webhook + course access.
      `POST /api/payments/initiate` creates a `pending` payment row and
      starts a Paystack transaction, redirecting the browser to Paystack's
      hosted checkout (`authorization_url` — no client-side Paystack JS or
      public key needed). Both `POST /api/payments/webhook` (signature-
      verified) and `GET /api/payments/callback` (the browser redirect back
      from checkout) call the same `finalizePayment()` — which always
      re-verifies the transaction directly with Paystack's API rather than
      trusting the webhook payload or the redirect alone — before marking
      the payment `success` and upserting the `active` enrollment.
      Idempotent, so whichever of the two arrives first wins.
- [x] **M-Pesa (Daraja STK Push)** — a second payment option next to
      Paystack, since Paystack's business approval can take days and this
      is a Kenya-first product. `POST /api/payments/mpesa/initiate`
      creates a `pending` payment row (`provider='mpesa'`) and triggers
      the PIN prompt on the customer's phone (`lib/mpesa.ts`,
      `initiateStkPush`). Unlike Paystack's webhook, Safaricom's async
      callback (`POST /api/payments/mpesa/callback`) carries no signature
      to verify it's genuine, so `finalizeMpesaPayment()` never trusts it
      alone — it re-queries Safaricom directly (`stkpushquery`) before
      marking a payment `success`. The frontend (`MpesaPayButton`) polls
      `GET /api/payments/mpesa/status` every 3s while waiting, which
      nudges the same finalize-and-re-verify path in case the callback is
      slow or never arrives — so either path resolves the payment.
      Business account is a Till (Buy Goods), so `TransactionType`
      defaults to `CustomerBuyGoodsOnline`; set
      `MPESA_TRANSACTION_TYPE=CustomerPayBillOnline` if that ever changes,
      or while testing against Safaricom's shared sandbox shortcode (which
      is provisioned as a Paybill). Currently configured with sandbox
      Daraja credentials — real money only moves once `MPESA_ENV=production`
      and the real Till's production Consumer Key/Secret/passkey (issued
      after Daraja's "Go Live" approval) replace the sandbox ones.
- [x] **Manual M-Pesa fallback** — for while STK Push isn't usable
      (Daraja needs a live production shortcode; a Till/PayBill approval
      can take a while, and Safaricom has no API to auto-verify a payment
      into a personal number regardless). Two independent channels, each
      optional via env vars: Buy Goods (`MPESA_TILL_NUMBER`/`_NAME`) and
      Send Money to a personal number (`MPESA_MANUAL_NUMBER`/`_NAME`).
      Buyer pays by hand on their phone, types the M-Pesa confirmation
      code back into `ManualMpesaPayment`, and gets access immediately
      (`POST /api/payments/mpesa-manual/submit`) — grant-then-audit, not
      verify-then-grant, since there's no API path to verify either
      channel programmatically. `payments.mpesa_manual_code` is unique
      (a code only works once across the whole platform) and
      `manual_channel` records which one so the admin knows which
      statement page to check. `/admin/payments` shows the code +
      verified/not-yet-checked status with a "Mark Verified" audit
      action (`manual_verified_at`) — access was already granted by
      submission time, so this is a record of the spot-check, not a
      gate; the existing refund tool revokes access if a code turns out
      fake or reused.
- [x] **Phase 5** — Admin dashboard (`/admin`). Restricted to
      `profiles.role = 'admin'` — enforced in `lib/supabase/middleware.ts`
      (redirects non-admins to `/dashboard`) and again in every
      `/api/admin/*` route via `lib/adminAuth.ts`'s `requireAdmin()`,
      independent of the UI. `/admin` lists every course (published and
      draft) with module/lesson/enrollment counts and a publish toggle;
      `/admin/courses/new` and `/admin/courses/[courseId]` create/edit a
      course and manage its modules and lessons inline — adding a lesson
      auto-looks-up its real YouTube duration the same way the AI generator
      does. Deletes are guarded: a course with real enrollments/payments,
      or a module/lesson learners have progress on, can't be hard-deleted —
      unpublish or edit instead, so a mistake can't erase paid access or
      completion history.
- [x] **Admin: users** (`/admin/users`) — ban/unban via Supabase Auth's own
      `ban_duration` (`PATCH /api/admin/users/[userId]`), not a hard
      delete: a banned user is signed out and can't log back in, but their
      account, enrollments, payments, and certificates all stay intact and
      reversible. Admins can't be banned from the UI, and an admin can't
      ban their own account (server-side guard, not just hidden UI).
- [x] **No-refunds policy + admin billing-error correction**
      (`/refund-policy`, `/admin/payments`). The public policy is all
      sales final — stated on `/refund-policy` and again right above the
      pay buttons on every course page, before checkout, not just buried
      in a footer link. The one exception is our own mistakes (duplicate
      charge, or a payment that succeeded without granting access), which
      admin can correct from `/admin/payments`: a "Refund" action on
      successful payments (`POST /api/admin/payments/[paymentId]/refund`),
      explicitly scoped in its own confirm dialog to billing errors, not
      buyer's remorse. It's bookkeeping only — marks the payment
      `refunded` and the matching enrollment `revoked` (new statuses,
      added alongside the existing ones), it does not call Paystack's or
      Safaricom's refund APIs to move real money; that still happens
      separately. `revoked` needs no new access-control code anywhere:
      every enrollment check in the app (RLS's `lessons_select_enrolled`
      policy included) already only allows `active`/`completed`, so a
      revoked enrollment is automatically excluded everywhere access is
      gated.
- [x] **Daily study reminders** (Web Push) — after a learner's first
      course, `/dashboard` prompts them once to pick an hour (6am–10pm);
      if they haven't completed a lesson yet that day by then, a real
      push notification lands on their phone. `public/sw.js` is the
      service worker that shows the notification; on iPhone, Web Push
      only works for a site added to the Home Screen (a Safari
      limitation, not ours) — `ReminderSetup` detects that case and
      prompts for it. `vercel.json` defines 17 separate hourly cron
      entries (03:00–19:00 UTC) all hitting `/api/cron/study-reminders`,
      rather than one `*/15`-style entry — Vercel's Hobby plan only
      allows a single cron entry to fire once a day, so many
      once-a-day entries at different hours is the documented way to get
      hourly coverage without a paid plan. Each firing checks
      `study_reminders` (RLS: own-row only, read via the service role
      here since this is a cross-user batch job) for anyone due this
      hour who hasn't already been notified today (`last_sent_date`) and
      hasn't completed a lesson today (`lesson_progress.completed_at`),
      then sends via `lib/webpush.ts` (VAPID) to every row in
      `push_subscriptions` for that user — deleting the row on a
      410/404 (dead subscription) instead of retrying it forever.
      `CRON_SECRET` gates the route: Vercel sends it automatically as
      `Authorization: Bearer <value>` on every cron invocation once the
      env var is set, so the route just checks it matches.
- [x] **Curriculum model: Course → Level → Module → Lesson** — a course can
      optionally have `levels` (a new table, `course_id` + `order_number`)
      sitting above its modules; entirely optional, so all ~40 pre-existing
      courses have zero level rows and keep rendering exactly as before (a
      flat module list) — only a course deliberately migrated onto the
      model shows level grouping, with "Coming soon." for any level that
      has no modules yet. Lessons gained four nullable columns for real
      depth beyond "title + video": `learning_objectives text[]` (also
      exposed on the public `lesson_previews` view, like `description`),
      `notes text`, `practice_activity text`, and `knowledge_check jsonb`
      (self-check quiz questions, rendered client-side by
      `KnowledgeCheck.tsx` — not scored or saved, just a way to test your
      own understanding right now). No fixed lesson-count rule anywhere in
      the schema or UI — a level/module can hold as many lessons as the
      subject actually needs. The schema, `getLevelsForCourse()`, and every
      rendering component are 100% generic — nothing anywhere is
      Cybersecurity- or Blender-specific by name; any course can be
      migrated onto the Level model the same way.

      **All 48 courses are now on the Level model.** Migration
      `0046_backfill_levels_all_courses.sql` converted the 45 remaining
      courses in one pass, and it is worth being precise about what that
      did and did not do. Those courses already had a uniform
      beginner-to-professional tier structure, so their tiers are fully
      derivable from module count plus `order_number` — six-module courses
      become four levels (Foundations m1-2, Intermediate Skills m3,
      Professional Practice m4-5, Freelance & Career m6), three-module
      courses become three (Foundations, Core Skills, Professional
      Practice). The migration only inserts level rows and sets
      `modules.level_id`; it touches no lesson, enrollment, or
      `lesson_progress` row, so every lesson id survives and the two
      learners with completed lessons in converted courses (Graphic Design
      and Google Ads & Facebook Ads) keep their progress. It skips courses
      that already have levels, so it is idempotent and left the three
      hand-built courses alone. A course with an unexpected module count
      would be left flat and reported rather than guessed at; none were.

      **A converted level is real but thin.** It is existing, already-
      verified content re-parented into a hierarchy — not newly researched
      depth. Only Web Development, Cybersecurity and Blender were built
      lesson-by-lesson. The build order is now **breadth-first**: a routine
      firing three times daily deepens Level 1 across 2-3 courses at a
      time until every course's Level 1 is genuinely substantial, then
      sweeps Level 2, then Level 3. Deepening is strictly additive —
      modules are appended to the existing level row, never deleted or
      re-created — which is what keeps learner progress safe. Depth
      therefore varies by course, and the hand-built three are the quality
      bar the rest are working toward. Deepened so far beyond those three:
      Graphic Design Level 1 (4 modules / 10 lessons, `0047`) and
      Presentation Design Level 1 (4 / 11, `0048`).

      Two things worth knowing before adding modules by hand. First,
      `getOrderedLessons()` builds the learner's lesson sequence from
      `modules.order_number` ALONE and ignores level — so a module appended
      at the course's max order lands *after* the final level's material,
      and the course page (which groups by level) still looks correct while
      the real learning path is scrambled. `build-level-sql.mjs` handles
      this in its `existing: true` mode by inserting after the target
      level's last module and shifting the rest down, via a two-phase
      `+1000` / `-1000+N` offset because `(course_id, order_number)` is
      unique and a single `+N` update can trip it mid-statement. Second,
      **438 lessons across 45 courses still carry no notes, learning
      objectives or knowledge check** — they are a title plus an embedded
      video. That is the whole pre-existing catalog; only the hand-built
      levels and new deepening lessons have teaching material around the
      video, and this routine is the only thing reducing that number.
      Web Development for Beginners:
      Level 1 "Foundations" (3 modules, 15 lessons — How the Web Works,
      Developer Tools & Workflow, Thinking Like a Developer) and Level 2
      "HTML" (3 modules, 18 lessons — HTML Structure & Text, Links/Images/
      Media, Forms & Semantic HTML) and Level 3 "CSS" (3 modules, 20
      lessons — CSS Fundamentals, Layout with Flexbox and Grid, Responsive
      Design and Polish) and Level 4 "JavaScript Fundamentals" (3 modules,
      19 lessons — JavaScript Basics, Control Flow and Functions, Arrays/
      Objects/Working with Data) are built, 72 lessons so far; Levels 5-9
      (Frontend, Backend & Databases, APIs/Auth/Security, Deployment &
      Projects, Portfolio & Freelancing) still to build.
      Level 3 is anchored on Dave Gray's full CSS course for the
      fundamentals (learners navigate by named chapter rather than a
      timestamp, which is what could actually be verified) and on Kevin
      Powell for layout and responsive design. Several lessons were
      retitled to match what their verified video genuinely teaches rather
      than what the plan originally named — "Grid in Practice" became
      "Building a Responsive Card Grid", and z-index was dropped from the
      positioning lesson's title because no video could be confirmed to
      teach it. Level 4 is anchored on two independently verified full
      courses — Dave Gray's for control flow and Kevin Powell-style
      chaptered navigation, SuperSimpleDev's for data structures — chosen
      over a third candidate whose channel was confirmed but whose exact
      title could not be pinned down, because that creator renames uploads
      and two near-identical courses exist. Where a topic genuinely has no
      confirmable video chapter anywhere (null/undefined, for instance),
      it is taught in the written lesson notes rather than promised to a
      video that does not cover it. Cybersecurity & Online Safety: Level 1 "Foundations"
      (4 modules, 26 real lessons) and Level 2 "Core Security" (3 modules,
      20 real lessons — Common Threats & Attacks, Authentication & Access
      Control, Cryptography Basics) are both fully built (46 lessons so
      far); Levels 3-5 (Practical Security, Defensive Security, Projects)
      aren't built yet. Rebuilding Level 1
      deleted the old 6-module/12-lesson structure outright (it didn't map
      onto the new one), cascading to reset the one enrolled learner's
      lesson progress on this course — confirmed to be the site owner's own
      test enrollment first. "3D Design & Animation (Blender)" is the
      second course rebuilt: 9 levels designed (Foundations → Modeling →
      Materials, Texturing & Shading → Lighting & Rendering → Animation →
      Rigging & Character Animation → Advanced 3D Workflow → Real-World
      Projects → Portfolio & Freelancing), with Level 1 "Blender
      Foundations" fully built — 3 modules, 19 real lessons culminating in
      Blender Guru's well-known "Donut" beginner project (this course had
      zero enrollments, so no progress was at risk). Both courses are
      marked `curriculum_status = 'draft'` (see below) until every level is
      real. Every lesson's video was found and cross-verified by two
      independent web searches (not the paid Anthropic-generated content
      pipeline — see below for why) rather than an LLM API call, since no
      lesson count is fabricated to hit a target: depth is driven by what
      the subject actually needs to teach, module by module.
- [x] **No placeholder levels** — the rule that keeps a partly-built
      Learning Path honest without hiding it: a `levels` row is only ever
      created in the same migration that fills it with real modules and
      lessons. A published course can therefore only display real content,
      adding a level later is purely additive, and no "Level 2 — Coming
      soon" placeholder can appear on a live sellable page. An earlier
      attempt solved this the wrong way, by pre-creating empty levels and
      then hiding the whole course behind `curriculum_status = 'draft'`
      — which pulled Cybersecurity (46 real lessons, the deepest course on
      the platform) out of the catalog entirely. Migration 0039 reversed
      that; courses now stay visible and sellable while being deepened.
      `curriculum_status` remains in the schema (default `'published'`,
      hides a course from `/courses`, the homepage, "what to try next," and
      the sitemap without affecting enrolled learners' access) for the case
      it was really meant for: deliberately withholding a course from sale,
      set on purpose rather than as a side effect of incremental work.
- [x] **Curriculum generation, without the paid API** — `ANTHROPIC_API_KEY`
      ran out of credits mid-project, and the ask was explicit: don't fake
      content to hit a lesson-count target, and don't require topping up
      billing to keep going. So lesson research runs on parallel
      `WebSearch`-only agents (real video existence + title/channel
      cross-verified by a second, independently-worded search each), and
      the mechanical last step — turning a plan of
      `{ level, modules: [{ lessons: [...] }] }` into correctly-escaped
      SQL — is `scripts/curriculum/build-level-sql.mjs`, a small, reusable,
      course-agnostic generator (not hand-typed SQL per course). It
      computes each new module's `order_number` from the course's current
      max rather than assuming a level starts fresh, so it's safe to run
      against a course that already has other levels built. The
      `/courses/request` AI generator (`lib/courseContent.ts`,
      `lib/youtube.ts`) is untouched and still exists as a separate,
      Anthropic-API-backed path for quick single-tier course generation —
      it just isn't what's building out the Level-model courses right now.
- [x] **"Learning Path" terminology** — renamed "Course"/"Courses" to
      "Learning Path"/"Learning Paths" throughout learner-facing UI copy
      (nav, homepage, course/lesson pages, dashboard, certificates) and the
      i18n dictionary (English + Swahili). Deliberately *not* renamed: the
      `courses`/`modules`/`lessons` table and TypeScript type names, any
      internal function/variable names, the admin panel's copy, or the
      schema.org `"@type": "Course"` JSON-LD (an external vocabulary term,
      not internal branding) — this is a learner-facing relabel, not a
      data-model rename.

**Live Supabase project:** `skillpath-africa` (`xzncootldgqhghokxcrd`,
`us-east-1`) — migrations `0001`–`0006` applied.

**AI generation credentials are live:** `YOUTUBE_API_KEY`,
`ANTHROPIC_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are all set (locally
in `.env.local`, and in Vercel for production), so `/courses/request`
works end to end for topics outside the curated 10.

### Free preview lessons

Every published course exposes its genuine first lesson publicly, so a visitor
can judge the teaching before paying or even creating an account.

The gate is in the database, not in application code. `lessons` and its
enrolled-only RLS policy are untouched, so notes, practice activity and
knowledge check stay inaccessible to non-enrolled users. The public
`lesson_previews` view — already `security_invoker = false` with a deliberately
safe column subset — carries `youtube_url` wrapped in a `CASE` that emits it
only where `lessons.is_free_preview` is set. For every other lesson the column
is literally NULL in the view, rather than filtered in a query a later change
could get wrong.

Migration `0050` adds the flag and backfills the first lesson of the first
module of each published course, skipping any course that already has one so
re-running never overrides a manual choice. Verified on production: 588 view
rows, 48 videos exposed, **0 paid videos leaked**.

The notes, practice task and knowledge check stay withheld even on the preview
lesson — the visitor gets the real video, which is what they need to judge
quality, and the course page says plainly that the rest comes with purchase.

### Verifying a lesson video: use the YouTube Data API first

Video attribution is the slowest part of building curriculum, and for a long
time it was done by running paired web searches and a falsification control. That
method is still documented below and still catches real errors — but it is a
fallback, not the first move.

`YOUTUBE_API_KEY` is already configured, and `googleapis.com` is reachable from
the build environment. One call settles id, exact title, channel, duration and
whether the video still exists:

```
curl -sS "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=<comma-separated-ids>&key=$YOUTUBE_API_KEY"
```

Run this on every candidate before writing a single lesson. On the batch that
built migrations `0051` and `0052` it overturned four research verdicts in a row:

| Video | Search-based verdict | API truth |
|---|---|---|
| `7kBJerjnQTk` | Unconfirmable — two candidate Google channels | **Grow with Google** |
| `TSImtOoHssg` | Unconfirmable — prose evidence only | **LearnFree** |
| `luH4t1kZ5CA` | Suspected a different creator reusing the title | **Simpletivity**, not Kevin Stratvert |
| `gdrxAoqfvbA` | Possibly deleted (appeared in a dataset of dead ids) | Live, 16:49 |

Two of those were videos that would have been dropped despite being fine, and one
was a genuine title collision that the search method correctly smelled but could
not prove. The API resolves all four in a second.

The search-and-control method still matters for the question the API cannot
answer — *does this video actually teach the thing the lesson claims?* Nothing but
watching or reading a reliable chapter list settles that.

### Homepage claims, and the rule they follow

The homepage used to run five aspirational checks — "Get job-ready skills",
"Start freelancing", "Build online businesses" and so on. They said nothing a
visitor could verify, and nothing another learning site could not also say.

They are replaced by `PROOF_KEYS` in `app/page.tsx`: five claims about the
product rather than about the learner's future, each one backed by something
already shipped.

| Claim | What makes it true |
|---|---|
| Watch a full first lesson free, no account, no card | `lessons.is_free_preview` (migration `0050`), rendered on every course page |
| Built in levels, zero → working professional | the `levels` table, populated for every published path (`0046`) |
| Learn in English or Kiswahili | `lib/i18n.ts` + `components/LanguageToggle` |
| Made for slow connections — every lesson shows its data cost | `components/DataSaverNote` |
| One payment in shillings, no subscription | per-path `courses.price` in KES; there is no recurring billing in the codebase |

**The rule: a claim here must be checkable against the running site.** Two things
were deliberately left out under it:

- *"Notes, a practice task and a knowledge check on every lesson."* False today —
  438 lessons across 45 paths are still a title plus a video. It becomes true as
  the deepening routine works through them, and can be added then.
- *Testimonials, student projects, ratings.* There are 0 reviews and 1 learner
  with a completed lesson. `course_reviews` is already rendered — star ratings on
  the course cards, average and individual reviews on the course page, and a
  `ReviewForm` for enrolled learners — so real proof will appear on its own as it
  is earned. Nothing is invented to fill the gap in the meantime.

Every key lives in **both** the `en` and `sw` blocks of `lib/i18n.ts`. `t()` falls
back to English on a missing key, so a Swahili gap renders English rather than
erroring and the build will not catch it — check key parity between the two
blocks when adding any.

### Payment methods on the page

The hero carries one line naming what a buyer can pay with, and
`components/PurchaseSection` repeats it above the buttons. That line must mirror
the buttons rendered below it: a method named with no button under it is a
promise the page cannot keep.

Note the M-Pesa split when reading that line. **Manual M-Pesa works** — the till
and send-money channels take a real payment and are gated on
`MPESA_TILL_NUMBER` / `MPESA_MANUAL_NUMBER`. The **Daraja STK push does not**: all
14 attempts have `checkout_request_id = NULL`, which is only written after Daraja
accepts a push, so no phone ever showed a PIN prompt. Card via Paystack works and
is proven end to end, refunds included.

### Diagnosing failed payments

Both payment initiate routes used to end in a bare `catch {}` that discarded the
provider's error, and nothing in the payment path logged anything — so three
days of M-Pesa failures and a week of stuck Paystack payments produced nothing
to debug from. Now:

- `payments.failure_reason` (migration `0049`) stores the provider error.
  Server-written and admin-visible only; the customer-facing message stays
  generic because provider errors can leak configuration detail.
- The Paystack webhook logs signature failures with `secretKeyMode()`, which
  reports test/live from the key **prefix** only, never the key itself — so the
  log names a mode mismatch outright instead of failing silently.
- For M-Pesa, a `NULL` `checkout_request_id` means Daraja rejected the STK push
  before Safaricom queued it, so no phone ever showed a PIN prompt. That points
  at credentials, shortcode, passkey, `MPESA_ENV` or the callback URL — not at
  buyer behaviour.

**Reading payment status correctly.** `pending` is written at *initiate* time,
before the buyer reaches the provider, so an abandoned checkout leaves a
`pending` row forever. It does **not** mean someone was charged. Only `success`
and `refunded` represent money that actually moved; measure conversion on those,
and treat a pile of `pending` rows as abandonment to investigate in the funnel,
not as failed payments to refund.

### Going live with Paystack

> **Status as of 31 Aug: Paystack works end to end.** Of 5 completed Paystack
> payments, **5 produced an active enrollment** — including a full
> pay → access → refund → revoke cycle verified on 24 Aug. Enrollment lands
> 30-90 seconds after payment.
>
> **Reading `pending` correctly:** there are 10 `pending` Paystack rows, and
> they are *not* stuck payments. The row is inserted at *initiate* time,
> before the buyer is redirected to Paystack, so an abandoned checkout leaves
> a `pending` row permanently. All 10 have a null `checkout_request_id`,
> meaning they never came back. Treat `pending` as "started checkout", not
> "charged". Only `success` and `refunded` represent money that moved.
>
> **M-Pesa, by contrast, is genuinely broken:** 14 attempts, **0** successes,
> every row with a null `checkout_request_id` — Daraja rejected the STK push
> before Safaricom queued it, so no customer's phone ever showed a prompt.
> Do not promote M-Pesa as a payment option until that is fixed.

The Paystack account is **approved and switched to Live**. Nothing in this
repo needs changing for that — the whole flow is server-side (the browser is
redirected to Paystack's `authorization_url`), so there is no publishable key
to wire up, and `callback_url` is derived from the request origin so preview
and production both work without config. The only variable is
`PAYSTACK_SECRET_KEY`.

Checklist for taking real money:

1. **Vercel → Settings → Environment Variables**: set `PAYSTACK_SECRET_KEY`
   to the live key (`sk_live_…`) for **Production**, then redeploy — env var
   changes don't apply to already-built deployments.
2. **Paystack → Settings → API Keys & Webhooks, on the Live tab**: set the
   webhook URL to `https://skillforge-delta-nine.vercel.app/api/payments/webhook`.
   Paystack keeps test and live webhook config separate, so a URL registered
   on the test tab will never fire for a live payment.
3. **Leave `.env.local` on the test key** (`sk_test_…`) so local development
   never charges a real card.

⚠️ **The failure mode to avoid:** a live dashboard paired with a test key in
the app. `isValidWebhookSignature` verifies Paystack's HMAC using
`PAYSTACK_SECRET_KEY`, and Paystack signs live events with the *live* secret
— so a test key makes every live webhook fail signature validation and return
401. The customer is charged, `finalizePayment()` never runs, and no
enrollment is created. Money in, no access. Swapping the key in Vercel is
what prevents this, and it's why the key and the dashboard mode must always
match.

Worth doing once, after switching: buy the cheapest course with a real card,
confirm access is granted, then refund it from `/admin/payments`. That
exercises initialize → charge → webhook → signature check → enrollment
end to end, which test mode can't fully prove.

Two safeguards already in place and not dependent on any of the above: the
webhook never trusts its own payload (`finalizePayment()` re-queries Paystack
directly before granting access — the signature only proves the request came
from Paystack, not that the transaction succeeded), and the M-Pesa paths
(STK Push and the manual Till/Send Money fallback) are entirely independent
of Paystack's status.

## File structure

```
app/
  page.tsx                              Home — hero, why-learn, popular courses
  courses/
    page.tsx                            Course grid, real data + lesson counts
    [courseId]/page.tsx                 Course detail — curriculum, lock icons, CTA
    request/page.tsx                    Real — AI course request form (auth-protected)
  learn/[courseId]/[lessonId]/
    page.tsx                            Real — lesson player
    LessonControls.tsx                  Real — mark complete / next lesson / progress
  login/page.tsx                        Real — email/password login
  register/page.tsx                     Real — full name/email/password
  dashboard/page.tsx                    Real — welcome, enrolled courses, progress
  admin/                                Real — course list + publish toggle
    courses/new/page.tsx                 Real — create course form
    courses/[courseId]/page.tsx          Real — edit course + manage modules/lessons
  api/
    payments/initiate/route.ts          Real — starts a Paystack transaction
    payments/webhook/route.ts           Real — signature-verified, finalizes payment
    payments/callback/route.ts          Real — browser redirect back from checkout
    progress/complete-lesson/route.ts   Real — upserts lesson_progress
    courses/generate/route.ts           Real — AI course generator endpoint (auth + zod)
    admin/**                            Real — course/module/lesson CRUD, admin-only
components/
  Navbar.tsx                            Real — auth-aware nav
  Footer.tsx, LogoutButton.tsx          Real
  CourseCard.tsx                        Real — shared by home + /courses
  YouTubeEmbed.tsx                      Real — responsive iframe embed
  PayButton.tsx                         Real — starts checkout, redirects to Paystack
lib/
  types.ts                              Hand-written DB types
  courses.ts                            getPublishedCourses() + getOrderedLessons()
  youtube.ts                            getYouTubeVideoId(); curateVideosForTopic()
                                         — search/score/dedupe YouTube videos per stage
  courseContent.ts                      generateCourseContent() — Claude writes course/
                                         module/lesson copy from curated videos
  courseGenerator.ts                    generateCourseForRequest() — orchestrates
                                         curation + content + persistence via admin client
  supabase/{client,server,admin}.ts     Browser / server / service-role clients
  paystack.ts                           Real — initialize/verify transaction, webhook signature
  mpesa.ts                              Real — Daraja OAuth, STK push, stkpushquery re-verify
  payments.ts                           Real — finalizePayment()/finalizeMpesaPayment(): verify + mark success + enroll
  adminAuth.ts                          Real — requireAdmin(), used by every /api/admin/* route
  webpush.ts                             Real — VAPID-signed push send, deletes dead subscriptions on 410/404
public/
  sw.js                                  Service worker — shows the push notification, handles its click
  manifest.json                          PWA manifest — required for Web Push to work on iOS (Add to Home Screen)
vercel.json                             17 hourly cron entries -> /api/cron/study-reminders (Hobby-plan workaround)
supabase/migrations/
  0001_init.sql                         Schema + RLS
  0002_seed_courses.sql                 Sample courses + full "Web
                                         Development for Beginners" course
  0003_harden_function_search_path.sql  Security advisor fix
  0004_ai_course_generation.sql         courses.generated_by column
  0005_course_display_order.sql         courses.display_order column
  0006_curated_catalog.sql              10-course curated catalog content (day 1)
  0012_curated_catalog_day2.sql         10-course curated catalog content (day 2)
  0016_curated_catalog_day3.sql         10-course curated catalog content (day 3)
  0013_vibe_coding_curriculum.sql       Backfilled real curriculum for a manually-created empty course
  0014_mpesa_payments.sql               payments.provider/phone/checkout_request_id/mpesa_receipt columns
  0015_refunds.sql                      payments 'refunded' + enrollments 'revoked' statuses
  0017_fix_private_2fa_video.sql         Data fix: one video had gone private
  0018_fix_web_dev_placeholder_videos.sql Data fix: 20 fake seed-data video ids replaced with real ones
  0019_study_reminders.sql              push_subscriptions + study_reminders tables
middleware.ts                           Session refresh + route protection
```

## Data model

```
profiles.user_id → auth.users
courses → modules → lessons
users → enrollments → courses   (status: active | completed — created by
                                  finalizePayment() after a verified payment)
users → lesson_progress → lessons
users → payments → courses      (status: pending | success | failed)
courses.generated_by → auth.users (nullable — set when a learner's course
                                    request triggered AI generation)
```

**Payments** (`/api/payments/{initiate,webhook,callback}`, `lib/paystack.ts`,
`lib/payments.ts`): `initiate` creates a `pending` payments row and starts a
Paystack transaction, redirecting to Paystack's hosted checkout page — no
client-side Paystack JS or public key needed. After checkout, two paths can
finalize the payment, both calling the same `finalizePayment()`: Paystack's
webhook (`charge.success`, HMAC-signature-verified) and the browser
redirect back from checkout. Either way, `finalizePayment()` always calls
Paystack's own verify-transaction endpoint before trusting the result —
never the webhook payload or redirect query params alone — then marks the
payment `success` and upserts an `active` enrollment. It's idempotent
(checks `payments.status` first), so whichever of the two arrives first
does the work and the other is a no-op.

**M-Pesa** (`/api/payments/mpesa/{initiate,callback,status}`, `lib/mpesa.ts`):
same `payments` table (`provider='mpesa'`), same idempotent shape, different
transport. `initiate` triggers Safaricom's STK Push (the PIN prompt on the
customer's phone) and stores Safaricom's `CheckoutRequestID` — the id its
async callback carries back, since the callback has no way to echo our own
`reference`. Daraja's callback has no signature to verify, so
`finalizeMpesaPayment()` treats it only as a nudge: it re-queries Safaricom's
`stkpushquery` endpoint directly before ever marking a payment `success`.
`GET /api/payments/mpesa/status` (polled by the browser every 3s while
`MpesaPayButton` shows "check your phone") calls the same finalize function,
so a slow or missing callback still resolves — the poll does the same
authoritative re-check the callback would have triggered.

**AI course generator** (`/courses/request`, `lib/courseGenerator.ts`):
runs synchronously inside the request (`maxDuration = 60` on the API
route) — no background job queue, kept deliberately simple per the "don't
over-engineer it" brief. Generation takes roughly 20-40 seconds (six
YouTube searches + one Claude call), during which the request page shows
a loading state. If a learner requests a topic+level that already has a
generated course, the existing course is reused instead of generating a
duplicate (matched by slug).

**Access control is enforced in Postgres (RLS), not just hidden in the UI.**
A lesson's real content (`youtube_url`, `description`) is only readable via
`select` if the requesting user has an `active`/`completed` enrollment in
that lesson's course — see the `lessons_select_enrolled` policy in
`0001_init.sql`. So the course curriculum can still be shown to a visitor
who hasn't paid (via the public `lesson_previews` view — title and order
only), while the actual video stays locked at the database level, not just
behind a UI lock icon.

`role` on `profiles` (`student` | `admin`) gates `/admin` — checked in
middleware (page access) and in every `/api/admin/*` route (`requireAdmin()`
in `lib/adminAuth.ts`), so a non-admin can't reach the dashboard or call its
endpoints directly. It's protected against self-escalation by a trigger
(`protect_profile_identity`) that silently reverts `role`/`user_id` changes
from any caller that isn't the service role — simpler and more reliable
than trying to express "old vs new" inside an RLS `WITH CHECK` clause.
There's no admin promotion UI (a first admin has to already exist to grant
more, so this stays a manual step by design); do it directly in SQL:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

**Test enrollments**: a real Paystack payment now creates these
automatically (`finalizePayment()`). To test the dashboard/lesson-gating
flow without going through checkout, you can still insert one manually:

```sql
insert into public.enrollments (user_id, course_id, status)
values (
  '<auth.users.id of the test account>',
  (select id from public.courses where slug = 'web-development-for-beginners'),
  'active'
);
```

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Paystack keys
npm run dev
```

Supabase URL/anon key are for the live project above. `SUPABASE_SERVICE_ROLE_KEY`
is required for payments, the AI course generator, and progress tracking
(server-side writes that bypass RLS); it's not required for Phase 2
(register/login/logout/dashboard all work with just the anon key).
`PAYSTACK_SECRET_KEY` is required for payments — get it from your Paystack
dashboard and also set the webhook URL there (see Status above).

## Explicitly out of scope for v1

- Quizzes.
- Certificates.
- A background job queue for course generation — it runs synchronously in
  the request instead (see "AI course generator" note under Data model).
