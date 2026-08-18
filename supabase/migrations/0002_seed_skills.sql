-- Seed the initial hand-picked skill catalog (matches marketing copy examples).
-- Adding a new skill later is just another row here — no code changes required.

insert into public.skills (slug, name, category, description, icon, sort_order) values
  ('graphic-design', 'Graphic Design', 'Design', 'Color theory, typography, layout and visual hierarchy — go from blank canvas to confident designer.', '🎨', 1),
  ('copywriting', 'Copywriting', 'Marketing', 'Write words that sell — headlines, landing pages, ads and email that convert.', '✍️', 2),
  ('video-editing', 'Video Editing', 'Video', 'Cuts, transitions, color grading and pacing for YouTube, social and client work.', '🎬', 3),
  ('no-code-development', 'No-Code Development', 'Development', 'Build real web and mobile apps with no-code tools — no programming required.', '🧩', 4),
  ('digital-marketing', 'Digital Marketing', 'Marketing', 'SEO, paid ads, funnels and analytics — the full digital marketing toolkit.', '📈', 5),
  ('ai-tools-prompting', 'AI Tools & Prompting', 'AI', 'Get fluent with today''s AI tools and write prompts that get you real results.', '🤖', 6),
  ('ui-ux-design', 'UI/UX Design', 'Design', 'Design usable, beautiful interfaces — wireframes, prototypes and design systems.', '🖥️', 7),
  ('social-media-management', 'Social Media Management', 'Marketing', 'Grow and run brand accounts — content calendars, engagement and analytics.', '📱', 8)
on conflict (slug) do nothing;
