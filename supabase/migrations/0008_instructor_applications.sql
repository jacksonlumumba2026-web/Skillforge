-- Lead capture for "I want to teach on SkillPath Africa" — deliberately
-- just a waitlist, not real seller accounts/payouts yet. Lets us gauge
-- real demand before building the much bigger marketplace machinery
-- (seller onboarding, content review, revenue splits, payouts).
create table public.instructor_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  topic text not null,
  message text not null default '',
  created_at timestamptz not null default now()
);

alter table public.instructor_applications enable row level security;

-- No select/insert policies for anon/authenticated — same pattern as
-- `payments`. The public form submits through a service-role API route;
-- only admins (via the service role, from /admin) ever read these.
