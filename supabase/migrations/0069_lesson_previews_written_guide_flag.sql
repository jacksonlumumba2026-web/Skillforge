-- Adds a public depth signal to lesson_previews.
--
-- 438 of the catalogue's lessons are still a title plus a video: no notes,
-- no practice activity, no knowledge check. The course page was telling
-- every visitor that lessons "come with written notes, a practice task and
-- a knowledge check", which is true of about a third of them. That is an
-- overclaim on a page that takes money, and the refund policy says all
-- sales are final -- a bad combination.
--
-- Rather than hide the gap, expose it honestly so a buyer can see what a
-- given Learning Path actually contains before paying. This flag leaks no
-- content: it is a boolean derived from whether the three teaching fields
-- are present, and the fields themselves stay enrolled-only behind RLS.
--
-- The view is security_invoker = false on purpose (see 0050) so anonymous
-- visitors can count lessons at all.

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
    case when is_free_preview then youtube_url else null end as youtube_url,
    (
      notes is not null
      and practice_activity is not null
      and knowledge_check is not null
    ) as has_written_guide
  from public.lessons;

comment on view public.lesson_previews is
  'Public, RLS-free projection of lessons for browsing. youtube_url is exposed only for free-preview lessons. has_written_guide reports whether a lesson carries notes, a practice activity and a knowledge check, so the catalogue can state depth honestly without exposing the teaching content itself.';
