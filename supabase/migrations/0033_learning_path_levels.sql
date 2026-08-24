-- Curriculum model upgrade: Course -> Level -> Module -> Lesson (was just
-- Course -> Module -> Lesson). "Level" groups modules into a progression
-- tier (Foundations, Core Skills, ...) within one course. Nullable/optional
-- throughout on purpose — the ~40 existing courses keep working exactly as
-- they render today (flat module list, no level headers) until a course
-- is deliberately migrated onto the new model by giving its modules a
-- level_id. This is the schema half of that upgrade; UI + the first real
-- course (Cybersecurity Level 1) follow in later migrations/commits.

create table public.levels (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  order_number int not null,
  created_at timestamptz not null default now(),
  unique (course_id, order_number)
);

create index levels_course_id_idx on public.levels (course_id, order_number);

alter table public.levels enable row level security;

-- Same "visible when the parent course is published" shape as modules.
create policy "levels_select_with_published_course" on public.levels
  for select using (
    exists (select 1 from public.courses c where c.id = course_id and c.published)
  );

alter table public.modules add column level_id uuid references public.levels(id) on delete cascade;
create index modules_level_id_idx on public.modules (level_id);

-- Lesson content richness — a lesson is no longer just "title + video".
-- All nullable: existing lessons across the catalog stay valid with these
-- unset, and the UI only renders a section when it has real content.
alter table public.lessons add column learning_objectives text[];
alter table public.lessons add column notes text;
alter table public.lessons add column practice_activity text;
-- One row per knowledge-check question: [{ "question": "...", "options": ["...","...","...","..."], "correct_index": 0 }, ...]
alter table public.lessons add column knowledge_check jsonb;

-- learning_objectives is safe to preview (a short "what you'll learn"
-- teaser, same reasoning as description/duration_seconds already being
-- public) — notes/practice_activity/knowledge_check stay gated behind the
-- enrolled-only `lessons` table, same as youtube_url.
drop view public.lesson_previews;
create view public.lesson_previews
with (security_invoker = false) as
  select id, module_id, order_number, title, description, duration_seconds, learning_objectives
  from public.lessons;
