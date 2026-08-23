-- Manual M-Pesa fallback for while the Till/PayBill application is stuck.
-- Daraja's STK Push (and any programmatic transaction-status check) only
-- works against a registered business shortcode — Safaricom has no API to
-- automatically verify a "Send Money" payment into an ordinary personal
-- number. So this path is deliberately: buyer sends money manually from
-- their own phone, types the M-Pesa confirmation code back in, and gets
-- access immediately (grant-then-audit, not verify-then-grant) — an admin
-- can check the code against the real M-Pesa statement whenever they're
-- next online and revoke access if a code turns out fake/reused via the
-- existing refund tooling.

alter table public.payments drop constraint payments_provider_check;
alter table public.payments
  add constraint payments_provider_check check (provider in ('paystack', 'mpesa', 'mpesa_manual'));

-- The buyer-entered code, kept separate from mpesa_receipt (which is only
-- ever populated by Safaricom's own STK callback) so it's always clear
-- which payments are self-reported vs Safaricom-confirmed.
alter table public.payments add column mpesa_manual_code text unique;

-- Set by an admin once they've checked the code against the real M-Pesa
-- statement — an audit trail, not an access gate (access is already
-- granted by the time this gets set).
alter table public.payments add column manual_verified_at timestamptz;
