-- course_reviews has no public read policy on `profiles` to join a
-- reviewer's display name from, so — same pattern as
-- certificates.learner_name — snapshot the name at write time instead of
-- exposing the whole profiles table publicly.
alter table public.course_reviews
  add column reviewer_name text not null default 'SkillPath Africa Learner';
