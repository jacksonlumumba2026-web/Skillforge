-- Puts Cybersecurity, Blender, and Web Development back in the catalog.
--
-- 0036 introduced curriculum_status and set these three to 'draft' while
-- their Level rebuilds were partway done. That was the wrong call: the
-- actual problem being fixed was EMPTY "Coming soon" placeholder levels
-- showing on a live sellable page, and 0036 already deleted those. What
-- remains on each course is entirely real content with nothing misleading
-- on it:
--
--   Cybersecurity & Online Safety   2 levels,  7 modules, 46 lessons
--   3D Design & Animation (Blender) 1 level,   3 modules, 19 lessons
--   Web Development for Beginners   1 level,   3 modules, 15 lessons
--
-- All three are at or above the depth of the rest of the catalog (most
-- courses are 12-20 lessons), so hiding them removed sellable, genuinely
-- useful courses for no benefit. Cybersecurity in particular had 46 real
-- lessons — the deepest course on the platform — and disappeared from
-- /courses entirely.
--
-- The rule going forward is simpler and doesn't need a draft flag to
-- enforce it: never create an empty placeholder level. A level row is
-- created only in the same migration that fills it with real modules and
-- lessons, so a published course can only ever show real content, and
-- adding a level later is purely additive.
--
-- curriculum_status stays in the schema (default 'published') for the case
-- it was really meant for: a course genuinely mid-build that shouldn't be
-- sold yet, set deliberately rather than as a side effect of incremental
-- curriculum work.

update public.courses set curriculum_status = 'published'
where id in (
  'bb0d0b5f-ebb4-4888-af6d-35c5915bf453', -- Cybersecurity & Online Safety
  'f0a11b8b-11e0-4af4-999c-ae4c8d3dc0a7', -- 3D Design & Animation (Blender)
  '1ad74fd3-6a25-452c-a4b1-668f8e3be8e6'  -- Web Development for Beginners
);
