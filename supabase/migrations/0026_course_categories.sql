-- Adds a browsing category to every course, replacing the now-broken
-- "level" filter on /courses (level is nearly meaningless once
-- has_career_path is true for 30/31 courses — every one of those spans
-- beginner through professional, so filtering by a single level hides
-- courses a learner actually wants). Nullable so admin-created/AI-generated
-- courses aren't forced into a bucket; they just won't appear under a
-- specific category chip until someone sets one.

alter table public.courses
  add column category text
  check (category is null or category in (
    'business-freelancing',
    'marketing-growth',
    'design-creative',
    'tech-programming',
    'productivity-tools'
  ));

update public.courses set category = 'business-freelancing' where slug in (
  'freelancing', 'ecommerce-online-selling', 'transcription-translation-freelancing',
  'resume-writing-linkedin-personal-branding', 'bookkeeping-quickbooks',
  'virtual-assistance-data-entry', 'customer-service-virtual-call-center'
);

update public.courses set category = 'marketing-growth' where slug in (
  'digital-marketing', 'social-media-management', 'copywriting-content-writing',
  'email-marketing', 'seo-search-engine-optimization', 'google-facebook-ads',
  'instagram-tiktok-growth', 'youtube-channel-growth'
);

update public.courses set category = 'design-creative' where slug in (
  'graphic-design', 'video-editing', 'ui-ux-design-figma', 'presentation-design',
  'mobile-photography-content-creation', 'podcasting-voice-over', '3d-design-animation-blender'
);

update public.courses set category = 'tech-programming' where slug in (
  'web-development-for-beginners', 'cybersecurity-online-safety',
  'python-programming-for-beginners', 'data-analysis-visualization',
  'vibe-coding', 'ai-tools'
);

update public.courses set category = 'productivity-tools' where slug in (
  'excel-spreadsheets-for-work', 'project-management-tools', 'google-workspace-productivity'
);
