-- The "Vibe coding" course (slug: vibe-coding) was created manually through
-- /admin/courses/new and published with a title/description but no modules
-- or lessons were ever added — a paying learner (and the site owner, who
-- bought it via a real Paystack test payment) landed on a course with 0
-- lessons. This backfills real curriculum content, same pattern as
-- 0006_curated_catalog.sql: 3 modules, 6 lessons, real YouTube tutorials.

update public.courses set description =
  'Learn "vibe coding" — building real websites and apps by describing what you want in plain English to AI tools instead of writing every line yourself. You''ll get a grounding in what vibe coding is and isn''t, hands-on practice with an AI code editor (Cursor), and hands-on practice with no-code AI app builders (Lovable, Bolt.new). By the end you''ll be able to go from an idea to a working site or app using AI as your build partner.'
  where slug = 'vibe-coding';

do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'vibe-coding';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'What Vibe Coding Actually Is', 'The core idea, the mindset shift from writing code to directing an AI, and what it can and can''t do for you yet.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Vibe Coding with an AI Code Editor', 'Hands-on with Cursor, the most popular AI-native code editor for vibe coding real projects.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'No-Code AI App Builders', 'Going from a plain-English idea to a working, deployed site or app using Lovable and Bolt.new.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'The Ultimate Beginner''s Guide to Vibe Coding', 'A complete-beginner walkthrough of what vibe coding means, the tools people use, and how to get started with zero prior coding experience.', 'https://www.youtube.com/watch?v=-VuZmoc-Sq8', 1),
    (v_m1, 'Vibe Coding Fundamentals In 33 Minutes', 'A fast, focused rundown of the fundamentals — the workflow of prompting, reviewing, and iterating with AI instead of hand-writing every line.', 'https://www.youtube.com/watch?v=iLCDSY2XX7E', 2),
    (v_m2, 'Cursor Tutorial for Beginners (AI Code Editor)', 'A full walkthrough of Cursor''s interface and core AI features for anyone starting from zero.', 'https://www.youtube.com/watch?v=ocMOZpuAMw4', 1),
    (v_m2, 'How To Use Cursor AI (Full Tutorial For Beginners)', 'A complete beginner tutorial covering setup and using Cursor''s AI chat and autocomplete to build real features.', 'https://www.youtube.com/watch?v=cE84Q5IRR6U', 2),
    (v_m3, 'Lovable AI Website Builder — Full Tutorial for Beginners', 'A start-to-finish walkthrough of building a real website in Lovable by describing it in plain English.', 'https://www.youtube.com/watch?v=UtVMsvu4JfU', 1),
    (v_m3, 'The Ultimate Guide to Bolt.new — Build Apps with AI', 'A step-by-step guide to building and shipping a working app in Bolt.new using natural-language prompts.', 'https://www.youtube.com/watch?v=0_Ij8FEvY4U', 2)
  on conflict (module_id, order_number) do nothing;
end $$;
