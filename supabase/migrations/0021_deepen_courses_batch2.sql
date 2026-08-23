-- Course-depth expansion, batch 2 of ~6. Same pattern as
-- 0020_deepen_courses_batch1.sql: existing module 3 bumped to position
-- 5, three new modules inserted at 3, 4, 6.

update public.modules set order_number = 5 where id = '3d3ce790-0557-40a3-b355-1578de60e5dd'; -- vibe-coding: No-Code AI App Builders
update public.modules set order_number = 5 where id = '7d14eea3-f24e-4027-8437-f7584fa42e8e'; -- social-media-management: Growing and Proving Your Results
update public.modules set order_number = 5 where id = '598b396c-5144-44c4-bf2b-1ffc43434b8a'; -- virtual-assistance-data-entry: Winning Clients and Working Like a Pro
update public.modules set order_number = 5 where id = '7a865daa-7172-47ad-b9f7-941290484d78'; -- copywriting-content-writing: Editing, SEO, and Working Like a Pro
update public.modules set order_number = 5 where id = '57679404-f4b1-4946-943d-ef15f4b4fbbb'; -- excel-spreadsheets-for-work: Pivot Tables, Tips, and Working Like a Pro
update public.modules set order_number = 5 where id = 'b658a185-d411-4ef1-a9c6-05a5331105d3'; -- ui-ux-design-figma: Working Like a Pro

