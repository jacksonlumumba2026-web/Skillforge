-- Discount/scholarship codes — the affordability lever for learners who
-- can't pay the full course price. Percent-off only (avoids per-course
-- fixed-amount edge cases), redeemable once per user per code. A 100%-off
-- code is a full scholarship: the initiate routes skip Paystack/M-Pesa
-- entirely for a KES 0 charge and grant access directly.
--
-- No RLS policies are added on either table — same "admin-only via the
-- service-role client" posture as payments/profiles elsewhere in this
-- schema. RLS is enabled so the default-deny applies to anon/authenticated;
-- only the service role (which bypasses RLS) ever touches these tables.

create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  percent_off int not null check (percent_off between 1 and 100),
  max_redemptions int check (max_redemptions is null or max_redemptions > 0),
  redemption_count int not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.discount_codes enable row level security;

create table public.discount_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  discount_code_id uuid not null references public.discount_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (discount_code_id, user_id)
);

alter table public.discount_code_redemptions enable row level security;

alter table public.payments add column discount_code_id uuid references public.discount_codes(id);
alter table public.payments add column original_amount int;

-- Atomic increment (avoids a fetch-then-write race between two concurrent
-- redemptions of the same code landing on the same count).
create function public.increment_discount_redemption(p_discount_code_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.discount_codes set redemption_count = redemption_count + 1 where id = p_discount_code_id;
$$;

revoke execute on function public.increment_discount_redemption(uuid) from public, anon, authenticated;
