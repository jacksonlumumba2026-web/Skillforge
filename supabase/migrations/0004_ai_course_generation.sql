-- Tracks which courses were AI-generated from a learner request, and by
-- whom, purely for future admin visibility (Phase 5). Null = seeded/manual.
alter table public.courses
  add column generated_by uuid references auth.users (id) on delete set null;
