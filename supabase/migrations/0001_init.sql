-- SkillPath Africa core schema (Phase 2).
-- courses -> modules -> lessons (content, admin-managed — admin RLS comes in Phase 5)
-- users -> enrollments -> courses (paid access — Paystack wiring comes in Phase 4)
-- users -> lesson_progress -> lessons (progress tracking)
-- users -> payments -> courses (table exists now; Paystack logic comes in Phase 4)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user is created.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger-side guard: no matter what a client sends in an UPDATE, a
-- non-service-role caller can never change their own role or re-point
-- user_id. Simpler and more reliable than trying to express "old vs new"
-- comparisons inside an RLS WITH CHECK clause.
create function public.protect_profile_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    new.role := old.role;
    new.user_id := old.user_id;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_identity
  before update on public.profiles
  for each row execute procedure public.protect_profile_identity();

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  price numeric(10, 2) not null default 0,
  thumbnail_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- modules
-- ---------------------------------------------------------------------------
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text not null default '',
  order_number int not null,
  created_at timestamptz not null default now(),
  unique (course_id, order_number)
);

-- ---------------------------------------------------------------------------
-- lessons
-- ---------------------------------------------------------------------------
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  description text not null default '',
  youtube_url text not null default '',
  order_number int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, order_number)
);

-- Public curriculum preview: title + order only, no video/description.
-- Lets a visitor see the course outline before paying, without exposing
-- gated lesson content through the same row. Supabase's linter flags any
-- SECURITY DEFINER view as an ERROR-level finding on general principle —
-- this one is intentional and scoped to exactly 4 non-sensitive columns,
-- which is the whole mechanism behind "visible but locked" lessons.
create view public.lesson_previews
with (security_invoker = false) as
  select id, module_id, order_number, title
  from public.lessons;

-- ---------------------------------------------------------------------------
-- enrollments
-- No self-serve INSERT policy in this phase — Phase 4 creates these
-- server-side (service role) after a verified Paystack payment. For
-- development/testing, insert a row manually via the Supabase SQL editor
-- or service-role client:
--   insert into public.enrollments (user_id, course_id, status)
--   values ('<auth.users.id>', '<courses.id>', 'active');
-- ---------------------------------------------------------------------------
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ---------------------------------------------------------------------------
-- lesson_progress
-- ---------------------------------------------------------------------------
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed boolean not null default true,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- ---------------------------------------------------------------------------
-- payments — table only in this phase, no Paystack logic yet (Phase 4)
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  reference text not null unique,
  amount numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create index modules_course_id_idx on public.modules (course_id, order_number);
create index lessons_module_id_idx on public.lessons (module_id, order_number);
create index enrollments_user_id_idx on public.enrollments (user_id);
create index lesson_progress_user_id_idx on public.lesson_progress (user_id);
create index payments_user_id_idx on public.payments (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.payments enable row level security;

-- profiles: read/update own row only. role and user_id are further
-- protected by the profiles_protect_identity trigger above, so even an
-- update statement that includes role can't actually change it.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id);

-- courses: published courses are public. No write policies for
-- students/anon — admin write access is Phase 5's job; for now course
-- rows are managed directly (service role / SQL).
create policy "courses_select_published" on public.courses
  for select using (published = true);

-- modules: visible when the parent course is published.
create policy "modules_select_with_published_course" on public.modules
  for select using (
    exists (select 1 from public.courses c where c.id = course_id and c.published)
  );

-- lessons: full row (incl. youtube_url) only for users enrolled in the
-- parent course. Everyone else sees just the curriculum outline via the
-- lesson_previews view above.
create policy "lessons_select_enrolled" on public.lessons
  for select using (
    exists (
      select 1
      from public.modules m
      join public.enrollments e on e.course_id = m.course_id
      where m.id = module_id and e.user_id = auth.uid() and e.status in ('active', 'completed')
    )
  );

-- enrollments: users read only their own. No insert/update policy yet —
-- see the comment on the table above.
create policy "enrollments_select_own" on public.enrollments
  for select using (auth.uid() = user_id);

-- lesson_progress: users manage their own, only for lessons in a course
-- they're enrolled in.
create policy "lesson_progress_select_own" on public.lesson_progress
  for select using (auth.uid() = user_id);
create policy "lesson_progress_insert_own_enrolled" on public.lesson_progress
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.enrollments e on e.course_id = m.course_id
      where l.id = lesson_id and e.user_id = auth.uid() and e.status in ('active', 'completed')
    )
  );
create policy "lesson_progress_update_own" on public.lesson_progress
  for update using (auth.uid() = user_id);

-- payments: users read only their own. No write policy — Phase 4's
-- payment-initiate route and Paystack webhook write via service role.
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);
