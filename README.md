# SkillPath Africa

A simple, paid digital-skills learning platform. Structured courses →
modules → lessons, each lesson backed by a YouTube video. Users pay once per
course (Paystack) to unlock it.

Next.js (App Router) + TypeScript + Tailwind CSS, Supabase (auth + Postgres +
RLS), Paystack (payments), plain YouTube embeds. Deploys to Vercel.

Kept deliberately simple: no microservices, no unnecessary abstractions, one
Postgres database, server-enforced access control instead of clever
frontend tricks.

## Status: Phase 1, 2, 3, 4 + AI course generator + curated catalog complete

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
      it, for future admin visibility.
- [x] **Curated catalog** — 10 real, hand-researched courses (not
      placeholders): Freelancing, Web Development for Beginners, Graphic
      Design, Digital Marketing, AI Tools for Everyday Work, Video Editing,
      Social Media Management, Virtual Assistance & Data Entry, Copywriting
      & Content Writing, Excel & Spreadsheets for Work. Each has 3 modules
      of 2 lessons, backed by real YouTube tutorials from established
      channels (`0006_curated_catalog.sql`). Written once by hand instead
      of spending Anthropic/YouTube API calls on topics already known to be
      wanted — the AI generator is reserved for topics outside this set.
      `courses.display_order` controls the deliberate ordering on
      `/courses` so it alternates between quick-win/business, creative, and
      technical skills instead of reading as a wall of similar courses.
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
- [ ] **Phase 5** — Admin dashboard (create/edit/delete courses, modules,
      lessons).

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
  admin/                                Phase 5 placeholders
  api/
    payments/initiate/route.ts          Real — starts a Paystack transaction
    payments/webhook/route.ts           Real — signature-verified, finalizes payment
    payments/callback/route.ts          Real — browser redirect back from checkout
    progress/complete-lesson/route.ts   Real — upserts lesson_progress
    courses/generate/route.ts           Real — AI course generator endpoint (auth + zod)
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
  payments.ts                           Real — finalizePayment(): verify + mark success + enroll
supabase/migrations/
  0001_init.sql                         Schema + RLS
  0002_seed_courses.sql                 Sample courses + full "Web
                                         Development for Beginners" course
  0003_harden_function_search_path.sql  Security advisor fix
  0004_ai_course_generation.sql         courses.generated_by column
  0005_course_display_order.sql         courses.display_order column
  0006_curated_catalog.sql              10-course curated catalog content
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

`role` on `profiles` (`student` | `admin`) will gate the admin dashboard in
Phase 5. It's protected against self-escalation right now by a trigger
(`protect_profile_identity`) that silently reverts `role`/`user_id` changes
from any caller that isn't the service role — simpler and more reliable
than trying to express "old vs new" inside an RLS `WITH CHECK` clause.
There's no admin promotion UI yet; do it directly in SQL:

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
