-- SkillForge core schema
-- Run against a Supabase project via `supabase db push` or the SQL editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: 1:1 extension of auth.users
-- ---------------------------------------------------------------------------
create type subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  trial_ends_at timestamptz,
  subscription_status subscription_status,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user is created.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper: does this user currently have paid/trial access to path content?
create function public.has_active_access(uid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce(
    (
      select subscription_status in ('trialing', 'active')
      from public.profiles
      where id = uid
    ),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- skills: the fixed catalog of learnable skills (small hand-picked set)
-- ---------------------------------------------------------------------------
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null,
  icon text not null default '✨',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- learning_paths: generated + cached per skill+level combination
-- ---------------------------------------------------------------------------
create type skill_level as enum ('beginner', 'intermediate', 'advanced');

create table public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills (id) on delete cascade,
  level skill_level not null,
  title text not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (skill_id, level)
);

-- ---------------------------------------------------------------------------
-- path_steps: ordered steps within a learning path
-- ---------------------------------------------------------------------------
create table public.path_steps (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  order_index int not null,
  title text not null,
  youtube_video_id text not null,
  video_title text not null default '',
  video_channel text not null default '',
  video_duration_seconds int,
  summary text not null default '',
  checklist jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (path_id, order_index)
);

-- ---------------------------------------------------------------------------
-- user_paths: a user's enrollment in a learning path
-- ---------------------------------------------------------------------------
create table public.user_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  started_at timestamptz not null default now(),
  current_step int not null default 0,
  completed_at timestamptz,
  last_activity_at timestamptz not null default now(),
  streak_count int not null default 0,
  unique (user_id, path_id)
);

-- ---------------------------------------------------------------------------
-- step_progress: per-step completion record
-- ---------------------------------------------------------------------------
create table public.step_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  step_id uuid not null references public.path_steps (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, step_id)
);

-- ---------------------------------------------------------------------------
-- certificates: issued on path completion
-- ---------------------------------------------------------------------------
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  issued_at timestamptz not null default now(),
  certificate_url text,
  unique (user_id, path_id)
);

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create index path_steps_path_id_idx on public.path_steps (path_id, order_index);
create index user_paths_user_id_idx on public.user_paths (user_id);
create index step_progress_user_id_idx on public.step_progress (user_id);
create index step_progress_step_id_idx on public.step_progress (step_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.learning_paths enable row level security;
alter table public.path_steps enable row level security;
alter table public.user_paths enable row level security;
alter table public.step_progress enable row level security;
alter table public.certificates enable row level security;

-- profiles: users can read/update only their own row
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- skills: readable by any authenticated user
create policy "skills_select_authenticated" on public.skills
  for select to authenticated using (true);

-- learning_paths: readable by any authenticated user (metadata only, not gated)
create policy "learning_paths_select_authenticated" on public.learning_paths
  for select to authenticated using (true);

-- path_steps: gated behind an active trial/subscription
create policy "path_steps_select_with_access" on public.path_steps
  for select to authenticated using (public.has_active_access(auth.uid()));

-- user_paths: users manage only their own enrollments
create policy "user_paths_select_own" on public.user_paths
  for select using (auth.uid() = user_id);
create policy "user_paths_insert_own" on public.user_paths
  for insert with check (auth.uid() = user_id);
create policy "user_paths_update_own" on public.user_paths
  for update using (auth.uid() = user_id);

-- step_progress: users manage only their own progress
create policy "step_progress_select_own" on public.step_progress
  for select using (auth.uid() = user_id);
create policy "step_progress_insert_own" on public.step_progress
  for insert with check (auth.uid() = user_id);
create policy "step_progress_delete_own" on public.step_progress
  for delete using (auth.uid() = user_id);

-- certificates: users can read and self-issue only their own certificates
-- (issuance is still gated server-side on actually completing every step)
create policy "certificates_select_own" on public.certificates
  for select using (auth.uid() = user_id);
create policy "certificates_insert_own" on public.certificates
  for insert with check (auth.uid() = user_id);

-- Writes to learning_paths / path_steps / certificates happen from server-side
-- API routes using the Supabase service role key, which bypasses RLS.
