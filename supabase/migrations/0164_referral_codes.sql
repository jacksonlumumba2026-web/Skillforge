-- Part one of referrals: every learner gets a shareable code.
--
-- Defaulted rather than set by the handle_new_user() trigger so the value
-- exists however the profile row was created. The referrals table that
-- consumes this lives in the next migration, so this one is safe on its
-- own: an unused column.

alter table public.profiles
  add column if not exists referral_code text unique
  default upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));

update public.profiles
   set referral_code = upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8))
 where referral_code is null;
