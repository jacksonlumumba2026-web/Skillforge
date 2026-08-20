-- Two additions so learners understand what they're about to watch, both
-- before and during a lesson:
--
-- 1. duration_seconds on lessons — nullable, populated for new AI-generated
--    lessons (the curation step already knows the video length) and
--    backfillable for existing ones later. Never fabricated: UI only shows
--    a duration when this is set.
-- 2. lesson_previews now also exposes `description` and `duration_seconds`.
--    These are short marketing-style teasers ("what you'll learn"), not the
--    lesson's actual paid content (the video), so surfacing them publicly
--    is safe and standard for a course curriculum preview — the same
--    tradeoff every course marketplace makes. The real gated value stays
--    exactly as gated as before: youtube_url is still only readable via
--    the enrolled-only `lessons` table.

alter table public.lessons
  add column duration_seconds integer;

drop view public.lesson_previews;
create view public.lesson_previews
with (security_invoker = false) as
  select id, module_id, order_number, title, description, duration_seconds
  from public.lessons;
