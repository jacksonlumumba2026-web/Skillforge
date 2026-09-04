-- Pick-your-own bundle: 10 courses for a flat price, chosen by the buyer.
--
-- A payment now covers either ONE course or a SET of them, so course_id can no
-- longer be mandatory. Existing rows are all single-course purchases and are
-- untouched; `kind` defaults to 'course' so every historical row reads
-- correctly without a backfill.
alter table public.payments
  add column if not exists kind text not null default 'course';

alter table public.payments
  alter column course_id drop not null;

alter table public.payments
  drop constraint if exists payments_kind_check;
alter table public.payments
  add constraint payments_kind_check check (kind in ('course', 'bundle'));

-- A single-course payment must name its course; a bundle must not (its courses
-- live in payment_bundle_courses). Enforced here rather than in application
-- code so a malformed row cannot be written at all.
alter table public.payments
  drop constraint if exists payments_course_id_matches_kind;
alter table public.payments
  add constraint payments_course_id_matches_kind check (
    (kind = 'course' and course_id is not null)
    or (kind = 'bundle' and course_id is null)
  );

comment on column public.payments.kind is
  'course = one course named by course_id. bundle = a set of courses listed in payment_bundle_courses.';

-- The courses a bundle payment buys, captured at checkout time so the set is
-- fixed the moment the buyer commits. Deliberately not derived later from
-- "whatever was published then" -- the buyer chose these specific ones.
create table if not exists public.payment_bundle_courses (
  payment_id uuid not null references public.payments(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  primary key (payment_id, course_id)
);

alter table public.payment_bundle_courses enable row level security;

-- Learners may read their own bundle selections; nobody writes through the
-- anon or authenticated role. All inserts go through the service role in the
-- initiate route, which is what stops someone adding courses to their own
-- bundle after paying.
drop policy if exists bundle_courses_select_own on public.payment_bundle_courses;
create policy bundle_courses_select_own on public.payment_bundle_courses
  for select using (
    exists (
      select 1 from public.payments p
       where p.id = payment_bundle_courses.payment_id
         and p.user_id = auth.uid()
    )
  );

create index if not exists payment_bundle_courses_payment_idx
  on public.payment_bundle_courses(payment_id);
