-- Free preview lessons: let a visitor watch one real lesson before paying or
-- even creating an account.
--
-- Buyers of a low-cost course reasonably want to check the content is real
-- before handing over money, and until now nothing on the site let them.
--
-- How the gate works, and why this does NOT weaken the paywall:
--   * `lessons` itself is unchanged. Its RLS policy (lessons_select_enrolled,
--     migration 0001) still returns nothing to anyone who is not enrolled, so
--     notes, practice_activity and knowledge_check stay entirely inaccessible.
--   * The public `lesson_previews` view is security_invoker = false, i.e. it
--     runs with definer rights and deliberately exposes only a safe column
--     subset. It gains `youtube_url`, but wrapped in a CASE that emits the URL
--     ONLY where is_free_preview is true. For every other lesson the column is
--     literally NULL in the view -- not filtered in application code, where a
--     future careless query could leak it.
--   * So the flag is the sole gate, and it lives in the database.
--
-- Rich teaching content is intentionally still withheld even for the preview
-- lesson: the visitor gets the real video, which is what they want in order to
-- judge quality, while the notes, practice activity and knowledge check remain
-- part of what they are paying for.

alter table public.lessons
  add column if not exists is_free_preview boolean not null default false;

comment on column public.lessons.is_free_preview is
  'When true, this lesson''s youtube_url is exposed publicly through lesson_previews so visitors can sample the course before paying. Everything else about the lesson stays enrolled-only.';

drop view public.lesson_previews;
create view public.lesson_previews
with (security_invoker = false) as
  select
    id,
    module_id,
    order_number,
    title,
    description,
    duration_seconds,
    learning_objectives,
    is_free_preview,
    case when is_free_preview then youtube_url else null end as youtube_url
  from public.lessons;

-- Flag the first lesson of the first module of every published course.
-- Chosen by lowest module order_number, then lowest lesson order_number, so it
-- is genuinely the first thing a learner would watch. Runs only where a course
-- has no preview yet, so re-running never moves an editor's manual choice.
with first_lesson as (
  select distinct on (m.course_id) l.id
    from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
   where c.published = true
     and not exists (
       select 1
         from public.lessons l2
         join public.modules m2 on m2.id = l2.module_id
        where m2.course_id = m.course_id and l2.is_free_preview
     )
   order by m.course_id, m.order_number, l.order_number
)
update public.lessons
   set is_free_preview = true
 where id in (select id from first_lesson);
