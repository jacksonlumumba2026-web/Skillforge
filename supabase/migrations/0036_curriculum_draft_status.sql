-- Introduces a draft/published distinction for a course's CURRICULUM
-- specifically (separate from `courses.published`, which gates
-- purchasability/visibility for the ~38 courses on the legacy flat
-- module structure and is untouched here).
--
-- Why: a course mid-migration onto the Level model was showing empty
-- placeholder levels ("Level 2 — Coming soon") to real visitors on a live,
-- sellable page. That's misleading for anyone actually buying access. The
-- fix: a course only shows level grouping / is discoverable in the catalog
-- once its curriculum_status is 'published' -- while 'draft', it's hidden
-- from the catalog and sitemap (no new purchases pushed into an
-- incomplete path) but any already-enrolled learner keeps full access to
-- what's already built, since enrollment access never depended on catalog
-- visibility.
--
-- Cybersecurity & Online Safety and 3D Design & Animation (Blender) are
-- marked 'draft' now because only Level 1 of each is real content --
-- exactly the situation this column exists to prevent from looking
-- finished. Every other course defaults to 'published' (unchanged
-- behavior) since none of them have been touched by the Level model yet.

alter table public.courses
  add column curriculum_status text not null default 'published'
    check (curriculum_status in ('draft', 'published'));

update public.courses set curriculum_status = 'draft'
  where id in (
    'bb0d0b5f-ebb4-4888-af6d-35c5915bf453', -- Cybersecurity & Online Safety
    'f0a11b8b-11e0-4af4-999c-ae4c8d3dc0a7'   -- 3D Design & Animation (Blender)
  );

-- Remove the empty placeholder levels (Cybersecurity 2-5, Blender 2-9).
-- All confirmed to have zero modules before this migration was written --
-- deleting them touches no lesson, no enrollment, no progress row.
delete from public.levels
where course_id in (
  'bb0d0b5f-ebb4-4888-af6d-35c5915bf453',
  'f0a11b8b-11e0-4af4-999c-ae4c8d3dc0a7'
)
and id not in (select distinct level_id from public.modules where level_id is not null);
