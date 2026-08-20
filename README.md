# SkillPath Africa

A simple, paid digital-skills learning platform. Structured courses →
modules → lessons, each lesson backed by a YouTube video. Users pay once per
course (Paystack) to unlock it.

Next.js (App Router) + TypeScript + Tailwind CSS, Supabase (auth + Postgres +
RLS), Paystack (payments), plain YouTube embeds. Deploys to Vercel.

Kept deliberately simple: no microservices, no unnecessary abstractions, one
Postgres database, server-enforced access control instead of clever
frontend tricks.

## Status: Phase 0 (project structure) complete

Everything below exists as real files and routes — `npm run build` passes —
but most pages are placeholders. Nothing beyond scaffolding has been built
yet; each phase below is a separate, reviewable step.

- [x] **Phase 0** — Project structure, config, DB schema, Supabase clients,
      middleware, stub pages/routes for everything in the plan.
- [ ] **Phase 1** — Homepage, courses grid, course detail + curriculum.
- [ ] **Phase 2** — Supabase auth (login/register), live database.
- [ ] **Phase 3** — Student dashboard, lesson player, progress tracking.
- [ ] **Phase 4** — Paystack payment + webhook + course access.
- [ ] **Phase 5** — Admin dashboard (create/edit/delete courses, modules,
      lessons).

## File structure

```
app/
  page.tsx                              Home
  courses/
    page.tsx                            Course grid
    [courseId]/page.tsx                 Course detail + curriculum
  learn/[courseId]/[lessonId]/page.tsx  Lesson player (video + progress)
  login/page.tsx
  register/page.tsx
  dashboard/page.tsx                    Student dashboard
  admin/
    page.tsx                            Course list (admin)
    courses/new/page.tsx                Create course
    courses/[courseId]/page.tsx         Edit course + modules/lessons
  api/
    payments/initiate/route.ts          Start a Paystack transaction
    payments/webhook/route.ts           Verify payment, create enrollment
    progress/complete-lesson/route.ts   Mark a lesson complete
components/
  Navbar.tsx, Footer.tsx, LogoutButton.tsx
lib/
  types.ts                              Hand-written DB types
  supabase/{client,server,admin}.ts     Browser / server / service-role clients
  paystack.ts                           (Phase 4)
supabase/migrations/
  0001_init.sql                         Schema + RLS
  0002_seed_courses.sql                 Sample courses + full "Web
                                         Development for Beginners" course
middleware.ts                           Session refresh + route protection
```

## Data model

```
courses → modules → lessons
users → enrollments → courses        (created only after a verified payment)
users → lesson_progress → lessons
users → payments → courses
```

**Access control is enforced in Postgres (RLS), not just hidden in the UI.**
A lesson's real content (`youtube_url`, `description`) is only readable via
`select` if the requesting user is enrolled in that lesson's course, or is an
admin — see the `lessons_select_enrolled_or_admin` policy in
`0001_init.sql`. So the course curriculum can still be shown to a visitor
who hasn't paid (via the public `lesson_previews` view — title and order
only), while the actual video stays locked at the database level, not just
behind a UI lock icon.

Enrollments are only ever created server-side, by the Paystack webhook after
it verifies a payment, using the Supabase service-role key (Phase 4). The
frontend reporting "payment succeeded" is never trusted on its own.

`is_admin` on `profiles` gates the admin dashboard and all course/module/
lesson writes. There's no signup flow for admins — promote your own account
after registering:

```sql
update public.profiles set is_admin = true where email = 'you@example.com';
```

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Paystack keys (Phase 2/4)
npm run dev
```

Supabase project setup, migrations, and Paystack account setup happen in
Phase 2 and Phase 4 respectively — not needed yet to review Phase 0/1.

## Explicitly out of scope for v1

- AI course generator (auto-creating modules/lessons/quizzes from a topic).
  The schema is already shaped to support it later — course/module/lesson
  are separate tables an admin (or eventually an AI) fills in the same way.
- Automatic YouTube video search/selection — admins paste URLs manually.
- Quizzes.
