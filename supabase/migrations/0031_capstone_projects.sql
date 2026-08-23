-- Capstone projects: the fix for "watched 12 videos, clicked complete,
-- didn't actually build anything." Each course can carry one written
-- capstone brief — a real task the learner has to go DO, not watch —
-- and submit proof of (a link to what they made). Deliberately a soft
-- nudge for v1, not a hard content gate: the brief is shown from lesson 1
-- so the learner knows what they're working toward, and the submission
-- status is visible throughout, but lessons stay accessible either way —
-- avoids "why can't I watch what I already paid for" support load while
-- the review/feedback loop doesn't exist yet.

alter table public.courses add column capstone_title text;
alter table public.courses add column capstone_brief text;

create table public.capstone_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  submission_url text not null,
  note text,
  submitted_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.capstone_submissions enable row level security;

create policy capstone_submissions_select_own
  on public.capstone_submissions for select
  using (auth.uid() = user_id);

create policy capstone_submissions_insert_own
  on public.capstone_submissions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid()
        and e.course_id = capstone_submissions.course_id
        and e.status in ('active', 'completed')
    )
  );

create policy capstone_submissions_update_own
  on public.capstone_submissions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
