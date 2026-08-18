-- Switch billing from Stripe to M-Pesa STK Push.
-- No pre-authorization is possible with M-Pesa, so access is now computed
-- purely from timestamps (trial_ends_at / current_period_end) instead of a
-- stored, webhook-synced subscription_status.

alter table public.profiles drop column if exists subscription_status;
alter table public.profiles drop column if exists stripe_customer_id;
alter table public.profiles drop column if exists stripe_subscription_id;
drop type if exists subscription_status;

alter table public.profiles add column if not exists current_period_end timestamptz;
alter table public.profiles add column if not exists mpesa_phone text;

-- Frictionless trial: starts automatically at signup, no payment required.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, trial_ends_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    now() + interval '7 days'
  );
  return new;
end;
$$;

-- Access is active while inside the trial window OR inside a paid period.
create or replace function public.has_active_access(uid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce(
    (
      select (trial_ends_at is not null and trial_ends_at > now())
          or (current_period_end is not null and current_period_end > now())
      from public.profiles
      where id = uid
    ),
    false
  );
$$;

-- One row per STK Push attempt; the callback (service role, no RLS) updates
-- status/receipt and extends profiles.current_period_end on success.
create type mpesa_plan as enum ('monthly', 'annual');
create type mpesa_status as enum ('pending', 'success', 'failed', 'cancelled');

create table public.mpesa_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan mpesa_plan not null,
  amount_kes numeric(10,2) not null,
  phone text not null,
  merchant_request_id text,
  checkout_request_id text unique,
  status mpesa_status not null default 'pending',
  mpesa_receipt_number text,
  result_desc text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index mpesa_transactions_user_id_idx on public.mpesa_transactions (user_id);
create index mpesa_transactions_checkout_request_id_idx on public.mpesa_transactions (checkout_request_id);

alter table public.mpesa_transactions enable row level security;

create policy "mpesa_transactions_select_own" on public.mpesa_transactions
  for select using (auth.uid() = user_id);
create policy "mpesa_transactions_insert_own" on public.mpesa_transactions
  for insert with check (auth.uid() = user_id);

-- Updates (status/result from Safaricom's callback) happen server-side via
-- the service role key, which bypasses RLS — no update policy for users.
