-- Curated catalog day 4 of 6 (see 0006_curated_catalog.sql /
-- 0012_curated_catalog_day2.sql / 0016_curated_catalog_day3.sql for the
-- same pattern). 10 more real, hand-researched courses — no topic or
-- dominant channel overlap with the 31 courses already in the catalog.

insert into public.courses (slug, title, description, level, price, published, display_order) values
  ('affiliate-marketing', 'Affiliate Marketing', 'Learn how to earn commissions promoting other people''s products online. By the end you''ll be able to pick a niche, join a real affiliate program, drive traffic to your links, and track your first payout.', 'beginner', 500, true, 310),
  ('wordpress-website-building', 'WordPress Website Building (No-Code)', 'Build a real, live website using WordPress without writing a single line of code. By the end you''ll be able to set up hosting, design pages with the block editor, add plugins, and publish a site for a small business.', 'beginner', 500, true, 320),
  ('no-code-app-building', 'No-Code App Building (Adalo, Glide & FlutterFlow)', 'Build working mobile and web apps without writing code. By the end you''ll be able to compare no-code tools, turn a spreadsheet into an app, build screens in Adalo and FlutterFlow, and see how no-code skills convert into income.', 'beginner', 500, true, 330),
  ('online-tutoring-course-creation', 'Online Tutoring & Course Creation', 'Teach what you already know and get paid for it. By the end you''ll be able to record lessons, publish a course on Udemy or start tutoring on a platform like Preply, price your offer, and land your first students.', 'beginner', 500, true, 340),
  ('personal-finance-budgeting', 'Personal Finance & Budgeting Basics', 'Practical money management for freelancers and young professionals. By the end you''ll be able to build a working budget on irregular income, start an emergency fund, use mobile-money and banking tools wisely, and avoid predatory debt traps.', 'beginner', 500, true, 350),
  ('public-speaking-communication-skills', 'Public Speaking & Communication Skills', 'Build confidence and skill speaking in front of others. By the end you''ll be able to structure a talk, manage nervousness, use strong body language, and pitch yourself professionally in person or on video calls.', 'beginner', 500, true, 360),
  ('whatsapp-business-facebook-marketplace-selling', 'WhatsApp Business & Facebook Marketplace Selling', 'Sell products directly through the channels small sellers actually use. By the end you''ll be able to set up WhatsApp Business and Facebook Marketplace, build a product catalog, automate replies and broadcasts, and turn it into steady income.', 'beginner', 500, true, 370),
  ('time-management-productivity-remote-work', 'Time Management & Productivity for Remote Workers', 'Build the daily and weekly habits that keep independent and remote workers productive. By the end you''ll be able to design your own personal productivity system and use it to manage real client and work deadlines.', 'beginner', 500, true, 380),
  ('digital-illustration-procreate-fresco', 'Digital Illustration (Procreate & Adobe Fresco)', 'Learn hand-drawn digital illustration from scratch using Procreate and Adobe Fresco. By the end you''ll be able to complete and sell an original digital illustration.', 'beginner', 500, true, 390),
  ('virtual-event-planning-webinar-hosting', 'Virtual Event Planning & Webinar Hosting', 'Learn to plan, promote, and run a professional virtual event or webinar from start to finish. By the end you''ll be able to independently plan and host a live online event.', 'beginner', 500, true, 400)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- affiliate-marketing: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'affiliate-marketing';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'What affiliate marketing actually is and how to choose a niche before promoting anything.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Joining a real affiliate program and driving genuine traffic to your links.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Disclosure/compliance and reading your affiliate earnings like a professional.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'What Affiliate Marketing Actually Is', 'A full beginner walkthrough of how affiliate commissions work and how to start.', 'https://www.youtube.com/watch?v=TSHjeqTvzv8', 1),
    (v_m1, 'Choosing Your Niche', 'How to pick a profitable, sustainable niche before promoting any products.', 'https://www.youtube.com/watch?v=GSdCaeHoeWs', 2),
    (v_m2, 'Joining a Real Affiliate Program', 'Step-by-step sign-up for Jumia''s Kenya-based affiliate (KOL) program.', 'https://www.youtube.com/watch?v=aF1YzBXRTZE', 1),
    (v_m2, 'Driving Traffic to Your Links', 'Five practical ways to send real visitors to affiliate offers.', 'https://www.youtube.com/watch?v=5beJvKDXOHQ', 2),
    (v_m3, 'Disclosure & Compliance', 'How to properly disclose affiliate links/brand deals per endorsement rules.', 'https://www.youtube.com/watch?v=Z0RkLSgwQS4', 1),
    (v_m3, 'Tracking Your Earnings', 'How to read your affiliate dashboard and commission reports like a professional.', 'https://www.youtube.com/watch?v=vmuOd-kXdRA', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- wordpress-website-building: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'wordpress-website-building';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'What WordPress is and how to choose hosting before building anything.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Building real pages with the block editor and installing plugins.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Publishing a live business site and turning the skill into freelance income.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'What Is WordPress?', 'Absolute-basics explainer of what WordPress is and how it works.', 'https://www.youtube.com/watch?v=6yKD992JnMM', 1),
    (v_m1, 'Choosing Hosting', 'Full comparison of how to pick the right WordPress hosting provider.', 'https://www.youtube.com/watch?v=fjW-dFuylGE', 2),
    (v_m2, 'Using the Block Editor', 'Hands-on basic Gutenberg block editor tutorial for building pages.', 'https://www.youtube.com/watch?v=90zkJeMgqiA', 1),
    (v_m2, 'Installing Plugins', 'Beginner''s guide to finding, installing, and activating WordPress plugins.', 'https://www.youtube.com/watch?v=WTUN6iDbPjM', 2),
    (v_m3, 'Publishing a Live Business Website', 'Full walkthrough building and launching a small business site.', 'https://www.youtube.com/watch?v=4vdtRNhTF3E', 1),
    (v_m3, 'Turning It Into Freelance Income', 'How to go from WordPress hobbyist to paid freelancer with real clients.', 'https://www.youtube.com/watch?v=NMtlxQRfMZ8', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- no-code-app-building: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'no-code-app-building';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'What no-code development is and how the major tools compare.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Building real working apps in Glide and Adalo.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'A professional-grade build in FlutterFlow and turning no-code into income.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'What Is No-Code?', 'Beginner''s guide to no-code development and why it matters.', 'https://www.youtube.com/watch?v=mdgJl4AE4as', 1),
    (v_m1, 'Comparing the Tools', 'Overview of five major no-code app builders, including Adalo and Glide.', 'https://www.youtube.com/watch?v=-jVWizn9FRE', 2),
    (v_m2, 'Building an App in Glide', 'Hands-on: turning a Google Sheet into a working mobile app.', 'https://www.youtube.com/watch?v=RQYxJvE-0MA', 1),
    (v_m2, 'Building an App in Adalo', 'Hands-on beginner walkthrough building a simple app in Adalo.', 'https://www.youtube.com/watch?v=r3pij3rEao0', 2),
    (v_m3, 'Building in FlutterFlow', 'Professional-grade setup and first full app build in FlutterFlow.', 'https://www.youtube.com/watch?v=QfbXcCGZuX4', 1),
    (v_m3, 'Turning No-Code Into Income', 'A real creator''s account of scaling no-code skills into significant income.', 'https://www.youtube.com/watch?v=-VmpwRGmrYc', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- online-tutoring-course-creation: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'online-tutoring-course-creation';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'What you need to know before teaching your first online lesson.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Publishing a real course on Udemy and setting up a tutoring profile on Preply.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Pricing your offer professionally and landing your first paying students.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Online Tutoring Basics', 'What you need to know before you ever teach a lesson online.', 'https://www.youtube.com/watch?v=X1aokT2yHrI', 1),
    (v_m1, 'Recording Your First Lesson', 'Beginner-friendly equipment and setup guide for recording course video.', 'https://www.youtube.com/watch?v=DoMao4MVHjg', 2),
    (v_m2, 'Publishing a Course on Udemy', 'Step-by-step tutorial creating and uploading a real course.', 'https://www.youtube.com/watch?v=GM_I_CTILTA', 1),
    (v_m2, 'Becoming a Tutor on Preply', 'Hands-on walkthrough setting up a 1-on-1 tutoring profile.', 'https://www.youtube.com/watch?v=DcuX8xoaizI', 2),
    (v_m3, 'Pricing Your Course or Tutoring', 'How to set professional, sustainable rates for tutoring.', 'https://www.youtube.com/watch?v=DuOeHvSoo9g', 1),
    (v_m3, 'Getting Your First Students', 'Detailed strategy for landing your first paying course student/client.', 'https://www.youtube.com/watch?v=0cndna7FMJ0', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- personal-finance-budgeting: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'personal-finance-budgeting';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'What a budget actually is and how mobile money works from zero.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Building a real budget with real numbers and starting an emergency fund.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Budgeting on irregular freelance income and avoiding debt traps.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'What a Budget Actually Is', 'Absolute-basics explainer on why budgets matter and the core steps to build your first one.', 'https://www.youtube.com/watch?v=SBTc5-MPOgc', 1),
    (v_m1, 'Mobile Money 101: What Is M-PESA', 'Foundational explainer of how mobile money works, for anyone with zero prior exposure.', 'https://www.youtube.com/watch?v=eTWJ5kqLU1o', 2),
    (v_m2, 'Build a 50/30/20 Budget With Real Numbers', 'Hands-on walkthrough building an actual budget using the 50/30/20 method with real figures.', 'https://www.youtube.com/watch?v=0Ji_HRNtjmk', 1),
    (v_m2, 'Build Your Emergency Fund in 5 Steps', 'Practical, step-by-step task for starting and growing an emergency fund from scratch.', 'https://www.youtube.com/watch?v=-3YmvjMZUAQ', 2),
    (v_m3, 'Budgeting on Irregular Income (Complete Guide)', 'Professional-level technique for managing money when income as a freelancer varies month to month.', 'https://www.youtube.com/watch?v=Mtnag1-ITxI', 1),
    (v_m3, 'How to Avoid Debt Traps', 'Kenya-specific guidance on recognizing and avoiding debt traps before they start.', 'https://www.youtube.com/watch?v=iYH2jbGbG6Y', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- public-speaking-communication-skills: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'public-speaking-communication-skills';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'Understanding speaking anxiety and the basics of body language.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Structuring an actual talk and managing nerves with real techniques.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Presenting like a professional and pitching yourself for real opportunities.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Overcoming Your Fear of Public Speaking', 'Why speaking anxiety happens and the basic mindset shift to manage it.', 'https://www.youtube.com/watch?v=GRdm4Iweuz0', 1),
    (v_m1, '5 Public Speaking Body Language Tips', 'Foundational nonverbal basics — posture, gestures, eye contact — for total beginners.', 'https://www.youtube.com/watch?v=U1O3UFeCEeU', 2),
    (v_m2, 'How to Structure a Speech', 'Hands-on guide to outlining an actual talk with a clear opening, body, and conclusion.', 'https://www.youtube.com/watch?v=xxdGHiqu6_4', 1),
    (v_m2, '3 Techniques for Managing Speaking Anxiety', 'Practical, usable exercises to calm nerves right before and during a talk.', 'https://www.youtube.com/watch?v=5naThX63pF0', 2),
    (v_m3, 'Presenting Like a Pro: Body Language', 'Professional-level technique for commanding a room or a video call with your body language.', 'https://www.youtube.com/watch?v=oN9keOMdsaQ', 1),
    (v_m3, 'The 60-Second Pitch That Gets You Hired', 'Turning speaking skill into income: crafting and delivering a pitch for jobs or client work.', 'https://www.youtube.com/watch?v=ercCjaPgHjA', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- whatsapp-business-facebook-marketplace-selling: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'whatsapp-business-facebook-marketplace-selling';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'Setting up WhatsApp Business and learning your way around Facebook Marketplace.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Building a real product catalog and completing a real Marketplace sale.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Broadcast lists and turning Marketplace selling into real, steady income.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Setting Up Your WhatsApp Business Account', 'Absolute-basics walkthrough of downloading, verifying, and setting up WhatsApp Business from scratch.', 'https://www.youtube.com/watch?v=S9Mslchs7xM', 1),
    (v_m1, 'How to Use Facebook Marketplace', 'Beginner tutorial covering the Marketplace basics — browsing, account setup, and navigation.', 'https://www.youtube.com/watch?v=eaVnyoBzWk8', 2),
    (v_m2, 'Creating a Product Catalog in WhatsApp Business', 'Hands-on task of building an actual product catalog with photos and prices inside WhatsApp Business.', 'https://www.youtube.com/watch?v=AUICxAb2NbE', 1),
    (v_m2, 'Selling on Facebook Marketplace: Complete Walkthrough', 'Hands-on walkthrough of creating a listing and completing a sale on Marketplace.', 'https://www.youtube.com/watch?v=Z4aCZFHx2hI', 2),
    (v_m3, 'Broadcast Lists: Send Bulk Messages Like a Pro', 'Professional technique for reaching many customers at once via WhatsApp broadcast lists.', 'https://www.youtube.com/watch?v=mmPrFIfgHkg', 1),
    (v_m3, 'Turning Facebook Marketplace Into Real Income', 'A real seller''s account of scaling Marketplace selling into a consistent side income.', 'https://www.youtube.com/watch?v=N8lQqJ4fr48', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- time-management-productivity-remote-work: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'time-management-productivity-remote-work';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'The Eisenhower Matrix and time blocking — the two foundational planning methods.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Cutting distractions and running a real weekly planning session.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Deep work and professional time-management tactics for managing multiple clients.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Beginner''s Guide to the Eisenhower Matrix', 'The basic 4-quadrant method for deciding what to do now, schedule, delegate, or drop.', 'https://www.youtube.com/watch?v=tLLyi50M5KM', 1),
    (v_m1, 'Beginner''s Guide to Time Blocking', 'How to assign fixed blocks of time to tasks so your day has structure instead of a reactive to-do list.', 'https://www.youtube.com/watch?v=FLxt4Sbpud4', 2),
    (v_m2, 'How to Stop Getting Distracted While Working From Home', 'Practical, concrete tactics for cutting phone, notification, and environment distractions during work hours.', 'https://www.youtube.com/watch?v=3JVfrvV_ozY', 1),
    (v_m2, 'How to Plan Your Week', 'A step-by-step weekly planning session that turns goals into a realistic week of tasks.', 'https://www.youtube.com/watch?v=C4AzJ7Xc7rA', 2),
    (v_m3, 'Mastering Deep Work', 'Applying deep work principles to produce higher-quality output in less time, a key differentiator for freelancers.', 'https://www.youtube.com/watch?v=7EKLRrwZaYw', 1),
    (v_m3, '15 Time Management Tips for Freelancers & Designers', 'Professional-level time management tactics (rate-aware scheduling, buffer time, saying no) for people managing multiple clients.', 'https://www.youtube.com/watch?v=-89m6JRvGtY', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- digital-illustration-procreate-fresco: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'digital-illustration-procreate-fresco';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'The Procreate and Adobe Fresco interfaces, layers, and core drawing tools.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Drawing a real character and a set of stickers from scratch.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Selling commissions and turning illustrations into a print-on-demand business.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Procreate Tutorial for Absolute Beginners', 'Core Procreate interface, layers, and canvas basics for someone who has never opened the app.', 'https://www.youtube.com/watch?v=5dXVgcerwKs', 1),
    (v_m1, 'Adobe Fresco Tutorial for Beginners', 'Adobe Fresco''s interface and core drawing/painting tools as an alternative to Procreate.', 'https://www.youtube.com/watch?v=IZ_tZcPuBog', 2),
    (v_m2, 'A Quick and Simple Way to Draw a Cute Character', 'Hands-on walkthrough of drawing a simple original character from shapes to finished line/color art.', 'https://www.youtube.com/watch?v=ABYEQQ-YP7w', 1),
    (v_m2, 'How to Draw Stickers in Procreate', 'Drawing sticker-style art with clean outlines, ready for digital or print sticker sheets.', 'https://www.youtube.com/watch?v=XEk1GwL2YV4', 2),
    (v_m3, '6 Steps to Selling Your First Art Commissions', 'Practical steps and pricing guidance for taking on paid commission work as an illustrator.', 'https://www.youtube.com/watch?v=MYiD1k-0oRg', 1),
    (v_m3, 'How to Turn Your Art Into Products', 'Turning finished illustrations into a print-on-demand product business (stickers, prints, merch).', 'https://www.youtube.com/watch?v=47NYb87NOvg', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- virtual-event-planning-webinar-hosting: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'virtual-event-planning-webinar-hosting';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'Setting up and running a basic webinar in Zoom and StreamYard.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Filling seats before your event and hosting it smoothly on the day.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Professional follow-up sequencing and monetizing your webinars.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'How to Use Zoom to Run Webinars', 'Setting up and running a basic webinar in Zoom for someone who has never hosted one.', 'https://www.youtube.com/watch?v=w7QqzxmFacs', 1),
    (v_m1, 'Start Live Streaming With StreamYard', 'Getting started with StreamYard as a browser-based alternative for hosting/streaming live events.', 'https://www.youtube.com/watch?v=YlcyoE3q7zY', 2),
    (v_m2, 'How to Get More Webinar Registrants & Attendees', 'Practical promotion tactics to actually fill seats before your event.', 'https://www.youtube.com/watch?v=5hbCxG_2FU4', 1),
    (v_m2, 'How to Plan and Host a Successful Virtual Event', 'Hands-on guidance for running the event itself smoothly, from planning through live execution.', 'https://www.youtube.com/watch?v=SWAM49AczmA', 2),
    (v_m3, 'This Is How You Follow Up With Webinar Attendees', 'Professional follow-up sequencing to keep leads warm after the event ends.', 'https://www.youtube.com/watch?v=-AFKlnyfvyg', 1),
    (v_m3, 'How to Make Money With Webinars', 'Monetization models (paid webinars, offers, affiliate/partner sales) for turning hosting skill into income.', 'https://www.youtube.com/watch?v=F5tCBGxHlJg', 2)
  on conflict (module_id, order_number) do nothing;
end $$;
