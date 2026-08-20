-- Explicit catalog ordering, independent of created_at, so the /courses
-- grid can be curated deliberately (mixing course "flavors" so it doesn't
-- read as a wall of similar courses) instead of just insertion order.
alter table public.courses
  add column display_order integer not null default 0;

comment on column public.courses.display_order is
  'Lower sorts first on /courses. Gaps of 10 left between values so new courses can be inserted without renumbering.';
