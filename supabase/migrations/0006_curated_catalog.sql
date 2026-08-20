-- Real curated catalog: 10 currently in-demand digital skills, each backed
-- by real YouTube tutorials (researched by hand, not auto-generated) so the
-- /courses grid never shows an empty "0 lessons" course. Content written
-- once here instead of burning Anthropic/YouTube API calls on topics we
-- already know we want in the catalog — the live AI generator
-- (lib/courseGenerator.ts) stays reserved for learner-requested topics
-- outside this set.

-- ---------------------------------------------------------------------------
-- Update descriptions on the 5 existing placeholder courses
-- ---------------------------------------------------------------------------
update public.courses set description =
  'Learn the business side of freelancing that no single craft skill teaches on its own — how to find clients, price your work with confidence, pitch proposals that win jobs, and protect your income. By the end you''ll be able to land a first client, quote fairly, and run client relationships like an experienced freelancer, whatever service you sell.'
  where slug = 'freelancing';

update public.courses set description =
  'Get a beginner-friendly grounding in graphic design principles and the free tool Canva, then practice by building real logos and social graphics. You''ll finish able to put together a simple brand identity, produce professional-looking social posts, and avoid the mistakes that make design work look amateur.'
  where slug = 'graphic-design';

update public.courses set description =
  'Understand how businesses actually find and win customers online, from social ads and content marketing to SEO and analytics. You''ll come away able to explain a basic marketing plan, set up a simple ad campaign, and read the numbers that show what''s working.'
  where slug = 'digital-marketing';

update public.courses set description =
  'Learn to use everyday AI chatbots like ChatGPT, Claude, and Gemini as real productivity tools for writing, images, and getting more done in less time. By the end you''ll confidently pick the right AI tool for a task, write prompts that get useful answers on the first try, and avoid the habits that make AI output unreliable.'
  where slug = 'ai-tools';

update public.courses set description =
  'Learn the everyday job of running a brand''s social media accounts: planning content, scheduling posts consistently, keeping an audience engaged, and reading the numbers that show what''s working. By the end you''ll be able to plan a month of content, keep it on schedule, and explain performance using real metrics instead of guesswork.'
  where slug = 'social-media-management';

