-- Adds M-Pesa (Safaricom Daraja STK Push) as a second payment provider
-- alongside Paystack. `reference` stays our own internally-generated id
-- (unique, used everywhere in app code); `checkout_request_id` is
-- Safaricom's id for a specific STK push attempt — it's what their async
-- callback carries back, since the callback has no way to echo our
-- reference. `mpesa_receipt` is the human-facing M-Pesa transaction code,
-- stored only for support/reconciliation — it never gates access, the
-- same way Paystack's payload never gates access on its own.

alter table public.payments
  add column provider text not null default 'paystack',
  add column phone text,
  add column checkout_request_id text,
  add column mpesa_receipt text;

alter table public.payments
  add constraint payments_provider_check check (provider in ('paystack', 'mpesa'));

create unique index payments_checkout_request_id_key
  on public.payments (checkout_request_id)
  where checkout_request_id is not null;
