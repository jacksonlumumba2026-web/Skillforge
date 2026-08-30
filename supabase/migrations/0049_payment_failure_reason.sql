-- Records WHY a payment failed.
--
-- Both payment initiate routes caught errors with a bare `catch {}` and threw
-- the reason away, and nothing in the payment path logged anything at all. The
-- result: 14 consecutive M-Pesa failures over three days produced zero
-- diagnostic information, and 10 Paystack payments sat `pending` for a week
-- with no record of the webhook rejecting them.
--
-- This column is written by the server (service-role) only. It is deliberately
-- NOT exposed to learners -- the customer-facing message stays generic, because
-- provider error text can leak configuration detail. Admins read it through the
-- existing admin payments views, which are already role-gated.
alter table public.payments
  add column if not exists failure_reason text;

comment on column public.payments.failure_reason is
  'Provider error text captured when a payment attempt fails. Server-written, admin-visible only. Never render to the paying user.';
