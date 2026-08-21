-- Shareable completion certificates. Publicly readable by design (the
-- whole point is a link a learner can post on LinkedIn/WhatsApp that
-- anyone can open without an account), but only ever written by the
-- service role after server-side verification that every lesson in the
-- course is actually complete — see lib/certificates.ts.
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  learner_name text not null,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.certificates enable row level security;

create policy "certificates_select_public" on public.certificates
  for select using (true);

-- No insert/update/delete policies for anon/authenticated — issuance goes
-- through POST /api/certificates (service role) only.
