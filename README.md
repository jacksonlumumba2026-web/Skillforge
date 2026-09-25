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
      is the strongest attribution signal available here.

      Day 7 (`0060_curated_catalog_day7.sql`): Power BI for Data Reporting.
      **The constraint has moved.** Attribution is no longer the bottleneck
      — the YouTube Data API returns the uploading channel directly, so
      verification now takes seconds rather than ~50 searches per video, and
      nothing was dropped for weak sourcing. What limits a day now is TOPIC
      SUPPLY: at 48 courses the obvious subjects are taken, and seven
      candidates were rejected for overlapping existing courses rather than
      for bad videos (CapCut vs video-editing, Google Sheets automation vs
      excel-spreadsheets-for-work, Notion vs project-management-tools, and
      four others). Power BI survived because it is genuinely absent, has a
      vendor channel, and is a hiring keyword.

      Day 7 also changed the quality bar: **every one of its six lessons
      ships with learning objectives, notes, a practice activity and a
      knowledge check.** Days 1-6 shipped title-plus-video lessons, which is
      exactly how the 438-lesson content backlog was created. New courses
      should no longer add to it.

      Day 8 (`0066_curated_catalog_day8.sql`): Photo Editing & Retouching
      (Photoshop) and Notion for Work & Business — 4 topics researched, 2
      shipped, both at day 7's quality bar. Every lesson comes from an
      authority channel: GCFGlobal's LearnFree, Adobe's own two channels,
      and Notion's own channel. The two dropped for sourcing were
      **Airtable** (no vendor channel appears at all — every search result
      was a third-party consultant) and **Proofreading & Editing** (one
      university channel and nothing else brandable; its second failure).
      Shopify and Git & GitHub were rejected for overlap instead:
      `ecommerce-online-selling` already carries the official Shopify
      tutorial parts 1-3, and `web-development-for-beginners` teaches Git
      and GitHub basics. Notion had been rejected on day 7 for overlapping
      `project-management-tools`; that course carries exactly one
      introductory Notion lesson inside a three-tool tour, so a course on
      Notion as a database and team workspace is a different subject, and
      the overlap is one lesson rather than a course. Backed by real YouTube tutorials
      from established channels. Written by hand instead of spending Anthropic/YouTube API
      calls on topics already known to be wanted — the AI generator is
      reserved for topics outside this set. `courses.display_order`
      controls the deliberate ordering on `/courses` so it alternates
      between quick-win/business, creative, and technical skills instead of
      reading as a wall of similar courses.

      Day 9: **nothing shipped, and that is the honest result.** Four
      topics were researched (Looker Studio, Adobe Illustrator, Slack,
      Upwork/Fiverr freelancing) and all four were rejected — Looker Studio
      and Illustrator for overlapping `power-bi-data-reporting` and
      `graphic-design`, Slack for having no teaching series worth six
      lessons on its own channel, and Upwork/Fiverr for sitting squarely
      inside the existing `freelancing` course. No migration was written
      rather than pad the catalog with a course that duplicates one already
      on sale.

      Day 10 (`0078_curated_catalog_day10.sql`): Print-on-Demand with
      Printful — 4 topics researched, 1 shipped. Rejected: **Canva** (its
      own 10-part beginners series is good, but `graphic-design` and
      `presentation-design` already teach Canva, so a third Canva course is
      padding — logged instead as a sourcing lead for the deepening
      routine), **Microsoft Word** (no official Microsoft channel surfaces;
      the best results are individual creators), **Zendesk** (one official
      demo video, not six) and **Adobe Firefly** (two official videos, not
      six). All six Printful videos come from Printful Custom Printing, the
      company's own channel, each confirmed through the Data API for
      channel, title, duration and embeddability; a seventh official video
      was rejected at 2:04 for falling under the three-minute floor.

      Print-on-Demand carries a warning in its own description and first
      lesson rather than buried in a late module: **Printful prints and
      ships from the US, EU, Mexico and Japan, so a Kenyan learner using it
      is running an export business** — designing here, selling to
      customers abroad, earning foreign currency. Shipping to Kenya is slow
      and expensive, so it is not a way to sell to your neighbours. A
      learner who finds that out after paying KSh 500 has been misled, so
      the course says it before the sale. Its lessons are also honest about
      thin margins, currency conversion and how crowded the market is.

      Day 11, the last: **nothing shipped, and the project ends here.**
      Three untried topics were researched and all three failed on the
      same point — **Pinterest marketing**, **stock photography as
      income** and **product photography** have no official Pinterest,
      Adobe Stock or Shutterstock channel publishing teaching content;
      every result was a third-party creator. Every other idea on the
      original topic list is now either shipped, already covered by an
      existing course, or twice-rejected. The routine
      (`trig_01XLqpWy1SvSGEFaiTqEhPrC`) was deleted on completion, as its
      own terminal step instructed.

      **Final tally for the 11-day catalog project: 52 courses.** Days 1-4
      shipped ten each on a much looser bar. Day 5 shipped 6 of 10 and day
      6 shipped 1 of 6, both throttled by attribution cost before the
      YouTube Data API removed that bottleneck. Days 7-11, with
      attribution cheap, shipped 1, 2, 0, 1 and 0 — because the constraint
      had moved from *proving who made a video* to *there being a video
      worth using*. Nineteen-plus topics were researched and rejected
      across those five days.

      Across days 7-11 the pattern is settled: strong-vendor topics are
      already in the catalog, and what remains either overlaps an existing
      course, has no vendor publishing a teaching series, or is too
      marginal to sell. The catalog is close to saturated at 52 courses;
      the remaining work is depth (438 bare lessons), not breadth.

      The deepening routine reached the same wall from the other side on 8
      September: thirteen courses researched across three firings, three
      shipped. The vendors that publish long-form teaching video have been
      mined for the subjects they cover. What is left divides into topics
      whose vendor publishes only Shorts (Zapier's own videos on
      multi-step Zaps run 15 and 19 seconds; HubSpot's cold-email video is
      21 seconds), topics with no vendor at all (freelancing, virtual
      assistance, transcription, Instagram and TikTok), and topics where
      the vendor teaches in text rather than video (Google's technical
      writing course). Searching for new Adobe Photoshop material returned
      only the two videos the course already used.
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
      Graphic Design Level 1 (4 modules / 10 lessons, `0047`),
      Presentation Design Level 1 (4 / 11, `0048`), AI Tools for Everyday
      Work (4 / 8, `0051`), Google Workspace Productivity (4 / 8, `0052`),
      Excel & Spreadsheets for Work (4 / 9, `0053`), UI/UX Design (Figma)
      (4 / 8, `0054`), Vibe coding (4 / 8, `0055`), SEO (4 / 9, `0056`),
      Google Ads & Facebook Ads (4 / 8, `0057`), E-commerce & Online
      Selling (4 / 9, `0059`), Social Media Management (4 / 8, `0061`),
      Project Management Tools (4 / 8, `0062`), Email Marketing
      (4 / 8, `0063`), Python Programming (4 / 8, `0064`), Data
      Analysis & Visualization (4 / 8, `0065`), Cloud Computing
      Fundamentals (3 modules / 6 lessons, `0067`), WordPress Website
      Building (3 / 6, `0068`), YouTube Channel Growth (4 / 8, `0070`),
      IT Support & Help Desk (3 / 6, `0071`), Digital Marketing
      (4 / 8, `0072`), Virtual Event Planning (3 / 6, `0073`) and Public
      Speaking & Communication Skills (3 / 6, `0074`), Personal Finance &
      Budgeting (3 / 6, `0075`), Digital Illustration (3 / 6, `0076`) and
      Time Management for Remote Workers (3 / 6, `0077`),
      Copywriting & Content Writing (4 / 8, `0079`), Bookkeeping &
      QuickBooks (4 / 8, `0079`) and Resume Writing, LinkedIn & Personal
      Branding (4 / 8, `0080`), Notion for Work & Business (2 / 4,
      `0081`), Motion Graphics with After Effects (2 / 4, `0081`) and
      Print-on-Demand with Printful (2 / 4, `0082`) and Photo Editing &
      Retouching (Photoshop) (2 / 4, `0083`) and Online Tutoring & Course
      Creation (2 / 4, `0084`), Affiliate Marketing (2 / 4, `0085`) and
      No-Code App Building (2 / 4, `0085`) and SQL & Databases for
      Beginners (2 / 4, `0086`).

      The gap these filled is the pattern to look for in the rest: each was
      a **tool tour**. AI Tools showed four chatbots and
      taught nothing about prompting, verifying an answer, or what is
      unsafe to paste in. Google Workspace toured the suite and covered
      Gmail without reaching sharing permissions or Docs collaboration.
      Excel covered the interface and formulas without ever explaining
      absolute references — the one thing that makes copied formulas
      break. UI/UX Design taught Figma but not UX — no user research, no
      user flows. Vibe coding showed two AI editors and never mentioned
      reviewing the generated code or using version control to undo it. The
      buttons were all there; the principles were not. SEO taught tactics
      without ever explaining crawling and indexing, so a learner could not
      tell a technical problem from a ranking one. Google Ads showed how to
      build a campaign but nothing about budgets or conversion tracking —
      the two things that decide whether the money was wasted. E-commerce
      toured four selling platforms without covering product photography,
      listings or pricing — the things that decide whether anyone buys.
      Social Media Management taught the job description and Hootsuite's
      buttons but never what to post or how to prove it worked — the two
      questions a paying client actually asks. Project Management Tools
      toured Trello, Notion and Asana without once explaining how to break
      work into tasks, so the board had nothing sensible to hold. Email
      Marketing covered list-building and Mailchimp's buttons but not
      deliverability — the thing that decides whether the campaign is seen
      at all. Python taught setup, variables and loops but neither
      conditionals nor functions, so nothing in it could make a decision.
      Data Analysis taught Power BI and Looker Studio without a word on
      cleaning data or choosing a chart, which is where the analysis
      actually happens. Cloud Computing explained what the cloud is and
      toured the console without launching anything, and said nothing
      about the two things that actually hurt beginners — the shared
      responsibility model and the bill. WordPress covered what it is and
      how to pick hosting, then stopped short of building a single page.
      YouTube Channel Growth taught how to get a video clicked and nothing
      about what the analytics say afterwards or how anyone actually gets
      paid. IT Support covered the role and the hardware inside a machine,
      while nearly every real ticket is an operating-system or networking
      problem. Digital Marketing taught SEO, Facebook ads and content —
      all tactics that assume you already know who you are selling to and
      how they decide. Virtual Event Planning drove Zoom and StreamYard
      without covering registration, rehearsal or holding a room. Public
      Speaking covered nerves and body language — how you appear — and
      nothing about what you actually say, nor about listening, despite
      "Communication Skills" being half the course title. Personal Finance
      explained what a budget is and what M-Pesa is, and nothing about
      saving, interest or debt — the three things that decide whether a
      budget produces anything. Digital Illustration was a single tour of
      each app with none of the craft underneath. Time Management taught
      the Eisenhower Matrix and time blocking — two scheduling techniques
      that do nothing for someone who already knows what to do and does
      not do it. Copywriting taught headlines and body copy without ever
      asking who the copy was for, which is the cause of almost all weak
      copy. Bookkeeping never mentioned invoicing anywhere across its
      twelve lessons — the single most common thing a client asks a
      bookkeeper to do. Resume Writing got a learner as far as a CV that
      clears an ATS and a discoverable LinkedIn profile, then stopped —
      before the application and before the interview, which are the two
      things that actually decide whether anyone is hired. It gains cover
      letters, interview preparation, the questions every interview asks,
      and STAR, all from Indeed's own channel; STAR was absent from the
      entire platform.

      **The binding constraint on this routine is now sourcing, not
      topics.** The 8 September firing researched five courses and shipped
      two. Freelancing's real gap is pricing and contracts, and neither
      Upwork nor Fiverr publishes teaching content — every candidate was an
      individual creator, so it was dropped rather than attach a paid
      lesson to unbrandable attribution. Instagram & TikTok Growth was
      dropped for the same reason: no official Meta, Instagram or TikTok
      teaching channel surfaces at all. Video Editing was skipped for the
      third time; its gap is still audio, and audio is still only taught by
      small unbranded channels. Bookkeeping was picked over those despite
      having no enrollments, because Intuit publishes the whole syllabus on
      its own channel — sourceability now outranks demand when demand
      cannot be sourced.

      Two Intuit videos were rejected on duration: "How to track expenses"
      runs 17 seconds (a promo clip) and "How to track what customers owe
      you" runs 2:38, both under the three-minute floor. Two Nielsen Norman
      Group findings — the F-pattern in reading, and the 4 S's of link text
      — were folded into lesson notes and labelled as additions beyond the
      video, for the same reason: their videos run 2:41 and 2:52.

      Both new courses carry country-specific honesty in the notes rather
      than leaving a learner to discover it after paying. QuickBooks
      Payments is not available in Kenya and most Kenyan banks have no
      direct bank feed, so the bookkeeping lessons teach the CSV-import
      route as the normal path — and explain why the feature is still worth
      learning, since much paid remote bookkeeping is for businesses in
      countries where the feed does work. The Indeed lessons carry the
      same treatment: applying by email or WhatsApp rather than through a
      formal ATS, interviewing over a connection that may drop and saying
      so in advance, the salary question — asked earlier and more bluntly
      here, where "whatever you offer" is the answer most likely to get
      you underpaid — and where to find STAR examples when you have never
      held a formal job: a chama, a committee, a family business, a side
      hustle.

      The 8 September 10:00 firing shipped **one** course, not two.
      Virtual Assistance was dropped because no official Google channel
      content on Gmail delegation surfaces; Mobile Photography because
      Adobe's official Lightroom presence is a single video; Transcription
      & Translation because no official Rev channel content exists at all.
      **Podcasting & Voice-Over is deferred rather than rejected**, and
      the reason is worth recording: its real gap is publishing, which is
      exactly where sources go stale. Buzzsprout's distribution video
      dates to 2020 and predates Google Podcasts closing, and Spotify for
      Creators' own upload guide runs 1:47, under the floor. Teaching a
      learner to submit to directories that no longer exist is worse than
      not covering it. The moment a current vendor walkthrough over three
      minutes appears, that course is ready. By contrast the Indeed videos
      are 2020-2021 and were accepted, because cover letters, interview
      preparation and STAR are evergreen craft that no product shutdown
      has invalidated — that distinction, staleness of fact versus age of
      upload, is the one to apply.

      The 9 September 02:00 firing turned to the **day-7/8 curated
      courses**, built as 3 levels x 1 module x 2 lessons — a structure
      that leaves their Level 1 thinner than the legacy converted courses,
      at two lessons before the first level ends. Notion gained navigating
      a workspace and writing a page (its Level 1 explained what Notion is
      and how sharing works, then Level 2 jumped straight to databases);
      After Effects gained parenting and null objects, the concept that
      separates animation you can edit from animation you have to redo.

      **That firing also corrected a search failure worth recording.**
      Keyword queries for Notion returned only third-party creators, and
      the conclusion "no official channel" would have been wrong — day 8
      had already used six videos from the "Notion" channel. Confirming
      the course's existing lesson ids through the Data API surfaced the
      channel that keyword search had missed. **Check what a course
      already uses before concluding a vendor does not publish.** The same
      check applied in reverse the previous evening: a hunt for new Adobe
      Photoshop material returned only the two videos that course already
      had.

      Four vendor videos were rejected on duration that firing — Notion's
      "Projects & tasks" (2:56), "Add projects & tasks to your workspace"
      (2:19) and "Introducing AI Meeting Notes" (1:21). Notion's "AI
      Meeting Notes" (4:02) cleared the floor and was dropped on a
      different ground: it teaches a paid AI feature, and a learner on the
      free plan would get nothing actionable from a lesson built on it.

      A standing check was added after the 8 September firings: **the same
      video must not be reused across courses without a deliberate
      reason.** Five videos currently appear in two courses each, and one
      — HubSpot's audience-research video — in three, having been added to
      `copywriting-content-writing` without checking that
      `digital-marketing` and `sales-lead-generation` already carried it.
      The three contexts differ enough in their notes to leave as is, but
      the count is now verified before any video is added.

      **The Notion finding was then turned into a method and run
      deliberately.** On 9 September every lesson id in ten previously
      REJECTED courses was fed back through the Data API to read its
      channel. That surfaced **Microsoft Power BI** — a real vendor
      channel keyword search had never returned — and confirmed there is
      no hidden vendor behind Online Tutoring, Affiliate Marketing,
      WhatsApp Business, No-Code App Building or Virtual Assistance, so
      those rejections now stand on evidence rather than on a failed
      search.

      Power BI was then rejected on the merits anyway, which is the point
      worth keeping: **finding the channel is not the same as finding a
      usable video.** Microsoft's own "Getting started with the Power BI
      service" runs 2:50, under the floor, and the channel's Power BI
      material dates to 2018. Guy in a Cube — run by Microsoft's own Power
      BI team and already used once in that course — has a good workspaces
      video, but at 2019 it shows a Service UI that has since changed.

      Print-on-Demand shipped instead, from Printful's own channel. Its
      2019 niche-selection video was accepted and its 2019 Design Maker
      tour rejected, on the same test the Indeed videos passed the day
      before: **staleness of fact, not age of upload.** Niche selection is
      advice about people; a Design Maker tour is a UI that has changed.

      The 9 September 18:00 firing shipped **nothing**, and its near
      misses are recorded here so they are not re-searched. **Photoshop**
      is one video short: Adobe's own "How to Use Selection Tools" (4:08)
      is a clean fit for the Level 1 gap — the course goes interface →
      layers → masks without ever teaching selection — but the only other
      Adobe beginner-series video found, "How To Customize Your Photoshop
      Workspace", runs 2:19. **Technical Writing** fails on altitude
      rather than sourcing: Write the Docs is a real authority, but its
      talks run 29-34 minutes and are aimed at practising writers, which
      is the wrong level for a learner who has just met the job title.
      Nielsen Norman Group's "Information Architecture: 3 Key Models"
      would have paired well at the right level but runs 2:53.

      That is the shape of what remains: not an absence of authorities,
      but a shortage of authority videos that are simultaneously long
      enough, current enough, and pitched at a beginner.

      **Photoshop's missing video was found on 15 September, and where it
      was hiding is the point.** The 9 September firing had Adobe's
      selection-tools video and recorded the course as one video short.
      The second came from **"Adobe Creative Cloud" — a different official
      Adobe channel from "Adobe Photoshop"**, which none of the earlier
      searches had surfaced. A single vendor can run several channels, and
      finding one does not mean you have found them all.

      The gap it closed was a genuine hole rather than a nicety: Level 1
      taught the interface and layers, Level 2 went straight to masks and
      retouching, and **selection — which both of those depend on — was
      never taught**. A mask is a selection made permanent; the course was
      teaching the second thing without the first.

      Rejected on the way: Adobe's "How to Remove Unwanted Objects" (4:57)
      overlaps Level 2's spot-healing lesson; "Photoshop CC Overview" runs
      1:47 and dates to 2014; "How To Customize Your Photoshop Workspace"
      runs 2:19. All three are official Adobe uploads — attribution was
      never the constraint on this course.

      The 16 September 02:00 firing shipped nothing and produced the
      clearest evidence yet on the duration floor. Applying the
      several-channels-per-vendor lesson found **HubSpot Academy**, a real
      official channel distinct from HubSpot Marketing. Its sales-process
      videos are exactly the gap in `sales-lead-generation` — "What is an
      Inbound Sales Process?" by HubSpot's former CRO, and "How to
      Increase Close Rates with Prospecting and Qualifying" — and they run
      **2:53 and 2:38**, blocked by a 3:00 threshold that exists to
      exclude Shorts. Its videos that DO clear the floor are 19-20 minute
      tutorials for **Sales Hub, a paid tier**, and a 1h44m CRM setup —
      dropped on the same ground as Notion's AI Meeting Notes, since a
      learner on the free tier gets nothing actionable.

      Also settled that firing: **Google's technical writing course is
      deliberately text**, and its only videos are 2:10-2:17 facilitator
      briefings for people teaching it, plus a 38-second Workspace clip.
      And **Power BI has no alternate official channel** — the Microsoft
      Fabric search returned only third-party creators and Guy in a Cube.
      Both rejections are now final rather than provisional.

      The 16 September 10:00 firing found **Thinkific**, a course-platform
      vendor whose own channel carries a genuine course-design series.
      That filled a real hole in `online-tutoring-course-creation`, which
      went from "what online tutoring is" straight to "recording your
      first lesson" with **no planning step at all** — the order most
      people work in, and the reason most first courses are abandoned.
      The two lessons taken are craft rather than product tour, so the
      advice transfers to Udemy, Preply or a YouTube channel.

      The same firing closed **Zapier** for good. Its newest beginner
      video, "New to Zapier? Build Your First Lead Automation", runs **22
      seconds**; with the earlier 15s and 19s finds, the channel is
      Shorts-only and `workflow-automation-zapier` cannot be deepened from
      the vendor at any duration floor this project would accept.

      **THE 3:00 FLOOR IS SETTLED, 23 September: relaxed to 2:30, for
      named vendor and authority channels only.** The floor exists to
      exclude Shorts, and a Short is a format rather than a length —
      HubSpot Academy's 2:53 sales-process video presented by a former
      CRO is not a Short by any reading, and excluding it on a rule
      written to catch 22-second clips was the rule failing at its own
      purpose. The relaxation applies ONLY where the channel is already
      trusted under the vendor-and-authority test; for everything else
      the 3:00 floor stands, because on an unknown channel length is the
      only cheap signal that a video is a lesson rather than a teaser.
      This unblocks the HubSpot Academy pair in `sales-lead-generation`
      and the Adobe workspace video, and leaves every Shorts-only
      rejection — Zapier at 22 seconds, the 38-second Workspace clip —
      exactly where it was.

      The 16 September 18:00 firing shipped two, both found by pointing
      the several-channels-per-vendor lesson at **adjacent categories**:
      Ahrefs publishes a numbered affiliate-marketing course, not only
      SEO, and FlutterFlow runs a separate "FlutterFlow University"
      teaching series. Affiliate Marketing gains the site blueprint and —
      deliberately — Ahrefs' 2026 piece on what Google's updates did to
      affiliate sites, because a course teaching this model without saying
      so is out of date. No-Code gains the two concepts every tool shares,
      which also partly offsets a known defect: its Level 2 Glide lessons
      use Glide's older product.

      Rejected on duration from those same two channels: Ahrefs' course
      parts [1.1] (1:59), [1.2] (2:33) and [1.3] (1:56) — a numbered
      series whose early parts sit under the floor — and its 1h48m
      complete course, too long for a Level 1 lesson when data costs
      money.

      **SQL reopened a course that had been closed, without new
      sourcing.** It was rejected on 9 September for having no vendor
      channel, which is still true — but its own lesson 1 already points
      at freeCodeCamp's 4h20m SQL course, and that video publishes a named
      chapter list. The new lessons send the learner to "Tables & Keys",
      then "Creating Tables" and "Inserting Data", closing the largest gap
      found in this sweep: every lesson after Level 1 READS data, and
      nothing taught how to create any, so a learner could never build a
      database to practise on.

      That also costs the learner no new download, since they opened the
      same video in lesson 1 — which the notes point out, because data
      costs money here. **A course with no vendor channel may still have a
      long course video with named chapters already in it.**

      ### iPhone login showed "app error" — fixed 25 September

