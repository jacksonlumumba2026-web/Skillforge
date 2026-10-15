-- Two changes to the public lesson_previews view.
--
-- 1. CLOSE A WRITE HOLE. The view was granted INSERT, UPDATE and DELETE to
--    anon and authenticated (Supabase's default grants on anything created in
--    public). It is a simple single-table view, so Postgres makes it
--    auto-updatable, and it runs as its owner (security_invoker = false). The
--    owner is postgres, which owns `lessons` and bypasses RLS. Put together:
--    anyone holding the public anon key — which ships in every browser —
--    could PATCH or DELETE /rest/v1/lesson_previews and the write would land
--    on `lessons` with RLS never consulted. Flipping is_free_preview to true
--    on every row would have exposed every paid video through this same view.
--
--    Checked before fixing: still exactly 48 previews (at most one per
--    course), all 735 lessons present, no lesson modified since 2026-09-17.
--    No sign it was ever used.
--
--    The view is read-only by intent, so it keeps SELECT and loses the rest.
--
-- 2. FREE PREVIEW NOW NEEDS A FREE ACCOUNT. youtube_url is emitted for the
--    free-preview lesson only to a signed-in caller. auth.uid() reads the
--    request's JWT claims, which PostgREST sets regardless of the view's
--    security mode, so it is null for anon and for the service role. Nothing
--    server-side reads youtube_url through this view with the service role
--    (the admin page selects id and module_id only), so nothing loses data.
--
--    Every other column stays public: the course page still shows the full
--    syllabus — titles, descriptions, objectives, durations — to anyone.

create or replace view public.lesson_previews
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
  case
    when is_free_preview and auth.uid() is not null then youtube_url
    else null::text
  end as youtube_url,
  notes is not null and practice_activity is not null and knowledge_check is not null as has_written_guide
from public.lessons;

revoke insert, update, delete, truncate, references, trigger
  on public.lesson_previews from anon, authenticated;
