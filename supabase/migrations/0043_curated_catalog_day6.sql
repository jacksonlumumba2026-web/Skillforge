-- Curated catalog day 6. ONE course, not ten.
--
-- Six topics were researched, one agent each. Only Motion Graphics cleared
-- the verification bar (both title AND uploading channel confirmed by two
-- independent searches). The other five are recorded as dropped:
--   Google Analytics 4       2 of 6 confirmed, 3 unresolved (2nd attempt)
--   Grant & Proposal Writing 3 of 6 confirmed, 2 unresolved (2nd attempt,
--                            up from 0 of 6 — real progress, still short)
--   Creating & Selling Digital Products  1 unresolved, plus a bilingual
--                            channel whose video language was unconfirmed
--                            and an income-claim title (2nd attempt)
--   Notion for Work & Business  4 of 6 confirmed, 2 unresolved
--   Proofreading & Editing   3 of 6 confirmed, Module 3 entirely unresolved
--
-- Every one of those is a genuinely good topic. The blocker is not topic
-- supply — it's that WebFetch to youtube.com is blocked by this
-- environment's egress proxy, so a video's channel can never be read
-- directly off its page and confirmation stays circumstantial. Four
-- separate agents hit that same wall and exhausted their search budgets.
--
-- Motion Graphics succeeded precisely because Adobe puts the channel name
-- INSIDE the video title ("| Adobe Creative Cloud", "| Adobe Video"), which
-- makes attribution self-evident from the title string alone. That is the
-- pattern to look for.
--
-- Lesson 6 was rescoped: no export/social-delivery video had a confirmable
-- channel, but Adobe Video's render-speed video did, so the lesson teaches
-- what that video actually covers rather than what was originally planned.

insert into public.courses (slug, title, description, level, price, published, display_order, category) values
  ('motion-graphics-after-effects', 'Motion Graphics with After Effects', 'Learn Adobe After Effects from first launch to a finished animated piece. By the end you''ll be able to navigate the workspace, animate with keyframes, animate text and shape layers, build a short animated logo or title sequence, and keep your render times under control. No prior After Effects experience assumed.', 'beginner', 500, true, 470, 'design-creative')
on conflict (slug) do nothing;

do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'motion-graphics-after-effects';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'Find your way around After Effects and learn the keyframe, the unit every animation is built from.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Animate the two things motion graphics are mostly made of — text and shapes.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Put it together into a finished logo animation, and stop waiting so long for renders.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Get to Know After Effects', 'A guided tour of the workspace — panels, the timeline, importing footage, and organising a project.', 'https://www.youtube.com/watch?v=BVVAzsELj40', 1),
    (v_m1, 'Keyframe Animation Basics', 'Setting and editing keyframes, and adjusting interpolation so motion looks intentional rather than robotic.', 'https://www.youtube.com/watch?v=sYlzk7rfn0w', 2),
    (v_m2, 'Animating Text: The Write-On Effect', 'Build a dynamic title by animating text onto the screen with a write-on reveal.', 'https://www.youtube.com/watch?v=ETitVEP9Yac', 1),
    (v_m2, 'Shape Layers and Motion Graphics', 'Create and animate shape layers — the core building block of almost all motion graphics work.', 'https://www.youtube.com/watch?v=RVidT-GuMbk', 2),
    (v_m3, 'Animating a Logo and Title Sequence', 'A follow-along lab with motion designer Eran Stern, animating a company logo end to end.', 'https://www.youtube.com/watch?v=v4-f2-zdVqs', 1),
    (v_m3, 'Speeding Up Your Renders', 'Practical techniques for cutting render times — the difference between a workable workflow and a painful one.', 'https://www.youtube.com/watch?v=G8BAjmaVaDg', 2);
end $$;
