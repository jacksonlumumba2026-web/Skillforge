-- Course ratings/reviews — social proof for buyers, feedback for admins.
-- Publicly readable (same reasoning as lesson_previews: this is what helps
-- a visitor decide whether to buy), but only an enrolled learner can write
-- their own review, same enforcement pattern as lesson_progress.
create table public.course_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index course_reviews_course_id_idx on public.course_reviews (course_id);

alter table public.course_reviews enable row level security;

create policy "course_reviews_select_public" on public.course_reviews
  for select using (true);

create policy "course_reviews_insert_own_enrolled" on public.course_reviews
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.enrollments e
      where e.course_id = course_reviews.course_id
        and e.user_id = auth.uid()
        and e.status in ('active', 'completed')
    )
  );

create policy "course_reviews_update_own" on public.course_reviews
  for update using (auth.uid() = user_id);

create policy "course_reviews_delete_own" on public.course_reviews
  for delete using (auth.uid() = user_id);
