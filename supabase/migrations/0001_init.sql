-- SkillPath Africa core schema.
-- courses -> modules -> lessons (content, admin-managed)
-- users -> enrollments -> courses (paid access)
-- users -> lesson_progress -> lessons (progress tracking)
-- users -> payments -> courses (Paystack payment records)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: 1:1 extension of auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper used by RLS policies elsewhere. To make your own account an admin
-- after signing up, run: update public.profiles set is_admin = true where email = 'you@example.com';
create function public.is_admin(uid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  price_kes numeric(10, 2) not null default 0,
  is_published boolean not null default false,
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
  order_index int not null,
  created_at timestamptz not null default now(),
  unique (course_id, order_index)
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
  order_index int not null,
  created_at timestamptz not null default now(),
  unique (module_id, order_index)
);

-- Public curriculum preview: title + order only, no video/description.
-- Lets a visitor see the course outline before paying, without exposing
-- gated lesson content through the same row.
create view public.lesson_previews
with (security_invoker = false) as
  select id, module_id, order_index, title
  from public.lessons;

-- ---------------------------------------------------------------------------
-- enrollments: created only after a verified payment (or by an admin)
-- ---------------------------------------------------------------------------
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
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
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- ---------------------------------------------------------------------------
-- payments: one row per Paystack transaction attempt
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  reference text not null unique,
  amount numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create index modules_course_id_idx on public.modules (course_id, order_index);
create index lessons_module_id_idx on public.lessons (module_id, order_index);
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

-- profiles: read/update own row; admins can read all (needed for admin UI)
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- courses: published courses are public; admins see and manage everything
create policy "courses_select_published_or_admin" on public.courses
  for select using (is_published = true or public.is_admin(auth.uid()));
create policy "courses_admin_write" on public.courses
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- modules: visible when the parent course is visible; admins manage
create policy "modules_select_with_course" on public.modules
  for select using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.courses c where c.id = course_id and c.is_published)
  );
create policy "modules_admin_write" on public.modules
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- lessons: full row (incl. youtube_url) only for enrolled users or admins.
-- Everyone else sees just the curriculum outline via lesson_previews above.
create policy "lessons_select_enrolled_or_admin" on public.lessons
  for select using (
    public.is_admin(auth.uid())
    or exists (
      select 1
      from public.modules m
      join public.enrollments e on e.course_id = m.course_id
      where m.id = module_id and e.user_id = auth.uid()
    )
  );
create policy "lessons_admin_write" on public.lessons
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- enrollments: users read their own; created server-side (service role)
-- after a verified Paystack payment, or by an admin.
create policy "enrollments_select_own_or_admin" on public.enrollments
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "enrollments_admin_write" on public.enrollments
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

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
      where l.id = lesson_id and e.user_id = auth.uid()
    )
  );

-- payments: users read their own payment history; all writes are
-- server-side (service role) from the payment-initiate route and the
-- Paystack webhook, which verify amount/status before touching this table.
create policy "payments_select_own_or_admin" on public.payments
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
