-- The discount the spin wheel reveals.
--
-- The wheel is theatre: every segment reads 10% OFF, so the spin feels like
-- a win without the page claiming a prize nobody can land on. The actual
-- discount still lives here and is still validated server-side by
-- validateDiscountCode(), which enforces active/expiry/max_redemptions and
-- refuses a second redemption by the same learner. The browser never
-- decides what anything costs.
--
-- Deliberately open-ended: no expiry and no redemption cap, because the
-- wheel offers it to every visitor. Turn it off from Admin -> Discount
-- Codes rather than deleting it, so past redemptions keep their reference.

insert into public.discount_codes (code, percent_off, active, note)
values (
  'SPIN10',
  10,
  true,
  'Revealed by the spin wheel on the course page. One redemption per learner, enforced in validateDiscountCode.'
)
on conflict (code) do nothing;