A learner reported that logging in on an iPhone gave an application
error. It was not the login code. Next.js 16 with Turbopack, given no
`browserslist`, compiles the client bundle for modern browsers only, and
the shipped App Router chunk contained a CLASS STATIC INITIALIZATION
BLOCK:

    class _ extends i.default.Component{static{this.contextType=...}}

That is Safari 16.4+ syntax. An iPhone below iOS 16.4 throws a
SyntaxError while PARSING that chunk, so React never hydrates and Next
renders "Application error: a client-side exception has occurred". It is
invisible everywhere else: desktop Chrome, Android Chrome and even
Chromium at an iPhone viewport all parse it fine, which is why it reads
as an iPhone-only fault. Nothing reaches the server, so Vercel's runtime
errors and logs stay empty -- confirmed, both were clean.

The fix is the `browserslist` key now in `package.json`. It makes the
build down-compile the syntax and emit runtime polyfills for
`Object.hasOwn` and `Array.prototype.at`. Verified on the built output:
zero class static blocks in any JS chunk afterwards, both polyfills
present, and the cost is 6KB uncompressed across the whole bundle
(888,954 -> 895,115 bytes, 0.7%), roughly 2KB on the wire.

Checked for a styling regression and there is none -- Tailwind still
resolves to `display: flex`, a 24px nav gap and the mobile hamburger at
iPhone width. An earlier run that appeared to break the layout was a
stale `next start` holding port 3000 and serving HTML pointing at deleted
chunk hashes; every one of those 500s disappeared on a clean restart.
Worth remembering: kill the old server before judging a rebuild.

