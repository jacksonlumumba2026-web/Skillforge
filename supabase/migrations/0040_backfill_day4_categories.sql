-- Backfills courses.category for day 4's batch (0028_curated_catalog_day4.sql).
--
-- The category column was added in 0026_course_categories.sql, AFTER the
-- daily catalog-growth routine's instructions were written, so day 4's
-- firing inserted its 10 courses without one. Effect: every /courses filter
-- chip queries `category = ...`, so all 10 were invisible to anyone browsing
-- by category — they only appeared in the unfiltered list.
--
-- Buckets are the same five defined in 0026.

update public.courses set category = 'marketing-growth'
  where slug in ('affiliate-marketing', 'whatsapp-business-facebook-marketplace-selling');

update public.courses set category = 'tech-programming'
  where slug in ('wordpress-website-building', 'no-code-app-building');

update public.courses set category = 'business-freelancing'
  where slug in ('online-tutoring-course-creation', 'personal-finance-budgeting',
                 'public-speaking-communication-skills', 'virtual-event-planning-webinar-hosting');

update public.courses set category = 'productivity-tools'
  where slug in ('time-management-productivity-remote-work');

update public.courses set category = 'design-creative'
  where slug in ('digital-illustration-procreate-fresco');
