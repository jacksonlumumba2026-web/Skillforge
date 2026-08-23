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
      (`trig_01XLqpWy1SvSGEFaiTqEhPrC`, 6 days total). Day 1
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
      Animation (Blender). Backed by real YouTube tutorials from established
      channels. Written by hand instead of spending Anthropic/YouTube API
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

**Live Supabase project:** `skillpath-africa` (`xzncootldgqhghokxcrd`,
`us-east-1`) — migrations `0001`–`0006` applied.

**AI generation credentials are live:** `YOUTUBE_API_KEY`,
`ANTHROPIC_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are all set (locally
in `.env.local`, and in Vercel for production), so `/courses/request`
works end to end for topics outside the curated 10.

**Still needed to actually run payments:** `PAYSTACK_SECRET_KEY` (test or
live) in `.env.local` and Vercel. Once it's set, add
`https://<your-domain>/api/payments/webhook` as the webhook URL in the
Paystack dashboard (Settings → API Keys & Webhooks) — that's a one-time
manual step in Paystack's dashboard, nothing to configure in this repo.

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
