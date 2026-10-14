-- Part two of referrals: who invited whom, and whether it has paid off.
--
-- The reward fires on the invitee's FIRST PURCHASE, not on signup.
-- Rewarding signup is free to fake: Gmail delivers every
-- name+alias@gmail.com to one inbox, so one person could mint accounts and
-- discount themselves forever. Tying it to money means an abuser must
-- spend KSh 500 to earn KSh 50 off, which is not an abuse, it is a sale.

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  -- One row per invitee: you can only ever be referred once, by one person.
  referred_user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Set when the invitee's first payment succeeds.
  qualified_at timestamptz,
  -- The single-use discount issued to the referrer at that moment.
  reward_discount_code_id uuid references public.discount_codes(id),
  constraint referrals_no_self_referral check (referrer_user_id <> referred_user_id)
);

create index if not exists referrals_referrer_idx on public.referrals (referrer_user_id);

alter table public.referrals enable row level security;

-- A learner may read referrals they are part of, and nothing else. Writes go
-- through the service role only: the app records a referral after confirming
-- a session, and credits it only from the payment finalizers. Letting a
-- client insert here would let anyone claim to have referred anyone.
drop policy if exists referrals_select_own on public.referrals;
create policy referrals_select_own on public.referrals
  for select
  using (auth.uid() = referrer_user_id or auth.uid() = referred_user_id);