CAVEAT, not resolved. Tailwind v4 itself targets Safari 16.4+ -- it emits
`@property`, `color-mix()` and cascade layers. This fix makes the page
RUN below iOS 16.4; it does not promise it looks right. And the learner's
actual iOS version was never captured, so while this is a real bug that
produces exactly the reported symptom, it is not proven to be the one
they hit. The iOS version, or the console line from Settings > Safari >
Advanced > Web Inspector, would close that gap.

### Backfilling the 438 bare lessons — started 17 September

      **Bare-lesson count: 438 → 114. Twenty-seven courses are now fully
      written: `freelancing` (12 lessons), `presentation-design` (19),
      `ai-tools` (16), `vibe-coding` (16), `video-editing` (12),
      `virtual-assistance-data-entry` (12), `graphic-design` (18),
      `social-media-management` (16), `digital-marketing` (16),
      `copywriting-content-writing` (16), `google-facebook-ads` (16),
      `ecommerce-online-selling` (17), `seo-search-engine-optimization`
      (17), `instagram-tiktok-growth` (12), `email-marketing` (16),
      `excel-spreadsheets-for-work` (17), `project-management-tools`
      (16), `ui-ux-design-figma` (16), `bookkeeping-quickbooks` (16),
      `transcription-translation-freelancing` (12),
      `customer-service-virtual-call-center` (12),
      `data-analysis-visualization` (16),
      `resume-writing-linkedin-personal-branding` (16),
      `mobile-photography-content-creation` (12),
      `python-programming-for-beginners` (16),
      `google-workspace-productivity` (16) and
      `podcasting-voice-over` (12).**

      **No enrolled course carries a bare lesson any more.**
      `google-workspace-productivity` was the last one, held back until the
      duplicate-lesson question below was settled, and is now complete at
      16 of 16 (`0140`, `0141`). Everything still bare is unenrolled.

      Two different things were both being called "depth". One is Level 1
      breadth, which the routine has been adding — 50 new lessons across
      15 courses in ten days. The other is the quality of the lessons
      already on the site, and 438 of 735 (60%) were a title and a video
      with no notes, objectives, practice task or knowledge check. That
      second number had not moved by a single lesson.

      Backfilling needs **no video sourcing at all** — the videos are
      already there; what is missing is the written teaching around them.
      That sidesteps the sourcing wall entirely, and it is also the root of
      the duplicate-lesson defect below: with no notes, two lessons on the
      same video are indistinguishable.

      `freelancing` was the first target — 12 of 12 lessons bare, on a
      course with a live enrollment, so someone had paid for a course in
      which every lesson was a title and a link. It is now **complete**:
      `0087` covered Levels 1-2 and `0088` Levels 3-4.

      `presentation-design` followed — 12 bare lessons on a course with 2
      enrollments — and is now complete at 19 of 19 (`0089`, `0090`). Its
      notes carry what presentation advice made elsewhere assumes away: a
      dim projector in a lit room rather than a dark auditorium, 24-point
      minimum and a three-metre readability test, fonts that reflow on a
      venue laptop, PDF as the delivery format because it opens on a phone
      and uses less data, and the fact that most decks here are first
      reviewed on WhatsApp on a phone. The funding lesson states plainly
      that the standard investor-deck format is built for Silicon Valley
      venture capital, and names what actually funds small businesses here
      — savings and family, chamas and SACCOs, grants, microfinance,
      development programmes.

      `ai-tools` was third — 12 bare lessons of 16, on a course with 2
      enrollments — and is now complete at 16 of 16 (`0091`, `0092`). The
      four lessons already written (Modules 3 and 4, on prompting and on
      what AI gets wrong) set the house style and the new twelve were
      written to build on them rather than restate them.

      One deliberate constraint on this course in particular: **the notes
      name no model versions, prices or free-tier limits.** Those change
      every few months and would date a course that charges KSh 500. What
      is taught instead is what survives the next release — a chat is a
      conversation and not a search box; state the format you want; bring
      your own material and let the tool transform it rather than invent
      it; a citation proves a page was found, not that it is right; chain
      a long job into steps and check each one. The two Module 8 lessons
      carry the custom-assistant work from Module 5 through to a costed
      package with a stated revision limit, and say plainly that the first
      sale comes from a business you can walk into rather than from a
      global freelance platform.

      `vibe-coding` was fourth — 12 bare lessons of 16, 2 enrollments —
      and is now complete at 16 of 16 (`0093`, `0094`). Modules 3 and 4
      were already written, so the new twelve build on them rather than
      restate them: the debugging lesson's recovery procedure depends on
      the commit-before-each-change habit from Module 4, and the prompting
      lesson fills in what goes inside one of Module 3's small steps.

      Two things a paid course should say and the source videos do not.
      **Security and data protection** — an app holding customers' names,
      phone numbers or ID details makes its builder responsible for
      protecting them, Kenyan law treats that as a real obligation, and
      the safest first project stores no personal data at all. And **the
      gap between the demo and the deliverable** — the thirty-minute build
      is real, the week that follows is where error states, phone layout
      and permissions live, and the pricing rule is to quote the week and
      cut features rather than quality when time runs out.

      A defect was caught here by the fingerprint check and fixed in the
      same session: ten apostrophes had been written doubled in the source
      plan (`today''s`, `Kenya''s`), which would have rendered literally on
      the page. The doubling is SQL escaping, added by the generator, and
      must never appear in plan JSON. All 735 lessons were scanned; the
      only other match is a genuine JavaScript empty-string literal in Web
      Development and is correct.

      `video-editing` was fifth and is complete at 12 of 12 (`0095`,
      `0096`). It was **wholly** bare — every one of its twelve lessons a
      title and a link, on a course with a live enrollment — which is now
      the discriminator that matters more than enrollment count.

      The notes are written for the equipment a learner here actually
      owns. A phone editor is treated as a legitimate professional tool
      rather than a stepping stone; proxies are named as the technique
      that makes a modest laptop viable; the mix is judged on a phone
      speaker at low volume in a noisy place and the grade on a phone
      screen outdoors, because that is where the audience is. Delivery
      covers what WhatsApp compression does to a client's file. The
      freelance module leads with re-cutting a business's own video
      unasked, because the first client problem is circular and that is
      what breaks it.

      **Generator hardened.** `build-backfill-sql.py` now refuses a plan
      whose notes or practice contain a doubled apostrophe, naming the
      lesson and field. That escaping is the generator's job; in a plan it
      is content and renders literally on the page. It shipped once, in
      four Vibe Coding lessons, and the fingerprint check is what caught
      it.

      `virtual-assistance-data-entry` was sixth and is complete at 12 of
      12 (`0097`, `0098`). Also wholly bare, also with a live enrollment.

      This course sends a learner to work for strangers abroad, so the
      notes carry what that actually requires from here. Kenya is UTC+3
      and does not change its clocks, so the gap to a European or North
      American client moves by an hour twice a year — a meeting that was
      right in July is wrong in November. Cross-border payment costs money
      and takes days, so it is part of the rate and is established before
      the rate is agreed. A power cut is not an excuse a client accepts,
      so the backup is arranged in advance. And the rate that matters is
      what reaches you after the platform cut and the transfer, not the
      quoted figure.

      The protections are named rather than implied: a fee to start, an
      open-ended unpaid trial, a client who will not say what the work is,
      and anyone asking you to receive money and forward it on. The
      defence taught is scope and rate in writing, then a small paid piece
      before committing to a large one. Local clients are presented as a
      real option rather than a consolation — shillings, no transfer cost,
      no time-zone gap, and you can meet them in person.

      **Verification widened.** Checks now cover all four written fields
      rather than notes alone. `knowledge_check` cannot be compared by raw
      md5 — Postgres normalises jsonb key order and whitespace, so a
      literal hash never matches — and is compared semantically instead
      (question text, option text and order). That false alarm cost a
      round of investigation once; it should not cost another.

      `graphic-design` was seventh and is complete at 18 of 18 (`0100`,
      `0101`). Modules 3 and 4 were already written — colour, readability,
      typography, layout, negative space, grids — so the new twelve build
      on them: font pairing turns Module 3's "two fonts is plenty" into a
      method, and the palette lesson turns its colour theory into roles
      with assigned jobs.

      The constraints named are the ones this market imposes and tutorials
      never mention: small local printers on ordinary paper lose fine
      detail and pale colours, WhatsApp compression breaks thin text and
      gradients, phone screens in sun punish low contrast, and a logo must
      survive a thermal receipt and a nineteen-pixel profile circle. Font
      licensing, commercial-use limits on free-tier assets, and whether a
      font renders Kiswahili characters are treated as delivery
      requirements rather than footnotes. Print is presented as a service
      to sell alongside the design — income no overseas competitor can
      reach.

      ### A rendering defect, found and fixed — migration `0099`

      Lesson text renders as **plain text**, not markdown:

          app/learn/[courseId]/[lessonId]/page.tsx:157
          <p className="text-sm whitespace-pre-line">{lesson.notes}</p>

      React escapes the string, so lessons written with markdown emphasis
      were showing the markers to the learner — "**leading** is the space
      between lines". 36 lessons across four paid courses were affected,
      including Web Development, the platform's deepest course, and
      Graphic Design, which carries a completion.

      Checked before replacing: every affected field had an even number of
      `**`, none contained `***`, and none matched a digit-`**`-digit
      pattern, so no JavaScript exponent operator was caught. Only the
      markers were removed.

      **Write lesson text as plain prose.** Capitals for emphasis, blank
      lines for structure. No `**`, no `#` headings, no markdown lists —
      the page does not render them.

      `social-media-management` was eighth and is complete at 16 of 16
      (`0102`, `0103`). Modules 3 and 4 were already written — content
      calendar, automation, reading analytics, reporting — so the new
      twelve build on them: pillars are what fills the existing calendar,
      and the metrics lesson covers which numbers deserve to be in the
      existing report at all.

      The channel advice departs from the international courses
      deliberately. **WhatsApp is named as a primary selling channel**:
      Status reaches customers who already saved the number, Business
      catalogues and quick replies do real work, and for many shops
      WhatsApp plus one public platform beats an elaborate presence
      elsewhere. It also cannot be scheduled by third-party tools, so it
      is daily manual work that belongs in the routine and the price.

      Two risks are stated plainly because they end contracts here rather
      than merely underperform. Posting anything political on a business
      account can cost a large part of its customers, and that is not the
      manager's alignment to spend. And the account manager is not the
      spokesperson — anything alleging harm, illegality or naming a staff
      member goes to the client, with who handles it agreed in advance.

      `digital-marketing` was ninth and is complete at 16 of 16 (`0104`,
      `0105`). Modules 3 and 4 were already written — audience, buyer
      persona, the funnel, the customer journey — so the new twelve build
      on them.

      The structural correction this market needs runs through the whole
      course: **the conversion happens in a conversation, not on a
      website.** An advert's job here is often to start a WhatsApp chat or
      a phone call, with payment landing on M-Pesa rather than a card
      checkout, so campaigns are judged on enquiries and sales rather than
      website visits. International courses assume a site with a card
      payment at the end, and building that for a small Kenyan business is
      frequently solving a problem it does not have.

      The same correction shapes measurement. Most of the result is
      invisible to analytics — WhatsApp, walk-ins, calls, word of mouth —
      so the course teaches counting enquiries by hand, asking every
      enquirer where they heard, and putting offline results in the
      report. A marketer who reports only the dashboard is reporting the
      less impressive fraction of their own work.

      Other local requirements: ad accounts bill in foreign currency and
      need a card; campaign timing follows school fee periods, harvest and
      end-of-month salaries; capacity is confirmed before demand is
      created; and the marketer's fee is separated from ad spend in
      writing, with the budget taken in advance and never self-funded.

      `copywriting-content-writing` was tenth and is complete at 16 of 16
      (`0106`, `0107`). Modules 3 and 4 were already written — the named
      reader, how people read on screens, plain language.

      Three things the source videos do not say. **Imported persuasion
      backfires here**: countdown timers, manufactured scarcity and
      exaggerated promises come from a market that rewards pressure, and
      they read as untrustworthy where buying runs partly on personal
      reputation. **WhatsApp and SMS are taught as paid copy formats**,
      because they are the real sales channel for many businesses and no
      international course lists them — the first line of a WhatsApp
      message carries the whole weight, since that is what shows in the
      notification. And the course names **the most reliable content niche
      available to a Kenyan writer**: questions whose current top results
      were written by people who have never been here, with converted
      prices and foreign procedures.

      This is also the course where AI drafting bites, so the position is
      stated plainly: a legitimate tool most working writers use, but raw
      output carries exactly the faults the mistakes lesson lists, and
      what the writer is paid for is judgement. A writer asked about it
      should answer matter-of-factly — evasiveness is what loses trust.

      `google-facebook-ads` was eleventh and is complete at 16 of 16
      (`0108`, `0109`). This course carries real completions, so its own
      baseline was recorded before the work — 1 enrollment, 2
      lesson_progress rows — and confirmed unchanged after.

      The automated-campaign lesson is written to outlive the product
      name, since these change every couple of years. What it teaches is
      three questions to ask whenever a platform offers to decide things
      for you: what is it optimising toward and is that my goal, what data
      is it learning from and is that data correct, and what would I be
      unable to see or control. It also names the specific trap — an
      automated campaign will spend on people searching the business by
      name, who were coming anyway, and report them as conversions.

      The money rules are stated plainly because this is the course where
      a learner spends someone else's money: **the fee is separate from ad
      spend, the client pays the platform directly from their own account,
      and the manager never puts a client's advertising on their own
      card.** The course also teaches the honest refusal — a business with
      no capacity, no stock or nobody answering the phone should not be
      sold advertising, because the money will be spent, it will fail, and
      the manager will be blamed.

      `ecommerce-online-selling` was twelfth and is complete at 17 of 17
      (`0110`, `0111`). Modules 3 and 4 were already written — product
      photography, descriptions, pricing, shipping.

      The course says plainly what the official Shopify tutorial cannot:
      **a hosted store is a fixed monthly bill in foreign currency**, and
      for a seller doing a handful of orders a week it can exceed the
      profit. The honest sequence is to start where the customers already
      are, prove people buy, build the list, and move to a hosted store
      when volume makes the cost trivial. WhatsApp is treated as the main
      channel it actually is for many sellers here, not a stepping stone.

      Fulfilment is written for how delivery really works: **descriptive
      addresses rather than numbered ones**, so a landmark, an area and an
      answered phone number are collected and confirmed before dispatch —
      most failed deliveries here are address failures, not courier
      failures. Pay on delivery means some parcels come back, so that is
      tracked and priced in. The marketplace lesson names the settlement
      gap that actually breaks small sellers: needing cash for new stock
      before being paid for the last.

      The freelancing lesson teaches the honest advice as the better
      business — most small businesses here do not need a hosted store,
      and the build you talk a client out of is the client you keep for
      years.

      `seo-search-engine-optimization` was thirteenth and is complete at
      17 of 17 (`0112`, `0113`). Modules 3 and 4 were already written —
      crawling, indexing and ranking, and three Search Console lessons —
      so the twelve new lessons build on them rather than restate them.

      The course is blunt about the two things SEO tutorials are not.
      **Paid tools are priced in foreign currency at a level that can
      exceed the whole fee for one small local client**, so the Ahrefs
      lesson maps each question a paid tool answers to the free source
      that answers it — Search Console is more accurate about your own
      site than any tool — and says a beginner should let paying work
      fund the tools rather than the reverse. And the pricing lesson
      tells learners to **refuse pay-on-results SEO** and why: rankings
      depend on what you do not control, and you would carry months of
      unpaid work on a promise.

      The local emphasis runs through it. Search volume for a specific
      service in a specific town is genuinely small and tools report zero
      for phrases people definitely type — that means the tool cannot see
      it, not that there is no demand. The commonest real audit finding
      is **no page naming the service and the town, or an incomplete
      local profile**, not anything technical. The freelance lesson
      teaches reporting leading indicators — impressions, load time,
      indexing fixes — in month one when there is no ranking news, which
      is what keeps a client past week six.

      `0112` and `0113` were applied to production before the container
      was recycled, and the commits were lost with it. They were
      reconstructed from the live rows and verified field-by-field —
      notes, objectives, practice and knowledge check, all twelve lessons
      — so the committed SQL is byte-identical to what production holds.

      `instagram-tiktok-growth` was fourteenth and is complete at 12 of
      12 (`0114`, `0115`) — wholly bare before this. It sits next to
      `social-media-management`, which was already written, so Module 6
      here is deliberately angled at selling SHORT-FORM VIDEO PRODUCTION
      as a narrower, better-paid service rather than restating general
      social media management. No video is shared between the two
      courses.

      The course refuses the two things short-form tutorials sell. It
      says plainly that **platform payout programmes are largely
      unavailable in Kenya**, so views alone pay nothing — a hundred
      thousand views is worth exactly what you convert it into, and the
      conversion has to be decided before you post, not after. And it
      takes the "go viral every time" video as marketing: nobody does,
      what is repeatable is raising the odds and being ready for the
      spike, which is the part nobody prepares for.

      The constraints are the real ones. Uploading video costs money on
      a bundle, so filming is batched around daylight and uploaded on
      wifi; one Saturday morning produces a fortnight. Most viewing is
      muted on a phone, so captions are treated as compulsory rather
      than a nicety. **Language is written as a reach decision** —
      Kiswahili or Sheng reaches a Kenyan audience and caps the
      international one, and a local audience of 3,000 is worth more to
      a Nakuru business than 50,000 scattered viewers who cannot buy.
      And the equipment argument is named as what it usually is: a way
      of postponing the first post.

      The freelance module is written for how business is actually done
      here — WhatsApp rather than email, a voice note answered faster
      than text, walking in at a quiet hour beating every online method
      for a first client, three videos made unasked instead of a
      proposal, and a deposit taken before filming because chasing the
      balance afterwards is the commonest way freelancers here lose
      money.

      `email-marketing` was fifteenth and is complete at 16 of 16
      (`0116`, `0117`). Modules 3 and 4 were already written — spam and
      deliverability, subject lines, segmentation, reading the numbers —
      so Module 5 builds on the segmentation lesson rather than
      repeating it.

      The course says the thing an email course is not supposed to say:
      **for most consumer businesses here, email is the wrong channel
      and WhatsApp is the right one**, and pretending otherwise wastes a
      client's money. It then names where email genuinely wins —
      business-to-business, professional services with a long decision,
      schools, clinics, associations with a membership, the diaspora,
      and anything sold with a written record.

      Two lessons refuse their own source. The A/B testing lesson says
      **a difference of 22 opens against 19 is noise**, that a few
      hundred per group is the minimum for a single result to mean
      anything, and that at Kenyan small-business list sizes you should
      keep a log across ten sends instead of splitting the list — and it
      notes open rates are now inflated by privacy image pre-loading, so
      judge by clicks and replies. The segmentation lesson says a list
      of two hundred does not need eight segments, and that saying so to
      a client is worth more than the extra line on the invoice.

      The **Data Protection Act 2019** runs through the course, which no
      international email video covers: consent freely given and
      informed, the purpose stated, removal honoured, a record kept of
      when and how each address was collected. The anti-pattern lesson
      scripts the conversation with the client who arrives holding a
      bought list or a WhatsApp group export — what will happen to their
      domain, what the Act says, and the opt-in invitation to offer
      instead.

      Launch timing is written for household cash rather than a generic
      calendar: end of month, school fee terms, harvest and December
      change whether buyers have money, so a close on the 18th and a
      close on the 2nd are not the same launch. And the payment method
      belongs in the launch email, because a buyer who reaches a
      card-only checkout does not come back.

      `excel-spreadsheets-for-work` was sixteenth and is complete at 17
      of 17 (`0118`, `0119`). Modules 3 and 4 were already written —
      tables, sorting, filtering, absolute references and error values —
      so the lookup and pivot lessons build on them directly.

      The course names the tool most learners should actually use.
      Employers say Excel, the skills transfer exactly, but **Google
      Sheets is the practical daily tool here**: no licence in foreign
      currency, works on a phone, saves itself, survives a dead laptop
      or an infected flash disk, and its version history means a shared
      file cannot really be destroyed. Two sharing traps are made
      explicit — set the locale before entering dates, and format the
      phone column as text before the leading zero is lost.

      The applied thread throughout is **reconciliation**, which is the
      spreadsheet job small businesses here actually pay for. The lookup
      lesson teaches matching an M-Pesa statement against a sales
      record: build one clean key column because numbers arrive as
      0722, +254722 and 254722 in the same job, force transaction codes
      to text, and filter the not-founds, because the not-founds are the
      work. The budget tracker carries a transaction-code column, a
      category for transaction charges, and a structure built for
      irregular income and lumpy costs — school fees, rent paid several
      months at a time, harvest inputs — rather than a tidy monthly
      salary.

      The freelance lesson treats its own title figure as marketing and
      teaches the sentence that is really the job: the stock never
      matches, I do not know who owes me, it takes two days to close the
      month. And the dashboard lesson designs for the screen the client
      will actually use — a PDF opened on a phone in WhatsApp, with the
      headline number in the message text because the attachment often
      goes unopened.

      `project-management-tools` was seventeenth and is complete at 16
      of 16 (`0120`, `0121`). Modules 3 and 4 were already written — what
      a project plan contains, breaking work into assignable tasks, how
      work should flow through a board, tracking and reporting — so the
      tool lessons teach judgement rather than repeating the method.

      The course refuses to be a tool tour. Its governing claim is that
      **the board is only true if people move the cards**, and that an
      out-of-date board is worse than none because decisions get made
      from it — so when a team will not update it, the fix is fewer
      columns and fewer fields, not more training. Every tool lesson is
      built around that.

      It also refuses to fight WhatsApp. **WhatsApp is already the
      project tool here and is not going away**, so the course makes it
      the conversation and the board the record, with the rule that a
      decision is not a decision until it is a task with an owner and a
      date, named back in the chat. Teams that try to move all talk into
      the tool abandon the tool within a month.

      Three honest limits run through it. Free tiers are genuinely
      enough for a small team and paid seats bill per person in foreign
      currency, so viewers get a shared link rather than a seat. Notion
      is heavy on mobile data, so a team checking work from a phone in
      the field will use a Trello board and often will not use a rich
      workspace. And the relations-and-rollups lesson says plainly that
      **a freelancer with three clients and fifteen tasks does not need
      connected databases** — the hours would be better spent finding a
      fourth client.

      The freelance module names the market honestly: nobody here is
      searching for a Notion consultant, so the offer is written in the
      client's words — work gets lost between people, closing the month
      takes two days — and the most winnable local job is small and
      concrete: set up the board, write the routine, train the team,
      review it monthly.

      `ui-ux-design-figma` was eighteenth and is complete at 16 of 16
      (`0122`, `0123`). Modules 3 and 4 were already written — what user
      research actually is, user flows before screens, auto layout, and
      components and variants — so the tool lessons build on them.

      The course's through-line is that **a design must be judged on the
      device it will be used on, not the one it was made on**. Tutorials
      design on a large recent handset; most users here hold a
      mid-range or older Android with a smaller screen and an enlarged
      system font. Contrast is treated as a functional requirement
      rather than taste, because pale grey on white disappears on a
      cheap screen in sunlight. And **weight is named as a design
      decision**: a designer who specifies three typefaces and a hero
      video has spent the user's money on a data bundle.

      Two things the source videos do not cover are made explicit. The
      wireframing and design-system lessons treat **loading, empty,
      failed and offline as first-class states** rather than edge cases,
      because a dropped connection mid-action is routine here. And the
      prototyping lesson designs the **M-Pesa handoff** — the user
      leaves the app for a prompt and returns — including what they see
      if the prompt never arrives and how to check without paying twice,
      which is where real purchases are abandoned.

      The practice lesson points learners at Kenyan apps rather than
      design showpieces, since a careful rebuild of a payment
      confirmation screen teaches more about this market than ten
      foreign portfolio pieces — and it insists on real content: long
      names that do not fit a neat field, shillings with separators,
      descriptive addresses rather than a postcode.

      The freelance module says many clients asking for a website need a
      WhatsApp catalogue and two good pages instead, and that saying so
      wins the relationship. The portfolio lesson carries two versions
      of every case study: the full write-up for agencies, and a
      one-screen before-and-after with one sentence of outcome for the
      small business owner reading it on WhatsApp.

      `0124` is a repair, not new content. Two fields in `0123` were
      applied to production with possessive apostrophes dropped in
      transcription; the fingerprint check caught it and `0124` restores
      the text `0123` already specifies.

      `bookkeeping-quickbooks` was nineteenth and is complete at 16 of
      16 (`0125`, `0126`) — the first of the unenrolled twelves, taken
      first because the skill converts to paid work faster than anything
      else left in the backlog. Modules 3 and 4 were already written —
      invoices, bills, connecting a bank account and what to do when
      yours is not supported, categorising without guessing.

      The course names the real problem before it names any software:
      **business and personal money running through the same M-Pesa
      number**. Fees, fare, shopping, stock and customer payments in one
      statement, which no package fixes afterwards — the remedy is a
      separate till or paybill and the owner taking a stated amount
      recorded as drawings.

      It is honest about QuickBooks. The subscription is billed in
      foreign currency, **automatic bank feeds mostly do not work with
      Kenyan banks and not with M-Pesa**, so the labour-saving that
      justifies the cost elsewhere often never arrives here. Learn it
      for employability and for the jobs that require it, and be the
      person who says plainly that a well-built spreadsheet is the right
      answer for many small clients.

      The chart-of-accounts lesson adds what imported templates omit:
      mobile money as its own asset account, transaction charges as
      their own expense, owner drawings, bad debt (informal credit to
      regular customers is normal and some is never collected), and
      transport. The automation lesson names the three things a rule
      must never touch — a bare personal name in an M-Pesa description,
      transfers between the business's own accounts, and cash
      withdrawals.

      Two professional boundaries are stated outright: **never force a
      reconciliation with an adjustment**, because it hides the error,
      compounds monthly and is exactly what an auditor looks for; and
      **you are not an auditor and, unless qualified and registered, not
      their tax agent** — prepare the books so filing is straightforward
      and say so before a client assumes otherwise.

      The client lesson notes that the first deliverable that convinces
      an owner is almost never the profit and loss — it is the list of
      who owes them and for how long, because that is money they can
      collect this week.

      `transcription-translation-freelancing` was twentieth and is
      complete at 12 of 12 (`0127`, `0128`) — wholly bare before this,
      with no module already written, so the whole course is new.

      It is the course that most needed an honest update, because
      **automatic speech recognition has already taken the work these
      videos were made to teach**. Clear single-speaker English
      transcription is no longer an income. What remains paid is named
      explicitly: difficult multi-speaker audio, work where accuracy is
      not optional, and editing machine output — which is now a large
      share of the market and a distinct skill, since the machine is
      fluent, confident and never signals doubt.

      The Kenyan advantage is the spine of the course. **Swahili, Sheng
      and English-Swahili code-switching are exactly what the machines
      handle worst**, along with Kenyan-accented English and the other
      Kenyan languages. The demand is local and specific — research
      interviews, NGO and county programme work, media houses,
      subtitling, legal recordings — and one good research client is
      worth a year of platform work. English–Swahili translation is
      framed the same way: a real, underserved pair where machine
      translation is much weaker than in European pairs, so post-editing
      grids designed for those pairs do not apply and a sample should be
      quoted on instead.

      Professional boundaries are stated plainly: translate only into
      the language you write natively; certified or sworn translation is
      a separate formally recognised thing; never guess at an inaudible
      passage; and never paste a client's confidential document into a
      public online tool, which for research and clinical recordings is
      both a breach of confidence and a Data Protection Act matter.

      The code-switching convention is treated as something to agree in
      writing before starting — transcribe each language as spoken,
      translate the Swahili inline, or both — because deciding it
      silently changes what the transcript is.

      `customer-service-virtual-call-center` was twenty-first and is
      complete at 12 of 12 (`0129`, `0130`) — wholly bare, no module
      previously written.

      The course is built around the requirements no international
      support video mentions and that actually decide whether someone
      here keeps the job: **your connection and power are the job**. An
      agent who drops mid-call loses the contract, so a backup SIM on a
      different network and enough power to finish a shift through an
      outage are treated as prerequisites, stated in the application,
      and named as what makes a Kenyan applicant stand out rather than
      what disqualifies them. A genuinely quiet room, and a headset with
      a real microphone, are the other two.

      On accent it takes a clear position: **clear, paced,
      well-pronounced English matters and accent neutralisation largely
      does not**. Being hard to follow is the only real problem, and a
      caller who turns hostile about your accent or your country is
      being abusive, not giving feedback — the same policy applies as to
      any other abuse.

      It also routes people honestly. **Chat and email support are often
      the better entry from here**, because they remove the two things
      that most often cost people a phone role — a noisy environment and
      accent anxiety — and suit anyone whose written English and typing
      are strong. And it compares local BPO work with direct foreign
      contracts without pretending one is obviously better: a Nairobi
      contact centre pays less and gives you training, colleagues,
      employment terms and a building with power, while a foreign
      contract usually pays more and gives you none of that, usually as
      a contractor with tax and statutory contributions your own.

      The de-escalation lesson rejects its own title — you are not
      making anyone back down — and adds the part that decides whether
      someone lasts: take the thirty seconds between calls, keep a
      record when a call is abusive, and treat exhaustion from absorbing
      other people's anger as real rather than as a personal failing.

      `0131` is a repair. One knowledge-check question in `0129` was
      applied with its quoted phrase paraphrased away in transcription;
      the fingerprint check caught it and `0131` restores the wording
      `0129` specifies. That is the second such slip, both caught the
      same way.

      `data-analysis-visualization` was twenty-second and is complete at
      16 of 16 (`0132`, `0133`). Modules 3 and 4 were already written —
      what dirty data looks like, cleaning it, choosing the right chart,
      and how charts mislead — so the tool lessons build on them.

      The course makes the tool decision honestly rather than following
      the videos. **Power BI Desktop is free but runs only on Windows,
      and sharing a report properly needs a paid licence per viewer** in
      foreign currency — which many small clients here will not sustain.
      Learn it for employability, because Kenyan job adverts name it;
      use **Looker Studio for the work you will actually be paid for
      this year**, since it is free, runs in a browser on any machine,
      and costs nothing to share. The four stages transfer completely,
      so nothing is wasted. The Power BI project lesson pushes that
      further: settle at quoting stage what viewing will cost the
      client, and if the honest answer is that the owner reads it on a
      phone once a week, a one-page PDF is the deliverable and the
      Power BI file is your internal tool.

      The pandas lesson removes the hardware barrier that stops most
      people at that point: **use a free browser notebook rather than
      installing Python**, which runs on a modest or borrowed machine.
      And the data described throughout is the data people here are
      actually handed — M-Pesa and bank exports with amounts stored as
      text, survey exports from field data tools with unusable column
      names, place names spelt four ways — with the warning that a
      foreign date locale silently misreads every date in the set.

      The freelance lesson names where the demand really is, which is
      not where most people look: **NGOs and development programmes with
      monitoring and evaluation obligations** are the largest and most
      reliable source of data work in this market, alongside SACCOs,
      county offices, health facilities and agribusinesses. The first
      deliverable that convinces anyone is a clean answer to one
      question they have been arguing about, not a dashboard.

      Two safeguards run through it: reconcile one number by hand before
      showing any report, because a report wrong once is never trusted
      again; and aggregate before publishing anything that could
      identify individuals, never putting personal data in a public
      portfolio repository.

      `resume-writing-linkedin-personal-branding` was twenty-third and is
      complete at 16 of 16 (`0134`, `0135`). Modules 3 and 4 were already
      written — the cover letter, interview preparation, the common
      questions and STAR.

      The most useful thing in it is a distinction no international
      careers video makes: **the Kenyan CV and the international resume
      are different documents**, and sending the wrong one hurts either
      way. A local CV runs to two pages, names referees with contacts,
      and often carries personal details and a photograph, because that
      is what many employers here expect. An international or remote
      resume is one page with none of those. The course teaches both and
      tells learners to keep both versions — and the CV-writing service
      lesson makes "are you applying locally or abroad?" the first
      question, because it is what makes a writer visibly better than
      someone charging half.

      It is equally careful about ATS advice, which is written for a
      market that is not entirely ours: **an applicant tracking system
      is almost certainly in use for international, corporate and large
      NGO roles, and often is not** for local jobs applied to by email,
      a county portal, or a printed copy. The same clean single-column
      document serves both, so the fix is the same either way.

      On LinkedIn it says where the effort actually pays: genuinely for
      remote, international, professional and technical roles; much less
      for local informal hiring, trades and small businesses that hire
      by referral and WhatsApp. The honest consequence is stated
      plainly — **inbound recruiter interest is much thinner in this
      market than these videos imply**, so a good profile makes you
      findable and credible when someone checks you, and the
      applications you send and the people who know you remain the main
      channel.

      Two protections run through it. **A legitimate employer never asks
      you to pay** for a job, a placement, training or a medical, and an
      offer with no interview and a request for money is a fraud every
      time. And scanned certificates and identification are valuable to
      a fraudster, so they go only to an employer you have verified —
      never to an advert that arrived by WhatsApp from someone you
      cannot identify.

      This was the first course applied by echoing the generated
      migration file verbatim rather than retyping from the plan, after
      three transcription slips caught by the fingerprint check. Zero
      mismatches, on a set carrying six apostrophes including several
      inside quiz options — the exact construction that failed before.

      Order of attack for the rest: `youtube-channel-growth`, the last
      unenrolled twelve, then the eighteen courses sitting at six bare
      lessons each.

      **Podcasting & Voice-Over, written 25 September** (`0142`, `0143`),
      twelve of twelve, verified clean. Its beyond-the-video additions are
      the ones an international audio tutorial cannot give: the room
      matters more than the microphone, and a phone in a wardrobe full of
      clothes beats a studio-priced mic in a bare room; dollar equipment
      prices are not the landed price here once shipping and duty are on
      them; export speech as MONO MP3 at 64kbps, which halves what your
      listeners pay to download and what you pay to upload; the noise
      floor you actually record against - matatu traffic, a fridge, rain
      on an iron roof, dawn roosters, mains hum; and the honest market
      point that the global voice-over market is accent-sensitive, so the
      work genuinely open to a beginner here is Kenyan English, Swahili
      and Sheng for local radio, bank and sacco phone menus, NGO training
      and regional channels - start where you have the advantage, not the
      handicap.

      **Google Workspace used the same video three times, and that is
      correct.** `aoMMDlwEtwM` already carried two written module 4
      lessons — comments and suggesting mode, then version history, both
      about working WITH other people. The bare module 6 lesson became the
      third: document structure — real heading styles, the outline, a
      self-updating table of contents, and sending a PDF rather than an
      editable link. Three lessons, one video, three genuinely different
      things to learn, each naming which part to watch.

      **Verification note for `0140` and `0141`.** The post-apply
      fingerprint comparison was declined at the tool prompt on the day,
      so this pair was recorded as applied but unverified. It was RE-RUN
      AND PASSED on 25 September: all twelve match the plan JSONs on both
      the md5 of notes, practice and objectives and the semantic quiz
      canonical string. The pair is now verified like every other course.
      The generator's doubled-apostrophe guard also fired during authoring
      — on `SOMEBODY ELSE'S PERSONAL DATA` in the Drive-habits lesson —
      and was fixed in the plan JSON before the SQL was generated, which
      is the guard doing exactly its job.

      **Python closed the duplicate-lesson question in practice.** It
      carried both of the genuine duplicate pairs: `v-pUon2F5L8` in
      modules 6 and 7, and `kFhOLYaosDc` in modules 6 and 8. Neither was
      deleted. Each pair is now two different lessons on one video, each
      opening by naming which part to watch and what it adds. Module 6
      reads the automation projects for the PATTERN that makes a task
      automatable — the three tests — while module 7 returns to the same
      video and BUILDS one end to end, with the habits that matter on real
      files: work on copies, be safe to run twice, print what it will do
      before doing it. Module 6 asks whether Python freelancing is
      realistic and what the work actually consists of; module 8 takes the
      finished script from module 7 and turns it into a proposal, a price
      and a paid first job. That is the documented long-video method
      applied to a short video, and it worked.

      This also resolves something the sourcing work could not. Freelancing
      was dropped twice for having no authoritative video on pricing,
      contracts and getting paid. Those are now taught in the NOTES, which
      is what the method prescribes when a topic has no usable video —
      including what no international video covers: Wise and Payoneer
      rather than PayPal, a deposit as the only real protection when
      chasing a cross-border debt is impossible, and the Data Protection
      Act applying to a freelancer holding a client's customer list.

      `scripts/curriculum/build-backfill-sql.py` generates the SQL. It
      emits UPDATEs addressed by lesson id — nothing inserted, deleted or
      re-parented, no id changed — so `lesson_progress` is untouched.

      **Note for the deepening routine:** its standing check "the
      bare-lesson count must still read 438" is now stale. The invariant it
      protects still holds — new lessons must not ADD to the backlog — but
      the number will keep falling as backfilling proceeds. Treat this
      README as the current figure.

      ### A duplication defect found on 17 September, not yet fixed

      A catalogue-wide check for the same video appearing twice **within
      one course** turned up three live courses where a learner pays KSh
      500 and watches the same video twice under two different titles,
      with no notes to distinguish them:

      - `python-programming-for-beginners` — **four lessons, two videos**.
        "3 Python Automation Projects for Beginners" (m6) and "Build 3
        Python Automation Scripts" (m7) are the same video; "How to Land
        Freelance Jobs with Python" (m6) and "Landing Freelance Jobs with
        Python" (m8) are the same video.
      - `mobile-photography-content-creation` — "How To Shoot Epic Product
        Photography With a Phone" (m4) and "Product Photography Shoot With
        Just a Phone" (m5) are the same video.
      - `google-workspace-productivity` — m6 embeds whole the same video
        that two m4 lessons already teach by chapter.

      All the offending lessons are **bare** — part of the 438 backlog —
      which is why nothing flagged them: with no notes, there is nothing
      to tell the two apart. They are legacy from the original catalogue
      build, not from the deepening work.

      **Web Development's much larger reuse is NOT a defect and must not
      be "fixed".** Its two JavaScript course videos appear nine times
      each and a CSS one four times, but every lesson's notes name the
      specific chapter to watch — "Watch the **Link JavaScript to HTML**
      chapter", "**Lesson 5 — Variables**". That is the documented
      method for long course videos, and it works.

      **SETTLED, 23 September.** The owner's instruction was to fix
      everything, and on inspection the fix needs no deletion at all —
      Web Development already shows the correct pattern. Two lessons on
      one video are not a defect when each names the chapter to watch and
      teaches something different; they are only a defect while both are
      bare, because then nothing distinguishes them. Every offending
      lesson here is bare, so **writing distinct chapter-scoped content
      IS the fix**, and it is an ordinary UPDATE of `notes`,
      `learning_objectives`, `practice_activity` and `knowledge_check` on
      existing ids. Nothing is deleted, nothing is re-parented, no id
      changes, and `lesson_progress` is untouched.

      Concretely: each duplicated pair is written as two genuinely
      different lessons on the same source video, each opening by naming
      which part of it to watch and what this lesson adds. That is the
      documented long-video method applied to a shorter video, and it is
      what the three parked courses were waiting on.

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

