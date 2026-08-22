-- Lets admin refund a payment and revoke the learner's access without
-- deleting anything — same "preserve the historical record" philosophy as
-- the course-delete guard in /api/admin/courses/[courseId]. A refunded
-- payment stays in `payments` (status='refunded' instead of vanishing),
-- and a revoked enrollment stays in `enrollments` (status='revoked')
-- instead of being deleted, so admin can still see "this person paid,
-- then got refunded" later. Access is blocked the same way it already
-- works everywhere else: RLS's lessons_select_enrolled policy and every
-- app-level enrollment check only allow 'active'/'completed', so
-- 'revoked' is excluded automatically — no other query needs to change.

alter table public.payments drop constraint payments_status_check;
alter table public.payments add constraint payments_status_check
  check (status in ('pending', 'success', 'failed', 'refunded'));

alter table public.enrollments drop constraint enrollments_status_check;
alter table public.enrollments add constraint enrollments_status_check
  check (status in ('active', 'completed', 'revoked'));