-- ---------------------------------------------------------------------------
-- 4 new courses
-- ---------------------------------------------------------------------------
insert into public.courses (slug, title, description, level, price, published, display_order) values
  ('video-editing', 'Video Editing', 'Learn beginner-friendly video editing using CapCut and core editing principles that apply everywhere: cutting footage, adding transitions and captions, and exporting videos that look sharp on YouTube and social media. By the end you''ll be able to take raw clips and turn them into a polished, captioned video ready to publish.', 'beginner', 500, true, 60),
  ('virtual-assistance-data-entry', 'Virtual Assistance & Data Entry', 'Learn exactly what virtual assistants do day-to-day and build the practical admin, inbox, calendar, and data entry skills clients pay for. By the end you''ll be able to manage common VA tasks accurately and efficiently, and know where to find real remote VA and data entry work.', 'beginner', 500, true, 80),
  ('copywriting-content-writing', 'Copywriting & Content Writing', 'Learn how to write copy that actually persuades, from headlines and product copy to blog content, plus how to edit your own writing and write for search engines. By the end you''ll be able to produce clean, structured, sales-ready copy for real clients and projects.', 'beginner', 500, true, 90),
  ('excel-spreadsheets-for-work', 'Excel & Spreadsheets for Work', 'Build real, job-ready spreadsheet skills in Excel and Google Sheets, from the basics through formulas, functions, and pivot tables. By the end you''ll be able to organize, calculate, and summarize data confidently for everyday office and remote-work tasks.', 'beginner', 500, true, 100)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- freelancing: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'freelancing';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Landing Your First Clients', 'The mindset and outreach steps for finding your first paying client.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Winning Work: Outreach & Proposals', 'Building a repeatable system for attracting leads and writing proposals that get a yes.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Pricing & Protecting Your Business', 'Pricing based on value, and screening clients before you accept work.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'How To Get Your First Design Client', 'Chris Do walks through the exact mindset and outreach steps for landing your very first paying client when you have no track record yet.', 'https://www.youtube.com/watch?v=mdWKRhSH4jQ', 1),
    (v_m1, '4 Ways To Get Your First 10 Customers', 'A full class covering four concrete ways to find your first ten customers, useful once you''ve moved past client number one.', 'https://www.youtube.com/watch?v=nNRWt9-XML0', 2),
    (v_m2, 'How To Attract New Customers & Grow Your Freelance Business', 'A deep-dive class on building a repeatable system for attracting leads instead of waiting for referrals.', 'https://www.youtube.com/watch?v=fIZD4KHxcow', 1),
    (v_m2, 'Win More Freelancing Clients with the Best Proposal Format', 'Veteran freelance agency owner Mike Janda breaks down the exact proposal structure that gets prospects to say yes.', 'https://www.youtube.com/watch?v=Q48SU1-gtFA', 2),
    (v_m3, 'How To Price YOUR Work', 'A whiteboard talk from Adobe MAX explaining how to price based on value instead of guessing an hourly rate.', 'https://www.youtube.com/watch?v=6rZQPhXGOlk', 1),
    (v_m3, 'How to Qualify Design Clients & Position Your Work', 'Teaches how to screen prospects before you accept work, so you spot red-flag clients and bad deals early.', 'https://www.youtube.com/watch?v=HOPUMTEV6qM', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- graphic-design: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'graphic-design';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Design Foundations & Meet Canva', 'Core design principles, then a first look at Canva''s interface and tools.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Hands-On: Logos & Layouts in Canva', 'A real logo project start to finish, plus hands-on practice building graphics in Canva.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Branding Basics & Designer Habits', 'Brand style guide essentials and the habits that separate polished work from beginner mistakes.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Beginning Graphic Design: Fundamentals', 'Introduces the core building blocks of design — space, alignment, color, and type — before you touch any software.', 'https://www.youtube.com/watch?v=YqQx75OPRa0', 1),
    (v_m1, 'How To Use Canva For BEGINNERS', 'A first look at Canva''s interface and tools, aimed at people who have never designed anything before.', 'https://www.youtube.com/watch?v=un50Bs4BvZ8', 2),
    (v_m2, 'Modern Logo Design Tutorial - Start To Finish', 'Follows a real logo project from sketch to finished vector, showing the actual decisions a designer makes along the way.', 'https://www.youtube.com/watch?v=5tXFcLyoTsk', 1),
    (v_m2, 'Canva Tutorial for Beginners 2026', 'A hands-on walkthrough of building graphics in Canva step by step, good for practicing on your own projects.', 'https://www.youtube.com/watch?v=Wz6LAD5A-7M', 2),
    (v_m3, 'What to Include in your Brand Style Guide', 'Explains the essentials of a brand style guide — colors, fonts, logo rules — so your designs stay consistent across a client''s brand.', 'https://www.youtube.com/watch?v=dFWKbEORCqc', 1),
    (v_m3, '20 Design Tips You NEED to Stop Being Amateur', 'A rapid-fire list of the small habits and fixes that separate polished work from beginner mistakes.', 'https://www.youtube.com/watch?v=GiQFMI02YUo', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- digital-marketing: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'digital-marketing';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'How Digital Marketing Works', 'The main digital marketing channels and how they fit together into one strategy.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Running Ads & Creating Content', 'Setting up a first ad campaign and planning content that attracts and keeps an audience.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Measuring Results Like a Pro', 'Reading analytics and running fast, practical SEO to see what''s actually working.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Digital Marketing 101 - A Complete Beginner''s Guide', 'A plain-English overview of the main digital marketing channels and how they fit together into one strategy.', 'https://www.youtube.com/watch?v=WUniTVTi_Jk', 1),
    (v_m1, 'The ONLY Video You Need To Understand SEO', 'Explains what SEO actually is and why it determines whether a business shows up when customers search for it.', 'https://www.youtube.com/watch?v=pIbQfOcsEsE', 2),
    (v_m2, 'The BEST Facebook Ads Tutorial for Beginners', 'A practical walkthrough of setting up your first Facebook/Instagram ad campaign, from targeting to budget.', 'https://www.youtube.com/watch?v=BZrio_G_1Cs', 1),
    (v_m2, 'HubSpot Academy: Content Marketing Framework', 'Teaches a simple five-part framework for planning content that actually attracts and keeps an audience.', 'https://www.youtube.com/watch?v=lIf70iMlixc', 2),
    (v_m3, 'Google Analytics Tutorial For Beginners', 'Shows how to set up Google Analytics and read basic traffic reports so you know if a campaign is working.', 'https://www.youtube.com/watch?v=jrNhpd2_auI', 1),
    (v_m3, '10-Minute SEO for Beginners', 'A quick, practical rundown of the SEO actions that produce visible results fastest, good for a first real campaign.', 'https://www.youtube.com/watch?v=5C055eLzbm8', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- ai-tools: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'ai-tools';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Meet Your AI Assistants', 'Setting up and using ChatGPT and Claude for real everyday tasks.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Putting AI Tools to Work', 'Using Gemini and AI image generation for everyday productivity.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Better Results, Faster', 'Writing prompts that work on the first try, and avoiding common AI habits that hurt output quality.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'ChatGPT Tutorial for Beginners', 'Walks complete beginners through setting up ChatGPT and using it for real tasks like emails and summaries.', 'https://www.youtube.com/watch?v=poM2n8fBcag', 1),
    (v_m1, 'Claude AI Tutorial for Beginners', 'A first look at Claude''s chat interface and how it compares to ChatGPT for everyday writing and thinking tasks.', 'https://www.youtube.com/watch?v=r2vYObllqJU', 2),
    (v_m2, 'Google Gemini: Tutorial for Beginners', 'A practical walkthrough of Gemini for everyday uses like drafting content, summarizing documents, and working across Google apps.', 'https://www.youtube.com/watch?v=8aRJYpExTfs', 1),
    (v_m2, 'ChatGPT Image Generator Tutorial for Beginners', 'Shows how to turn a simple prompt or photo into a custom image using ChatGPT''s built-in free image generator, no design skill needed.', 'https://www.youtube.com/watch?v=FvweL4gmLPA', 2),
    (v_m3, 'Master the Perfect ChatGPT Prompt Formula', 'Breaks down a simple, repeatable formula for writing prompts so your answers are useful immediately instead of vague.', 'https://www.youtube.com/watch?v=jC4v5AS4RIM', 1),
    (v_m3, 'You''re Using ChatGPT Wrong', 'Points out habits that quietly make AI answers worse and shows small changes that make everyday AI use noticeably more effective.', 'https://www.youtube.com/watch?v=Y35EHDRNUeo', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- social-media-management: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'social-media-management';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'The Social Media Manager''s Job', 'What the role actually involves day to day, and how to start managing accounts with a plan.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Planning and Scheduling Content', 'Setting up a scheduling workflow and building a consistent posting habit.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Growing and Proving Your Results', 'Which engagement metrics actually matter, and the mistakes to avoid with client accounts.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'What is Social Media Management and How to Get Started?', 'Explains what a social media manager actually does day to day and lays out first steps for managing accounts with a plan instead of posting randomly.', 'https://www.youtube.com/watch?v=mTPMHrXGA54', 1),
    (v_m1, 'Master Social Media Like a Pro', 'An overview from the team behind one of the biggest social media tools, framing the habits that separate organized accounts from chaotic ones.', 'https://www.youtube.com/watch?v=9U2QnmjA0gM', 2),
    (v_m2, 'Hootsuite Platform Training Course', 'An official walkthrough of setting up a scheduling workflow so posts go out across accounts without manual daily posting.', 'https://www.youtube.com/watch?v=xux4dDgJ-58', 1),
    (v_m2, 'Free Social Media Training with Hootsuite Academy', 'Covers building a consistent posting habit and content calendar, a core skill once you''re managing more than one account.', 'https://www.youtube.com/watch?v=_3DqV1ZyYsA', 2),
    (v_m3, 'Social Media Engagement Analysis: The Only Metrics That Matter', 'Breaks down which engagement metrics actually matter so you can judge a post''s performance by more than just likes.', 'https://www.youtube.com/watch?v=Yew2teAsV9E', 1),
    (v_m3, 'Avoid These 5 Common Mistakes in Social Media Management', 'Runs through the most common mistakes new social media managers make with client accounts and simple ways to avoid them.', 'https://www.youtube.com/watch?v=10qRuJDx26c', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- video-editing: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'video-editing';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Video Editing Basics', 'The core concepts and workflow every beginner needs before touching any specific software.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Editing Hands-On in CapCut', 'Importing, trimming, and assembling a basic edit, plus adding transitions.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Editing Like a Pro', 'Planning habits experienced editors use, and a full efficient edit-to-export workflow.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'How to Edit Videos (COMPLETE Beginner''s Guide)', 'Covers the core concepts and workflow every beginner needs before touching any specific editing software.', 'https://www.youtube.com/watch?v=sTqEmGNtNqk', 1),
    (v_m1, 'Best Video Editing App in 2026', 'Compares today''s popular editing apps for phone and desktop, including free options like CapCut, to help you pick the right one to start with.', 'https://www.youtube.com/watch?v=AeQD2mWH9ME', 2),
    (v_m2, 'How to Use CapCut Video Editing', 'A hands-on walkthrough of CapCut showing how to import clips, trim and cut them, and assemble a basic edit from scratch.', 'https://www.youtube.com/watch?v=-BICb3IbEp0', 1),
    (v_m2, 'How to Create Video Transitions', 'Demonstrates how to add smooth transitions between clips so cuts feel intentional instead of jarring.', 'https://www.youtube.com/watch?v=Fj7Xt4vp9-I', 2),
    (v_m3, 'Before You Edit Another Video… Watch This', 'Shares the planning habits experienced editors use before they start cutting, helping beginners skip common time-wasting mistakes.', 'https://www.youtube.com/watch?v=ovvsETM8aPI', 1),
    (v_m3, 'How to Edit YouTube Videos in 2026', 'Shows a full, efficient edit-to-export workflow for a YouTube video, including export settings that keep quality high without huge file sizes.', 'https://www.youtube.com/watch?v=YKyczxU3n3M', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- virtual-assistance-data-entry: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'virtual-assistance-data-entry';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'What a Virtual Assistant Actually Does', 'What the VA role is, why businesses hire one, and the realistic scope of the work.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'VA Tools, Tasks & Data Entry in Action', 'The concrete, hireable skills clients pay for, plus a practical data-entry technique in Excel.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Winning Clients and Working Like a Pro', 'Where to find your first VA clients, and how to price and set boundaries around your work.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'What is a Virtual Assistant?', 'Explains in plain terms what the VA role is and why businesses hire one, a solid starting point before learning any specific task.', 'https://www.youtube.com/watch?v=z5MhZo98lxM', 1),
    (v_m1, 'What Can Virtual Assistants Do (And Definitely Not Do)', 'Breaks down the realistic scope of VA work versus tasks that are usually off-limits, so learners set the right expectations with future clients.', 'https://www.youtube.com/watch?v=0D_qBnth8KA', 2),
    (v_m2, 'The ACTUAL Virtual Assistant Skills Paying Clients Want', 'Walks through the concrete, hireable skills (inbox management, scheduling, basic admin) clients actually pay for, not just theory.', 'https://www.youtube.com/watch?v=bxoqUog_Nu8', 1),
    (v_m2, 'Simple Excel Data Entry Work Form Tutorial', 'Shows how to build a simple Excel data entry form step by step, a practical technique for entering information quickly and consistently.', 'https://www.youtube.com/watch?v=h1NnCf67W1M', 2),
    (v_m3, 'Where Do You Find Clients?', 'A well-known VA trainer shares real places and strategies for finding your first remote VA clients.', 'https://www.youtube.com/watch?v=Y2qflRmOWR0', 1),
    (v_m3, 'Should You Work For Free?', 'A practical, pro-level talk on pricing and boundaries that helps new VAs avoid a common early-career mistake.', 'https://www.youtube.com/watch?v=6P1EKG3yCok', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- copywriting-content-writing: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'copywriting-content-writing';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'What Copywriting Is (and How to Start)', 'What copywriting is, how it differs from general content writing, and the core building blocks of persuasive writing.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Writing Copy That Persuades', 'Writing headlines that grab attention and body copy that moves a reader toward a decision.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Editing, SEO, and Working Like a Pro', 'Common mistakes to edit out of your copy, and simple, repeatable structures for SEO content.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'What Is Copywriting? Content Writing Tutorial For Beginners', 'Explains what copywriting is with real examples and how it differs from general content writing.', 'https://www.youtube.com/watch?v=KEUhLObGI6k', 1),
    (v_m1, 'Basics of Copywriting', 'One of the internet''s best-known copywriting educators breaks down the core building blocks of persuasive writing for beginners.', 'https://www.youtube.com/watch?v=5rsm1MlN-Ik', 2),
    (v_m2, 'How to Write Headlines for Beginner Copywriters', 'Teaches a practical method for writing attention-grabbing headlines, including why you should write many drafts instead of one.', 'https://www.youtube.com/watch?v=45ir4CIHE9s', 1),
    (v_m2, 'How to Write Meaningful Body Copy', 'Shows how to turn a strong headline into persuasive body copy that keeps a reader moving toward a decision, directly useful for product and ad copy.', 'https://www.youtube.com/watch?v=ZOok3Fqgo6o', 2),
    (v_m3, '10 Huge Copywriting Mistakes That Kill Sales Page Conversions', 'A practical checklist of common beginner mistakes to edit out of your own copy before sending it to a client.', 'https://www.youtube.com/watch?v=FxB-WhSZ4wc', 1),
    (v_m3, 'Use These Blog Post Templates to Write Better SEO Content', 'Shows simple, repeatable blog post structures that make writing feel less overwhelming and more likely to rank.', 'https://www.youtube.com/watch?v=fEaoxnf9KNE', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- excel-spreadsheets-for-work: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'excel-spreadsheets-for-work';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Excel & Google Sheets Fundamentals', 'The interface, entering data, and basic formatting from scratch in both tools.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Formulas and Functions in Action', 'How formulas work and the built-in functions used in everyday spreadsheet work.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Pivot Tables, Tips, and Working Like a Pro', 'Summarizing data with pivot tables, plus shortcuts and habits for faster everyday work.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Excel for Beginners - The Complete Course', 'A former Microsoft product manager walks complete beginners through the Excel interface, entering data, and basic formatting from scratch.', 'https://www.youtube.com/watch?v=wbJcJCkBcMg', 1),
    (v_m1, 'Google Sheets: Getting Started', 'Covers the Google Sheets interface and cell basics for anyone new to spreadsheets.', 'https://www.youtube.com/watch?v=HLp6nbp8VIc', 2),
    (v_m2, 'Excel: Intro to Formulas', 'A clear, beginner-friendly walkthrough of how formulas work in Excel, the foundation for every calculation skill after this.', 'https://www.youtube.com/watch?v=xc14gFFyiTw', 1),
    (v_m2, 'Excel: Functions', 'Builds on formulas by introducing built-in functions like SUM and AVERAGE, key tools for everyday spreadsheet work.', 'https://www.youtube.com/watch?v=-9d4m79twdA', 2),
    (v_m3, 'Pivot Table Excel Tutorial', 'A step-by-step beginner''s guide to building your first pivot table to summarize and analyze data quickly.', 'https://www.youtube.com/watch?v=m0wI61ahfLc', 1),
    (v_m3, 'Excel Tips and Tricks', 'A roundup of practical shortcuts and habits that make everyday spreadsheet work faster, useful once the basics are in place.', 'https://www.youtube.com/watch?v=qHaZYN5uINc', 2)
  on conflict (module_id, order_number) do nothing;
end $$;