### Pricing: one path KSh 500, or pick any 10 for KSh 1,000

Two things to buy, and only one payment button for either.

**One Learning Path — KSh 500.** Unchanged; all 48 published paths are priced
the same.

**Any 10 for KSh 1,000** at `/bundle`. The buyer chooses which ten, filtered by
category, so the bundle matches their interests rather than being a fixed list.
Ten bought separately would be KSh 5,000.

Prices and the bundle size live in `lib/pricing.ts` so the checkout routes and
the UI cannot drift apart. **`BUNDLE_COURSE_COUNT` is enforced server-side** in
`app/api/payments/bundle/initiate` — the picker makes the rule visible, it does
not enforce it. That route also de-duplicates the posted ids (so ten copies of
one course cannot buy a bundle), re-checks every id is published, and rejects
courses the buyer already owns rather than taking money for nothing.

How a bundle is stored: `payments.kind` is `course` or `bundle`, and
`payments.course_id` is now nullable — a bundle names no single course. Its
chosen ten live in `payment_bundle_courses`, written **before** the redirect to
Paystack, so a crash between paying and finalizing cannot leave a paid bundle
granting nothing. A DB check constraint enforces that a `course` payment has a
course_id and a `bundle` payment does not, so a malformed row cannot be written
at all.

`finalizePayment()` resolves a payment to its course ids through one shared
helper used by both the Paystack and M-Pesa finalizers, then upserts every
enrollment in one call. If it resolves to zero courses it refuses to mark the
payment successful — a `success` row with no enrollment looks fine in reporting
and leaves a paying customer with nothing, which is the worst of both.

Refunds follow: `app/api/admin/payments/[paymentId]/refund` revokes all ten
enrollments for a bundle, not one.

### One payment button

The purchase box has a single **Pay Now** button. Paystack's own checkout page
offers card *and* M-Pesa, so a second in-app payment button would only duplicate
what the gateway already does.

The previous in-app "Pay with M-Pesa" button (Daraja STK push) has been removed
along with the manual till/send-money component. The STK push never worked in
production: all 14 attempts had `checkout_request_id = NULL`, meaning Daraja
rejected the push before Safaricom ever queued it, so no phone ever showed a PIN
prompt. It was showing buyers a failure message on the one screen where failure
costs a sale.

The M-Pesa **API routes** (`/api/payments/mpesa/*`, `/api/payments/mpesa-manual/*`)
are deliberately left in place — they are unreachable from the purchase UI, but
the manual-verification admin flow still needs to settle any historical pending
rows, and keeping them means restoring in-app M-Pesa later is a UI change rather
than a rebuild.

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