-- ---------------------------------------------------------------------------
-- vibe-coding: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '515a9435-52c0-4c91-afd0-375e2150fb96';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Prompting AI Coding Tools Effectively', 'Learn how to write clear, effective prompts for AI code editors and how to iterate on and debug the code they generate.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Building a Real Project End-to-End', 'Follow along as a complete small app is built from initial idea through to a finished, working product using an AI coding tool.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelancing with Vibe Coding', 'Learn how to package AI-assisted app/website building as a freelance service and land your first paying clients.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'How To Write Perfect Prompts For AI Coding Agents', 'A practical guide to writing prompts that get AI coding agents (Cursor, Bolt, Lovable, and others) to produce the output you actually want.', 'https://www.youtube.com/watch?v=yNqLsg2avpo', 1),
    (v_m3, 'How To Fix Bugs in Your Vibe Coding Projects', 'A full walkthrough of a debugging and quality-assurance process for finding and fixing bugs in AI-generated code.', 'https://www.youtube.com/watch?v=FhYnvR4enQQ', 2),
    (v_m4, 'Build a Full App with AI in 30 Minutes (5-Step Workflow)', 'A step-by-step 5-stage workflow for turning an idea into a working app quickly using an AI builder.', 'https://www.youtube.com/watch?v=7FCo41u4T7M', 1),
    (v_m4, 'How I Built a Full App in One Week Using AI', 'A longer-form, real project walkthrough showing the full process (and lessons learned) of shipping a complete app with AI over one week.', 'https://www.youtube.com/watch?v=Q13QOgwoF0E', 2),
    (v_m6, 'How To Land Your First AI Client As A Freelancer', 'A beginner-focused guide to finding and landing a first paying client for AI-assisted development work.', 'https://www.youtube.com/watch?v=jzq3FUrQ-u0', 1),
    (v_m6, 'How To Make Money Vibe Coding With Cursor AI', 'A beginner tutorial on turning AI-assisted coding skills (using Cursor) into a paid freelance service.', 'https://www.youtube.com/watch?v=Whiy94uKuFY', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- social-media-management: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '89135a1d-1c9f-480a-8f26-50904226cdb1';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Content Strategy', 'Move beyond basics into building content pillars, understanding your target audience, and tailoring strategy across platforms.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Running a Real Client Account', 'Practice the day-to-day of managing an actual brand account: building a content calendar and handling the community that responds to it.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance Social Media Management', 'Learn how to find social media management clients and price your services, even when starting with no prior client work.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'How to Create Content Pillars for Social Media', 'Learn how to define content pillars/themes so you can plan a brand''s content consistently and with purpose.', 'https://www.youtube.com/watch?v=5wDGFEDx414', 1),
    (v_m3, 'How to Find Your Target Audience on Social Media', 'A 4-step process for researching and defining a brand''s target audience so content can be tailored to who''s actually watching.', 'https://www.youtube.com/watch?v=vYsxx76mUCg', 2),
    (v_m4, 'Social Media Manager Workflow: Create & Schedule Content for Clients', 'A behind-the-scenes look at building and scheduling a real content calendar for a client account.', 'https://www.youtube.com/watch?v=dRReeNP3Pbs', 1),
    (v_m4, 'How to Handle Negative Comments & Social Media Backlash', 'Practical guidance for responding to negative comments and minor PR issues on a brand''s account without escalating them.', 'https://www.youtube.com/watch?v=ejp7iCPPW3I', 2),
    (v_m6, 'How to Get Social Media Management Clients With No Experience', 'A beginner-focused strategy for finding and landing social media management clients with no prior track record.', 'https://www.youtube.com/watch?v=q5mE7iT4YzQ', 1),
    (v_m6, 'What to Charge for Social Media Management Packages', 'A breakdown of how to price social media management services and structure packages for clients.', 'https://www.youtube.com/watch?v=ld-jvBATmGA', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- virtual-assistance-data-entry: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '08b3b63d-47b4-4d78-a097-5767d43586e8';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate VA Tools & Systems', 'Get comfortable using project management tools and running a client''s email and calendar like a professional VA.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Handling a Real VA Workload', 'Learn how experienced VAs juggle multiple tasks and clients at once and accurately track and report their hours.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Scaling Your VA Business', 'Learn how to grow an established VA business by raising your rates and building a base of repeat clients and referrals.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Trello Tutorial for Virtual Assistants', 'A VA-focused walkthrough of using Trello to organize and manage client tasks and team workflows.', 'https://www.youtube.com/watch?v=P_rzE0TLc6o', 1),
    (v_m3, 'Managing Client Emails & Calendars as a Virtual Assistant', 'A first-hand account of what it actually looks like to manage a client''s email inbox and calendar day-to-day as a VA.', 'https://www.youtube.com/watch?v=7AdsauvbSLo', 2),
    (v_m4, '4 Tips On How To Handle Multiple Clients As A Virtual Assistant', 'Practical tips for staying organized and professional while managing several clients'' workloads at the same time.', 'https://www.youtube.com/watch?v=8u3j5hB94RU', 1),
    (v_m4, 'How Do Virtual Assistants Track Client Hours Accurately?', 'Covers how VAs track their working time and report hours to clients fairly and transparently.', 'https://www.youtube.com/watch?v=Pzfxr2BJcbQ', 2),
    (v_m6, 'How to Raise Your Virtual Assistant Rates', 'A guide to confidently increasing your VA rates as you gain experience, without losing your existing clients.', 'https://www.youtube.com/watch?v=BQN55Hyk6jM', 1),
    (v_m6, 'Become a Referral Magnet As a Virtual Assistant', 'Strategies for turning satisfied clients into repeat business and referrals, one of the most reliable ways to grow a VA business.', 'https://www.youtube.com/watch?v=yaksajsezGk', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- copywriting-content-writing: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := 'b4445076-7261-419e-a401-98f30417862a';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Copywriting Techniques', 'Level up from basic copy structure into persuasive storytelling and format-specific writing skills.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Writing for a Real Client Project', 'Practice translating a real creative brief into a finished, client-ready piece of copy.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance Copywriting', 'Turn your copywriting skill into paid client work, even with no prior experience.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'How to Use Storytelling in Copywriting', 'Shows how to weave narrative and storytelling techniques into copy to build emotional connection and drive action.', 'https://www.youtube.com/watch?v=3lRQNywpNQM', 1),
    (v_m3, 'Writing Copy for Ads, Emails, and Landing Pages', 'Compares how copy needs to shift across formats — ads, email, and landing pages — and how to adapt tone and structure for each.', 'https://www.youtube.com/watch?v=5uLo4lR2C18', 2),
    (v_m4, 'Writing Better Copy With Thorough Copywriting Briefs', 'Explains how to read and work from a real creative/copywriting brief so the copy you produce actually matches the client''s goals.', 'https://www.youtube.com/watch?v=HkhST95oONA', 1),
    (v_m4, 'How to Structure Your Copy for Every Project', 'Walks through structuring and drafting a complete piece of copy for a project, from a blank page to a finished draft.', 'https://www.youtube.com/watch?v=GM83VicS_SE', 2),
    (v_m6, 'How to Get Freelance Copywriting Clients — 4 Strategies', 'Covers four practical, beginner-friendly strategies for finding your first freelance copywriting clients.', 'https://www.youtube.com/watch?v=T8s1RvYDeM0', 1),
    (v_m6, 'Start a Copywriting Portfolio from Scratch with No Experience', 'Shows how to build writing samples and a portfolio from zero, before you''ve ever had a paying client.', 'https://www.youtube.com/watch?v=GloQaVu-CEI', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- excel-spreadsheets-for-work: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '1b933361-d0aa-4350-8a1c-fa849844863f';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Excel Skills', 'Move beyond basic formulas into lookup functions and formatting tools used in real workplace spreadsheets.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Building a Real Spreadsheet Project', 'Apply your Excel skills to build a complete, practical spreadsheet from a blank sheet.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Excel Skills for Freelance & Remote Work', 'Turn Excel skills into freelance data entry, bookkeeping, and client-facing work.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'How to Use VLOOKUP and XLOOKUP in Excel', 'A step-by-step walkthrough of pulling matching data from large datasets using VLOOKUP and XLOOKUP.', 'https://www.youtube.com/watch?v=E2YxV9Dovsc', 1),
    (v_m3, 'Excel Conditional Formatting Tutorial (Beginner to Pro)', 'Teaches how to visually highlight and flag data automatically using conditional formatting rules.', 'https://www.youtube.com/watch?v=6SlYWnssraQ', 2),
    (v_m4, 'Build the Ultimate Budget Tracker in Excel From Scratch', 'A full build-along creating a working budget tracker spreadsheet from nothing.', 'https://www.youtube.com/watch?v=8Q5zfnpOTXE', 1),
    (v_m4, 'Make a Professional Excel Dashboard From Real-World Data', 'Builds a business-style interactive dashboard from raw data, using pivot tables and charts.', 'https://www.youtube.com/watch?v=AxfQwt4jYqY', 2),
    (v_m6, 'How I Made $100K as an Excel Freelancer', 'Real-world lessons on turning Excel skills into paid freelance data/bookkeeping work.', 'https://www.youtube.com/watch?v=FHEPx4KjlG8', 1),
    (v_m6, 'How to Create Professional Looking Excel Spreadsheets', 'Shows formatting and layout techniques that make a spreadsheet look polished and client-ready.', 'https://www.youtube.com/watch?v=qKFcr0wYEsQ', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- ui-ux-design-figma: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '762b82fb-fbfc-45d7-8aff-d29f3143358f';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate UI Design Systems', 'Build reusable, scalable design foundations instead of one-off screens.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Designing a Real App or Website', 'Take a full project end-to-end in Figma, from wireframe to a polished, presentable design.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance UI/UX Design', 'Turn your design skills into freelance client work with a portfolio that gets you hired.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Build It in Figma: Create a Design System — Components', 'Official Figma tutorial on building and organizing reusable components as the foundation of a design system.', 'https://www.youtube.com/watch?v=9xUXTFzDDCo', 1),
    (v_m3, 'Fully Responsive Website Design in Figma', 'Teaches how to design layouts that adapt cleanly across different screen sizes using Auto Layout and constraints.', 'https://www.youtube.com/watch?v=EwkAw4q2jr0', 2),
    (v_m4, 'E-Learning App UI/UX Design in Figma (Wireframe & Prototype)', 'A complete real app project designed from wireframe through to a working prototype.', 'https://www.youtube.com/watch?v=SWT7rR12ZEs', 1),
    (v_m4, 'Create a Full Website Design in Figma', 'Designs a complete website end-to-end in Figma, from initial wireframing to final prototyping.', 'https://www.youtube.com/watch?v=8GUSbMVnGQc', 2),
    (v_m6, 'How to Get Freelance Clients as a UX/UI Designer', 'A step-by-step guide to finding your first paying UI/UX design clients.', 'https://www.youtube.com/watch?v=ddEcZZdS_Uc', 1),
    (v_m6, 'UX/UI Portfolio + Case Study Full Course', 'A full course on building a case-study-based portfolio structured to get you hired by clients.', 'https://www.youtube.com/watch?v=N-34Q9mhwvs', 2)
  on conflict (module_id, order_number) do nothing;
end $$;
