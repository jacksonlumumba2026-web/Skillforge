-- Adds a second manual M-Pesa channel: paying via Buy Goods (Till Number),
-- alongside the existing personal-number Send Money option from migration
-- 0029. Same grant-then-audit flow either way — this column is purely
-- informational, so an admin checking a code against the M-Pesa statement
-- knows which statement page (Till vs personal Send Money) to look on.
alter table public.payments add column manual_channel text
  check (manual_channel is null or manual_channel in ('till', 'send_money'));
