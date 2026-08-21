-- Curated catalog day 2 (of 6): 10 more real, hand-researched courses,
-- same process as 0006_curated_catalog.sql. WordPress Website Building was
-- dropped from today's picks after real YouTube tutorials couldn't be
-- sourced with confident channel attribution in the available search
-- budget — swapped for Google Workspace Productivity instead, which could.

insert into public.courses (slug, title, description, level, price, published, display_order) values
  ('ui-ux-design-figma', 'UI/UX Design (Figma)', 'Learn to design usable, good-looking app and website interfaces in Figma — from your first wireframe to a clickable prototype — plus the judgment to avoid the rookie mistakes that make interfaces confusing.', 'beginner', 500, true, 110),
  ('ecommerce-online-selling', 'E-commerce & Online Selling', 'Learn how to set up a real online store and sell the way Kenyan and African entrepreneurs actually do — through Shopify and through WhatsApp — covering store setup, payments and shipping, listings, and getting first sales without wasting money on avoidable mistakes.', 'beginner', 500, true, 120),
  ('email-marketing', 'Email Marketing', 'Learn how to build an email list from nothing, write marketing emails people actually open, and run a real campaign in Mailchimp — including the automation and open-rate tactics that separate a hobby newsletter from a business tool that drives sales.', 'beginner', 500, true, 130),
  ('cybersecurity-online-safety', 'Cybersecurity & Online Safety', 'Learn the practical habits that keep individuals and small businesses safe online in Kenya''s digital economy — from spotting scams to locking down accounts. By the end, you''ll be able to recognize common threats, harden your passwords and logins, and put basic protections in place for a small business.', 'beginner', 500, true, 140),
  ('presentation-design', 'Presentation Design (PowerPoint & Canva)', 'Learn to turn a wall of text into a clear, professional slide deck using PowerPoint and Canva. By the end, you''ll be able to structure a presentation, design clean slides, and avoid the mistakes that make decks hard to follow.', 'beginner', 500, true, 150),
  ('seo-search-engine-optimization', 'SEO (Search Engine Optimization)', 'A dedicated deep-dive on ranking a website on Google — what SEO actually is, how to find the keywords your customers are searching for, how to optimize a page around them, and the technical basics that keep a site crawlable.', 'beginner', 500, true, 160),
  ('google-facebook-ads', 'Google Ads & Facebook Ads', 'Learn to run real paid ad campaigns on Google and Facebook/Meta — not just theory. By the end you''ll be able to set up a search campaign, configure Facebook ad targeting and budgets, and read your results well enough to fix underperforming ads instead of guessing.', 'beginner', 500, true, 170),
  ('project-management-tools', 'Project Management Tools (Trello, Asana & Notion)', 'Get hands-on with the three most popular free project management tools — Trello, Asana, and Notion. You''ll finish able to build a task board, run a team project, and pick the right tool for a given job.', 'beginner', 500, true, 180),
  ('instagram-tiktok-growth', 'Instagram & TikTok Growth', 'Learn the specific tactics for growing a following and getting content to spread on Instagram and TikTok. You''ll come away understanding how both algorithms decide what to show people, how to shoot Reels/TikToks that hook viewers, and which common mistakes quietly cap your growth.', 'beginner', 500, true, 190),
  ('google-workspace-productivity', 'Google Workspace Productivity', 'Get productive fast in Gmail, Docs, and Sheets — the tools most remote and office jobs actually run on. By the end you''ll manage email efficiently, write and format documents cleanly, and build simple spreadsheets without fumbling through menus.', 'beginner', 500, true, 200)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- ui-ux-design-figma
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'ui-ux-design-figma';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'What Is UI/UX Design? Figma Foundations', 'Figma''s interface and core tools, starting from a blank canvas.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Wireframing and Prototyping in Practice', 'Blocking out layouts and linking screens into a clickable prototype.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Leveling up visual quality fast, and the small mistakes that make designs look amateur.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Figma UI Design Course: A Beginners Tutorial', 'Walks through Figma''s interface and core tools so you can start creating your first screen designs from a completely blank canvas.', 'https://www.youtube.com/watch?v=P5epIoOJnzU', 1),
    (v_m1, 'Figma Tutorial For Beginners', 'A fast, friendly intro to Figma''s frames, shapes and text tools for someone who has never opened design software before.', 'https://www.youtube.com/watch?v=tdy1bo5eAgA', 2),
    (v_m2, 'Figma Wireframe Tutorial For Beginners', 'Shows how to block out a screen''s layout with simple boxes and placeholders before adding visual polish, the way real UX designers start a project.', 'https://www.youtube.com/watch?v=mHoux2jITnE', 1),
    (v_m2, 'Prototyping in Figma | How to Prototype in Figma?', 'Teaches how to link screens together so a client or user can click through the design and experience it like a real app.', 'https://www.youtube.com/watch?v=w02V7aRzLys', 2),
    (v_m3, 'The EASIEST Way To Get Better At UI Design In Figma', 'A working designer''s shortcut for leveling up visual quality quickly by studying and adapting well-designed interfaces instead of starting from zero.', 'https://www.youtube.com/watch?v=Q7TLNIeQ_Hk', 1),
    (v_m3, '7 UI/UX Design Mistakes that I Wish I Knew as a Beginner', 'Points out small inconsistencies — spacing, alignment, unclear labels — that instantly make a design look amateur, and how to fix them.', 'https://www.youtube.com/watch?v=MArmSen6WlA', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- ecommerce-online-selling
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'ecommerce-online-selling';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started: Choosing Your Selling Platform', 'Setting up a Shopify account and registering as a marketplace seller.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Payments, shipping, and turning WhatsApp Business into a real storefront.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Launching and marketing a store, and the mistakes that quietly kill new ones.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'The OFFICIAL Shopify Tutorial For Beginners (Part 1)', 'Shopify''s own team walks through creating an account and building the skeleton of a first store from scratch.', 'https://www.youtube.com/watch?v=RWI59fC7Z48', 1),
    (v_m1, '4 simple steps to become a Jumia seller', 'Shows the exact steps to register as a seller on Jumia, a major marketplace many Kenyan sellers use instead of building their own website.', 'https://www.youtube.com/watch?v=rlospvboJL0', 2),
    (v_m2, 'The OFFICIAL Shopify Tutorial For Beginners 2026 (Part 2)', 'Covers the essential setup work — accepting payments, setting shipping rates, and handling tax — that has to be right before anything can sell.', 'https://www.youtube.com/watch?v=ohn-47s9GsA', 1),
    (v_m2, 'How to Sell Products on WhatsApp | Full Tutorial', 'A practical walkthrough of turning WhatsApp Business into a working storefront with a catalog customers can browse and order from.', 'https://www.youtube.com/watch?v=FlS615MwkgA', 2),
    (v_m3, 'The OFFICIAL Shopify Tutorial (Part 3)', 'Covers how to actually launch a store and market it so real customers find and buy, not just how to build it.', 'https://www.youtube.com/watch?v=9LNERa2EB9U', 1),
    (v_m3, '10 Biggest Mistakes New Shopify Store Owners Make', 'Rounds up the setup, pricing, and marketing mistakes that quietly kill new stores, so learners can sidestep them from day one.', 'https://www.youtube.com/watch?v=TcvbEQhQevU', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- email-marketing
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'email-marketing';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started: Building Your List', 'What email marketing software does, and how to grow a list from nothing.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Building and automating real campaigns in Mailchimp.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'The habits that quietly tank open rates and sender reputation.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'HubSpot Email Marketing Tutorial 2026', 'An official walkthrough of what email marketing software does and how to put together and send a first campaign.', 'https://www.youtube.com/watch?v=i3UDq41Xf9k', 1),
    (v_m1, 'How to Grow Your Email List Fast in 2025', 'Explains practical ways to convince website visitors to hand over their email address, the first real bottleneck for any beginner.', 'https://www.youtube.com/watch?v=cXoSFDt5B9Y', 2),
    (v_m2, 'How to Create and Send Email Campaigns on Mailchimp (Full Tutorial)', 'A hands-on walkthrough of building an email inside Mailchimp, from picking a template to sending it to a real list.', 'https://www.youtube.com/watch?v=_-KisPrsqKU', 1),
    (v_m2, 'Mailchimp Automation Tutorial (Set up Email Automation Step-by-Step)', 'Shows how to set up an automated email, like a welcome message, that goes out on its own whenever someone joins the list.', 'https://www.youtube.com/watch?v=gnCtOuYoxws', 2),
    (v_m3, 'THIS Email Marketing Mistake Costs You A 25% DROP In Open Rates!', 'Breaks down one common habit that quietly tanks open rates, and the simple fix for it.', 'https://www.youtube.com/watch?v=E2WgWLCCO18', 1),
    (v_m3, 'Avoid This Email Marketing Strategy At All Costs', 'Warns against a widely-used email tactic that damages sender reputation and long-term results.', 'https://www.youtube.com/watch?v=GAwYtycQYoM', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- cybersecurity-online-safety
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'cybersecurity-online-safety';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'What Cybersecurity Actually Means', 'A plain-English overview of threats, and how phishing scams actually work.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Locking Down Your Accounts', 'Strong passwords and two-factor authentication.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Protecting Yourself and Your Business', 'Basic security habits for a small business.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'What Is Cyber Security | How It Works? | Cyber Security In 7 Minutes', 'A fast, plain-English overview of what cybersecurity covers and why everyday users need to care about it.', 'https://www.youtube.com/watch?v=inWWhr5tnEA', 1),
    (v_m1, 'What Is Phishing?', 'Explains how phishing scams trick people into handing over information, using real examples of fake messages and links.', 'https://www.youtube.com/watch?v=VUx-VHOMZd4', 2),
    (v_m2, 'How to create strong passwords and keep it safe', 'Walks through what makes a password actually hard to crack and how to manage many passwords without reusing them.', 'https://www.youtube.com/watch?v=ucFbRnNIwAs', 1),
    (v_m2, 'How Two-factor Authentication Works?', 'Shows how adding a second login step stops attackers even if they steal your password.', 'https://www.youtube.com/watch?v=riBNs_8HVrM', 2),
    (v_m3, 'Cybersecurity and Your Small Business', 'Covers the basic security habits a small business owner should put in place to avoid becoming an easy target.', 'https://www.youtube.com/watch?v=omNvpSJR0No', 1),
    (v_m3, 'Started Your Business? Don''t Forget IT Security', 'A real-world reminder of why new business owners skip security early on, and the simple first steps to fix that.', 'https://www.youtube.com/watch?v=_6f182D9H20', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- presentation-design
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'presentation-design';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Presentation Fundamentals', 'Design habits that make a deck easier to follow, and the PowerPoint interface.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Building Slides in PowerPoint and Canva', 'Assembling and polishing real slides with templates and quick edits.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Common mistakes, and shaping a deck around a clear narrative.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Make a Better Slide Presentation - 10 Easy Tips', 'Ten straightforward design habits — like one idea per slide — that instantly make a deck easier to follow.', 'https://www.youtube.com/watch?v=cQ_z-CMsBKg', 1),
    (v_m1, 'PowerPoint Tutorial for Beginners', 'A clear walkthrough of the PowerPoint interface and core features for someone opening the app for the first time.', 'https://www.youtube.com/watch?v=l5Ij7nUy9UQ', 2),
    (v_m2, 'Perfect your presentations', 'Canva''s own tutorial on using templates, layouts, and brand tools to assemble a presentation quickly.', 'https://www.youtube.com/watch?v=zUF_95mJ1ms', 1),
    (v_m2, '5 QUICK Ways to Improve Your PowerPoint Design', 'Five fast, practical edits — spacing, alignment, color — that upgrade a plain slide into a polished one.', 'https://www.youtube.com/watch?v=TQiln3CjtvM', 2),
    (v_m3, '6 Things You''re Doing WRONG in PowerPoint', 'Points out common beginner mistakes (cluttered slides, bad fonts, poor contrast) and how to fix each one.', 'https://www.youtube.com/watch?v=fJZi3ueyF54', 1),
    (v_m3, 'Canva Presentations: Perfect your pitch', 'Focuses on shaping a deck around a clear narrative so it lands well when actually presented to an audience.', 'https://www.youtube.com/watch?v=M3XmdYM5Mzw', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- seo-search-engine-optimization
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'seo-search-engine-optimization';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'What Is SEO?', 'What SEO is and why it matters, plus finding the keywords customers search for.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'On-Page SEO in Practice', 'Optimizing an actual page around a target keyword.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Using SEO tools and getting the technical basics right.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'SEO Basics: What is SEO and Why is it Important?', 'A clear introduction to what SEO actually is and why it determines whether a business shows up when customers search for it.', 'https://www.youtube.com/watch?v=btwC4zmewss', 1),
    (v_m1, 'Keyword Research: How to Find Keywords for Your Website', 'Shows how to find the actual search terms your customers are typing into Google, the foundation of any SEO plan.', 'https://www.youtube.com/watch?v=GsW5GeDXNkU', 2),
    (v_m2, 'What is On-Page SEO', 'Explains the elements on a page itself — titles, headings, content — that affect how well it ranks.', 'https://www.youtube.com/watch?v=lu9-GvQGZAE', 1),
    (v_m2, 'On-Page SEO Pt 2: How to Optimize a Page for a Keyword', 'A hands-on walkthrough of actually optimizing a real page around a chosen keyword.', 'https://www.youtube.com/watch?v=IrFAeQgzE7w', 2),
    (v_m3, 'Official Ahrefs Tutorial: How to use Ahrefs to Improve SEO', 'Shows how to use a real SEO tool to research competitors and track rankings, the way working SEOs actually operate.', 'https://www.youtube.com/watch?v=x5hH_lt8Guw', 1),
    (v_m3, 'Technical SEO Best Practices for Beginners', 'Covers the behind-the-scenes technical basics that keep a site crawlable and indexable by Google.', 'https://www.youtube.com/watch?v=RFlpwKQ0bEs', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- google-facebook-ads
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'google-facebook-ads';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Why Paid Ads Work', 'Google Ads and Facebook Ads basics for a first-time advertiser.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Setting Up Your First Campaign', 'Building a real Google Search campaign and Facebook ad set.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Reading Results & Avoiding Rookie Mistakes', 'Common mistakes and the metrics that actually matter.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'How do I get started in Google Ads?', 'An ex-Google employee walks through the absolute basics of what Google Ads is and how a beginner should approach their first account.', 'https://www.youtube.com/watch?v=fgOY7bDftMQ', 1),
    (v_m1, 'The BEST Facebook Ads Tutorial for Beginners (Full Guide)', 'A full walkthrough of Meta Ads Manager for someone who has never run a Facebook ad before, covering the core concepts you need before spending any money.', 'https://www.youtube.com/watch?v=BZrio_G_1Cs', 2),
    (v_m2, 'Step-By-Step Google Ads Tutorial For Beginners', 'A hands-on walkthrough of building a Google Search campaign from scratch — account setup, keywords, and budget.', 'https://www.youtube.com/watch?v=UN0ZDfs2Jgw', 1),
    (v_m2, 'How To Setup Facebook Ads Targeting In 2026 (Step by Step)', 'Shows exactly how to configure audience targeting and budget settings when building a Facebook ad set.', 'https://www.youtube.com/watch?v=CkGSYkAY2f0', 2),
    (v_m3, '5 Performance Max Mistakes Even Experts Make', 'Breaks down common Google Ads mistakes so learners know what to check before blaming the platform for poor results.', 'https://www.youtube.com/watch?v=e_CbHH4yeY4', 1),
    (v_m3, 'How To Analyze Facebook Ads Performance (the Right Way)', 'A paid-social specialist explains which metrics actually matter when judging whether a Facebook ad is working.', 'https://www.youtube.com/watch?v=UL-6LfCSLvs', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- project-management-tools
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'project-management-tools';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Meet Your Toolkit', 'First looks at Trello and Notion.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Boards, Tasks & Team Setup', 'Extending Trello and setting up Asana for a team.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Running Projects Like a Pro', 'Keeping Asana and Notion projects organized as they scale.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'How to use TRELLO - Tutorial for Beginners', 'A clear first look at Trello boards, lists, and cards from a well-known productivity educator.', 'https://www.youtube.com/watch?v=geRKHFzTxNY', 1),
    (v_m1, 'Getting Started in Notion with Francesco D''Alessio', 'An approachable intro to what Notion is and how its pages/blocks differ from a traditional task app.', 'https://www.youtube.com/watch?v=-UkBudE7M7I', 2),
    (v_m2, '7 FREE Trello Power-Ups You Should Be Using Right Now!', 'Hands-on look at extending a basic Trello board with free add-ons for calendars, checklists, and automation.', 'https://www.youtube.com/watch?v=_CZeX0EAdLg', 1),
    (v_m2, 'Asana Team Management: How to Use Asana as a Team', 'Shows how to actually set up Asana so a team can track shared tasks, not just a single person''s to-do list.', 'https://www.youtube.com/watch?v=656pu50stP0', 2),
    (v_m3, '5 Asana Tips That Will Save You Time', 'Practical time-saving habits for keeping an Asana project from becoming cluttered as a team scales its use of it.', 'https://www.youtube.com/watch?v=_Tyj9FZi0Tk', 1),
    (v_m3, 'How To Use Notion (Productive Dude Step By Step Guide)', 'A workflow-focused look at running an entire project inside Notion, from planning to tracking progress.', 'https://www.youtube.com/watch?v=8Tguw5XXRQs', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- instagram-tiktok-growth
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'instagram-tiktok-growth';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'How the Algorithms Actually Work', 'What Instagram and TikTok use to decide who sees your content.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Making Content That Spreads', 'Planning and filming content built to be watched and shared.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Growing Like a Pro', 'Diagnosing stalled growth and posting for consistent reach.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'How Instagram Algorithm Works | How to Grow on Instagram', 'Breaks down what signals Instagram uses to decide who sees your posts and Reels.', 'https://www.youtube.com/watch?v=b2GeZ73ilK4', 1),
    (v_m1, 'THE TIKTOK ALGORITHM EXPLAINED', 'Explains how the For You Page ranks videos, which is the first thing a new creator needs to understand.', 'https://www.youtube.com/watch?v=diJ172jDsxA', 2),
    (v_m2, 'Instagram Content Strategy 101 (0 to 100,000+ Followers)', 'A step-by-step content planning approach for building an Instagram presence from nothing, with an emphasis on Reels.', 'https://www.youtube.com/watch?v=51Ud2FVUXq0', 1),
    (v_m2, 'THE ULTIMATE TIKTOK TUTORIAL FOR BEGINNERS', 'Walks a first-time creator through filming, editing, and setting up a TikTok account the right way.', 'https://www.youtube.com/watch?v=J7-r4ouPmwE', 2),
    (v_m3, 'Why You''re Not Growing on Instagram (Easy Fixes)', 'Diagnoses the common habits that stall Instagram growth and gives concrete fixes for each one.', 'https://www.youtube.com/watch?v=2Jx_v-AYvuE', 1),
    (v_m3, 'How To Go Viral on TikTok Every Time You Post', 'Covers a repeatable posting approach aimed at consistent reach rather than one-off lucky videos.', 'https://www.youtube.com/watch?v=B6cisIeByJg', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- google-workspace-productivity
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'google-workspace-productivity';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started: Meet Google Workspace', 'A full tour of Drive, Docs, Sheets, and Slides, plus expert productivity habits.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Gmail and Google Sheets, hands-on.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Google Docs mastery and real time-saving tips.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Complete Google Workspace Tutorial', 'A former Microsoft product manager tours Google Drive, Docs, Sheets, and Slides for someone brand new to the suite.', 'https://www.youtube.com/watch?v=kX8deC_eWgs', 1),
    (v_m1, 'Work Smarter with Google''s Productivity Tools', 'Google''s own productivity expert shares practical habits for getting more done with Workspace tools.', 'https://www.youtube.com/watch?v=fIS4cwCW4Dg', 2),
    (v_m2, 'Gmail Tutorial for Beginners - 2026 Update', 'Covers composing emails, attachments, and signatures — everyday Gmail use from the ground up.', 'https://www.youtube.com/watch?v=PEB9jEXh0X4', 1),
    (v_m2, 'Google Sheets Tutorial for Beginners', 'Shows how to create a spreadsheet, format cells, and start entering and organizing real data.', 'https://www.youtube.com/watch?v=TENAbUa-R-w', 2),
    (v_m3, 'Google Docs Tutorial for Beginners - EVERYTHING You Need To Know', 'A complete walkthrough of creating polished, professional documents in Google Docs.', 'https://www.youtube.com/watch?v=aoMMDlwEtwM', 1),
    (v_m3, '30 Time-Saving G Suite Tips to Help Your Employees be More Productive', 'A Google Cloud conference talk packed with real time-saving tips for everyday Workspace use.', 'https://www.youtube.com/watch?v=hJiNgN_pzx4', 2)
  on conflict (module_id, order_number) do nothing;
end $$;
