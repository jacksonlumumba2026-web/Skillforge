-- Daily study reminders: a learner picks a time (default 5pm), and if
-- they haven't completed a lesson yet that day by then, a web push
-- notification nudges them. push_subscriptions holds the browser's Web
-- Push endpoint/keys (one row per device/browser); study_reminders holds
-- the per-user schedule. Both are plain own-row RLS, same shape as
-- lesson_progress — no admin client needed for any of this.

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy push_subscriptions_select_own on public.push_subscriptions
  for select using (auth.uid() = user_id);
create policy push_subscriptions_insert_own on public.push_subscriptions
  for insert with check (auth.uid() = user_id);
create policy push_subscriptions_delete_own on public.push_subscriptions
  for delete using (auth.uid() = user_id);

create table public.study_reminders (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reminder_time time not null default '17:00',
  -- Fixed offset is enough for now (Kenya doesn't observe DST) — a real
  -- IANA timezone column would need proper tz-conversion logic in the
  -- cron job, not worth it while every user is in the same one.
  utc_offset_minutes int not null default 180,
  enabled boolean not null default true,
  -- Sending a notification sets this to today's date (in the user's
  -- offset), so the cron job never double-sends within the same day even
  -- if it runs again before midnight.
  last_sent_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.study_reminders enable row level security;

create policy study_reminders_select_own on public.study_reminders
  for select using (auth.uid() = user_id);
create policy study_reminders_upsert_own on public.study_reminders
  for insert with check (auth.uid() = user_id);
create policy study_reminders_update_own on public.study_reminders
  for update using (auth.uid() = user_id);
