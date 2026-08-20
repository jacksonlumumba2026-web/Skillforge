# SkillPath Africa

A simple, paid digital-skills learning platform. Structured courses →
modules → lessons, each lesson backed by a YouTube video. Users pay once per
course (Paystack) to unlock it.

Next.js (App Router) + TypeScript + Tailwind CSS, Supabase (auth + Postgres +
RLS), Paystack (payments), plain YouTube embeds. Deploys to Vercel.

Kept deliberately simple: no microservices, no unnecessary abstractions, one
Postgres database, server-enforced access control instead of clever
frontend tricks.

## Status: Phase 2 (Supabase + auth) complete

- [x] **Phase 0** — Project structure, config, DB schema, Supabase clients,
      middleware, stub pages/routes for everything in the plan.
- [ ] **Phase 1** — Homepage, courses grid, course detail + curriculum
      content. *(Not built yet — Phase 2 was requested next; homepage/
      courses pages are still Phase 0 placeholders.)*
- [x] **Phase 2** — Live Supabase project, full schema, email/password
      auth (register/login/logout), profiles auto-created on signup,
      protected `/dashboard`, RLS on every table.
- [ ] **Phase 3** — Lesson player, progress tracking UI.
- [ ] **Phase 4** — Paystack payment + webhook + course access.
- [ ] **Phase 5** — Admin dashboard (create/edit/delete courses, modules,
      lessons).

**Live Supabase project:** `skillpath-africa` (`xzncootldgqhghokxcrd`,
`us-east-1`) — migrations `0001`–`0003` applied.

## File structure

```
app/
  page.tsx                              Home (Phase 1 placeholder)
  courses/
    page.tsx                            Course grid (Phase 1 placeholder)
    [courseId]/page.tsx                 Course detail (Phase 1 placeholder)
  learn/[courseId]/[lessonId]/page.tsx  Lesson player (Phase 3 placeholder)
  login/page.tsx                        Real — email/password login
  register/page.tsx                     Real — full name/email/password
  dashboard/page.tsx                    Real — welcome, enrolled courses, progress
  admin/                                Phase 5 placeholders
  api/
    payments/initiate/route.ts          Phase 4 (stub, 501)
    payments/webhook/route.ts           Phase 4 (stub, 501)
    progress/complete-lesson/route.ts   Phase 3 (stub, 501)
components/
  Navbar.tsx                            Real — auth-aware nav
  Footer.tsx, LogoutButton.tsx          Real
lib/
  types.ts                              Hand-written DB types
  supabase/{client,server,admin}.ts     Browser / server / service-role clients
  paystack.ts                           (Phase 4)
supabase/migrations/
  0001_init.sql                         Schema + RLS
  0002_seed_courses.sql                 Sample courses + full "Web
                                         Development for Beginners" course
  0003_harden_function_search_path.sql  Security advisor fix
middleware.ts                           Session refresh + route protection
```

## Data model

```
profiles.user_id → auth.users
courses → modules → lessons
users → enrollments → courses   (status: active | completed — created only
                                  after a verified payment; Phase 4)
users → lesson_progress → lessons
users → payments → courses      (table exists; Paystack logic is Phase 4)
```

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

**Test enrollments**: Phase 4 will create these automatically after a real
Paystack payment. Until then, insert one manually to test the dashboard/
lesson-gating flow:

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

Supabase URL/anon key are for the live project above. You still need to add
your own `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API — not exposed
by tooling, get it yourself) for any Phase 3/4 server-side work; it's not
required for Phase 2 (register/login/logout/dashboard all work with just
the anon key). Paystack keys are for Phase 4.

## Explicitly out of scope for v1

- AI course generator (auto-creating modules/lessons/quizzes from a topic).
  The schema is already shaped to support it later — course/module/lesson
  are separate tables an admin (or eventually an AI) fills in the same way.
- Automatic YouTube video search/selection — admins paste URLs manually.
- Quizzes.
