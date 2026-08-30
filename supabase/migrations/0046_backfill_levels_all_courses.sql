-- Backfill the Course -> Level -> Module -> Lesson hierarchy across every
-- course that does not have one yet.
--
-- Why this is safe to do mechanically: the flat courses were all built with
-- the same beginner -> professional tier structure, so a course's tiers are
-- fully derivable from its module count plus each module's order_number.
-- There is no per-course special-casing here and no new content -- this
-- migration only creates level rows and re-parents the modules that already
-- exist.
--
-- What this migration does NOT touch, by design:
--   * lessons        (no insert, update, or delete -- every lesson id survives)
--   * enrollments
--   * lesson_progress
-- Two flat courses carry real learner completions (Graphic Design and
-- Google Ads & Facebook Ads, one lesson each). Because modules are re-parented
-- rather than recreated, those completions point at the same lesson ids
-- afterwards and are unaffected.
--
-- Courses that already have levels are skipped entirely, so Web Development,
-- Cybersecurity and Blender are left exactly as they are, and re-running this
-- migration is a no-op.
--
-- A course whose module count is neither 3 nor 6 is deliberately left flat and
-- reported via a notice rather than guessed at. The UI already falls back to a
-- flat module list, so an unconverted course still renders correctly.

do $$
declare
  r record;
  v_modules int;
  v_l1 uuid;
  v_l2 uuid;
  v_l3 uuid;
  v_l4 uuid;
  v_converted int := 0;
  v_skipped int := 0;
begin
  for r in
    select c.id, c.title
      from public.courses c
     where not exists (select 1 from public.levels l where l.course_id = c.id)
     order by c.title
  loop
    select count(*) into v_modules
      from public.modules where course_id = r.id;

    if v_modules = 6 then
      -- m1 intro / m2 hands-on / m3 intermediate / m4 professional /
      -- m5 applied project / m6 freelance & career
      insert into public.levels (course_id, title, description, order_number) values
        (r.id, 'Foundations',
         'Start from zero: what this skill is, the tools you need, and your first hands-on practice.', 1)
        returning id into v_l1;

      insert into public.levels (course_id, title, description, order_number) values
        (r.id, 'Intermediate Skills',
         'Move past the basics into the techniques that separate a beginner from someone genuinely useful.', 2)
        returning id into v_l2;

      insert into public.levels (course_id, title, description, order_number) values
        (r.id, 'Professional Practice',
         'Work the way professionals do, then apply everything to a complete real-world project.', 3)
        returning id into v_l3;

      insert into public.levels (course_id, title, description, order_number) values
        (r.id, 'Freelance & Career',
         'Turn the skill into income: finding clients, pricing your work, and building a career around it.', 4)
        returning id into v_l4;

      update public.modules set level_id = v_l1 where course_id = r.id and order_number in (1, 2);
      update public.modules set level_id = v_l2 where course_id = r.id and order_number = 3;
      update public.modules set level_id = v_l3 where course_id = r.id and order_number in (4, 5);
      update public.modules set level_id = v_l4 where course_id = r.id and order_number = 6;

      v_converted := v_converted + 1;

    elsif v_modules = 3 then
      -- m1 Getting Started / m2 Core Skills in Practice / m3 Working Like a Pro
      insert into public.levels (course_id, title, description, order_number) values
        (r.id, 'Foundations',
         'Start from zero: what this skill is, the tools you need, and how to get set up.', 1)
        returning id into v_l1;

      insert into public.levels (course_id, title, description, order_number) values
        (r.id, 'Core Skills',
         'The hands-on skills that make up the day-to-day of this work.', 2)
        returning id into v_l2;

      insert into public.levels (course_id, title, description, order_number) values
        (r.id, 'Professional Practice',
         'Work the way professionals do, and take on real projects and clients.', 3)
        returning id into v_l3;

      update public.modules set level_id = v_l1 where course_id = r.id and order_number = 1;
      update public.modules set level_id = v_l2 where course_id = r.id and order_number = 2;
      update public.modules set level_id = v_l3 where course_id = r.id and order_number = 3;

      v_converted := v_converted + 1;

    else
      raise notice 'Left flat: % (% modules, expected 3 or 6)', r.title, v_modules;
      v_skipped := v_skipped + 1;
    end if;
  end loop;

  raise notice 'Converted % courses to the level model; left % flat.', v_converted, v_skipped;
end $$;
