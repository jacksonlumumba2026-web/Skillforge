-- Curated catalog day 3 of 6 (see 0006_curated_catalog.sql / 0012_curated_catalog_day2.sql
-- for the same pattern). 10 more real, hand-researched courses — no topic
-- or dominant channel overlap with the 21 courses already in the catalog.

insert into public.courses (slug, title, description, level, price, published, display_order) values
  ('python-programming-for-beginners', 'Python Programming for Beginners', 'Learn Python from scratch — syntax, variables, loops, functions, and real automation scripts. By the end you''ll be able to write working Python programs and start taking on beginner freelance automation gigs.', 'beginner', 500, true, 210),
  ('data-analysis-visualization', 'Data Analysis & Visualization', 'Learn to turn raw data into clear dashboards using Power BI and Google Looker Studio. By the end you''ll be able to build interactive reports and present data insights the way clients and employers expect.', 'beginner', 500, true, 220),
  ('bookkeeping-quickbooks', 'Bookkeeping & QuickBooks for Small Business', 'Learn core bookkeeping principles and how to run them in QuickBooks Online. By the end you''ll be able to record transactions, reconcile accounts, and manage the books for a small business or freelance client.', 'beginner', 500, true, 230),
  ('mobile-photography-content-creation', 'Mobile Photography & Content Creation', 'Learn to shoot professional-looking photos and video using just your smartphone. By the end you''ll be able to produce polished product photos and social media content for a small business without any extra equipment.', 'beginner', 500, true, 240),
  ('podcasting-voice-over', 'Podcasting & Voice-Over Basics', 'Learn how to plan, record, and edit a podcast, and how to break into paid voice-over work as a freelancer. By the end you''ll be able to set up a basic home recording rig, edit a clean episode in Audacity, use proper mic technique, and start pitching for voice-over gigs and podcast monetization.', 'beginner', 500, true, 250),
  ('transcription-translation-freelancing', 'Transcription & Translation Freelancing', 'Learn how to do paid transcription and translation work online, including the tools, platforms, and workflow professionals use. By the end you''ll be able to use transcription and CAT-tool software, work faster and more accurately, and land real freelance transcription/translation jobs.', 'beginner', 500, true, 260),
  ('youtube-channel-growth', 'YouTube Channel Growth & Video SEO', 'Learn how to grow a YouTube channel through smart titles, thumbnails, YouTube SEO, and analytics — without needing to touch video-editing software. By the end you''ll be able to set up a channel correctly, write clickable titles and thumbnails, and use YouTube Analytics and keyword research to grow views.', 'beginner', 500, true, 270),
  ('customer-service-virtual-call-center', 'Customer Service & Virtual Call Center Skills', 'Learn phone and chat etiquette, how to de-escalate difficult customers, and how to land remote customer-support work. By the end you''ll be able to handle live customer interactions professionally and confidently apply for entry-level remote call-center and chat-support jobs.', 'beginner', 500, true, 280),
  ('resume-writing-linkedin-personal-branding', 'Resume Writing, LinkedIn & Personal Branding', 'Learn how to write a resume that gets read, optimize a LinkedIn profile that gets found, and build a personal brand that attracts jobs or freelance clients. By the end you''ll be able to produce a polished resume, an optimized LinkedIn profile, and a clear personal-brand strategy ready to use in a real job or client search.', 'beginner', 500, true, 290),
  ('3d-design-animation-blender', '3D Design & Animation (Blender)', 'Learn to navigate Blender''s interface, model a simple 3D object, and create basic keyframe animations using the free, real Blender software. By the end you''ll be able to comfortably move around a 3D scene, build and light a simple object, and produce a short rendered animation from scratch.', 'beginner', 500, true, 300)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- python-programming-for-beginners: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'python-programming-for-beginners';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'Installing your tools and learning the absolute basics of Python syntax and data.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Hands-on practice with control flow and building complete small programs.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Applying Python to real automation projects and the freelance market.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Python and Visual Studio Code for Beginners', 'Step-by-step install of Python and VS Code and running your first script.', 'https://www.youtube.com/watch?v=-nPaOcSeduA', 1),
    (v_m1, 'Python Variables — Tutorial for Beginners with Examples', 'Introduces variables, data types, and basic Python syntax with clear examples.', 'https://www.youtube.com/watch?v=cQT33yu9pY8', 2),
    (v_m2, 'Loops and Iterations - For/While Loops', 'Teaches for-loops, while-loops, and iteration patterns used in everyday scripts.', 'https://www.youtube.com/watch?v=6iF8Xb7Z3wQ', 1),
    (v_m2, 'Learn Python - Full Course for Beginners', 'A comprehensive walkthrough of functions, data structures, and object-oriented basics by coding real programs.', 'https://www.youtube.com/watch?v=rfscVS0vtbw', 2),
    (v_m3, '3 Python Automation Projects for Beginners', 'Builds three practical automation scripts beginners can adapt for real tasks and clients.', 'https://www.youtube.com/watch?v=v-pUon2F5L8', 1),
    (v_m3, 'How to Land Freelance Jobs with Python', 'Covers how to package Python automation skills into paid freelance work.', 'https://www.youtube.com/watch?v=kFhOLYaosDc', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- data-analysis-visualization: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'data-analysis-visualization';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'First look at Power BI and Looker Studio interfaces and core concepts.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Building real reports and dashboards from start to finish.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Advanced dashboard building and presenting data professionally.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Power BI Tutorial for Beginners (Step-by-Step in 30 Minutes)', 'A quick, practical introduction to the Power BI interface and workflow.', 'https://www.youtube.com/watch?v=OmW9YvxSl1E', 1),
    (v_m1, 'Looker Studio Tutorial For Beginners', 'Introduces Looker Studio''s interface and how to connect and visualize a data source.', 'https://www.youtube.com/watch?v=G3vId_g4pM8', 2),
    (v_m2, 'Complete Power BI Tutorial for Beginners in 3 Hours', 'Hands-on practice importing data, creating visuals, and building a Power BI report.', 'https://www.youtube.com/watch?v=2d2WWf68WcQ', 1),
    (v_m2, 'Build Your First Dashboard — Looker Studio Full Tutorial', 'Walks through building a complete marketing-style dashboard in Looker Studio.', 'https://www.youtube.com/watch?v=Tp5yEbDh-fw', 2),
    (v_m3, 'Power BI Dashboard Tutorial — Full Project with DAX', 'Builds a full end-to-end Power BI dashboard project using DAX formulas.', 'https://www.youtube.com/watch?v=WH937Gc_8eg', 1),
    (v_m3, 'Storytelling with Data (Crash Course)', 'Teaches how to present charts and dashboards as a clear, persuasive story for stakeholders.', 'https://www.youtube.com/watch?v=ptsmJveoH2g', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- bookkeeping-quickbooks: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'bookkeeping-quickbooks';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'Core bookkeeping concepts and your first look at QuickBooks Online.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Hands-on transaction entry and account reconciliation.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Applying bookkeeping skills to real small businesses and freelance clients.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'The Bookkeeping Basics for Beginners', 'Explains foundational bookkeeping concepts like recording transactions and tracking finances.', 'https://www.youtube.com/watch?v=pKpdibyljR4', 1),
    (v_m1, 'QuickBooks Online Tutorial for Beginners (Everything You Need)', 'Walks through setting up QuickBooks Online and handling invoices, bills, and expenses.', 'https://www.youtube.com/watch?v=wJ82MXMkERQ', 2),
    (v_m2, 'QuickBooks Online: The Complete Tutorial', 'In-depth, hands-on practice entering transactions and using core QuickBooks Online features.', 'https://www.youtube.com/watch?v=jOtsT91SZ2A', 1),
    (v_m2, 'How to Reconcile Your Accounts in QuickBooks Online', 'Teaches the reconciliation process to match QuickBooks records with real bank statements.', 'https://www.youtube.com/watch?v=YTss2L7Fo3Q', 2),
    (v_m3, 'Easy Bookkeeping Steps for Beginners (QuickBooks Online)', 'A practical, real-business walkthrough of monthly bookkeeping tasks in QuickBooks.', 'https://www.youtube.com/watch?v=dRpHKba6pbg', 1),
    (v_m3, 'How To Start a Bookkeeping Business', 'Covers what you need to learn and how to land your first client as a freelance bookkeeper.', 'https://www.youtube.com/watch?v=KE1QiBmg3Zc', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- mobile-photography-content-creation: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'mobile-photography-content-creation';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'Smartphone camera basics and fundamental shooting techniques.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Practicing composition, lighting, and video capture techniques.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Real-world content creation for small business marketing.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, '12 Tips and Tricks for Better Smartphone Photos', 'Covers essential camera settings and framing tricks that most beginners overlook.', 'https://www.youtube.com/watch?v=DWZ1LqZNrp4', 1),
    (v_m1, 'iPhone Photography Fundamentals & Tips', 'Teaches the fundamentals of shooting with a phone''s native camera app, including portraits.', 'https://www.youtube.com/watch?v=nsRXzOxkSQ0', 2),
    (v_m2, '10 Pro iPhone Photography Tips for Incredible Photos', 'Hands-on composition and lighting techniques for consistently better phone photos.', 'https://www.youtube.com/watch?v=-9VLquSNulE', 1),
    (v_m2, 'Vertical Video Setup for Instagram Reels, TikTok & YouTube Shorts', 'Shows how to set up and shoot stable, well-framed vertical video on a phone.', 'https://www.youtube.com/watch?v=6bAbxihBJPQ', 2),
    (v_m3, 'How To Shoot Epic Product Photography With a Phone', 'Teaches phone-only product photography techniques small businesses can use for listings and ads.', 'https://www.youtube.com/watch?v=FyL1Omm6dFs', 1),
    (v_m3, 'How To Shoot Vertical Videos For Social Content', 'Covers shooting techniques for producing engaging vertical social media content.', 'https://www.youtube.com/watch?v=0zgr98iaGFg', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- podcasting-voice-over: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'podcasting-voice-over';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'Set up the gear and mindset you need before recording your first episode.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Hands-on recording and editing skills using free, accessible tools.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Turning the skill into paid freelance income.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Best Podcast Equipment for Beginners (Under $100!)', 'A budget breakdown of the microphone, headphones, and basic accessories a beginner needs to start recording.', 'https://www.youtube.com/watch?v=PPt0obqB_-I', 1),
    (v_m1, 'How to Get Started in Voice Over for Beginners: Complete Guide', 'An overview of what voice-over work involves and the first steps to take if you want to do it as a freelancer.', 'https://www.youtube.com/watch?v=op22hCQPPeU', 2),
    (v_m2, 'Audacity Beginners Guide | Editing Your Podcast', 'A walkthrough of editing a raw podcast recording in Audacity, including balancing volume and cutting mistakes.', 'https://www.youtube.com/watch?v=R_mDWE83TfI', 1),
    (v_m2, 'How to Use a Mic Like a Pro (Microphone Technique)', 'Practical mic positioning, distance, and angle techniques to sound clearer and more professional immediately.', 'https://www.youtube.com/watch?v=QTaYtWjT2Bo', 2),
    (v_m3, 'Best Places To Find Voiceover Jobs Right Now', 'A rundown of real platforms and casting sites where beginners can find paid voice-over work.', 'https://www.youtube.com/watch?v=f6M04uu3aqM', 1),
    (v_m3, 'How to Make Money Podcasting', 'Covers realistic monetization paths for a podcast, from sponsorships to audience-based revenue.', 'https://www.youtube.com/watch?v=b1Z5LjYzyUs', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- transcription-translation-freelancing: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'transcription-translation-freelancing';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'What these two freelance skills actually involve and how to break in.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Learning the actual software tools used in paid transcription and translation work.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Speed, accuracy, and productivity techniques professionals rely on.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'How to Become a Transcriptionist with No Experience', 'Explains what transcription work is and the realistic first steps to landing your first paid gig.', 'https://www.youtube.com/watch?v=cL_nxsFe8zI', 1),
    (v_m1, 'How to Become a Freelance Translator Online', 'Covers what freelance translation work looks like and how a beginner can start finding clients.', 'https://www.youtube.com/watch?v=-r06iIISxQE', 2),
    (v_m2, 'Express Scribe Transcription Software Tutorial', 'A walkthrough of Express Scribe, the industry-standard free transcription playback/typing tool.', 'https://www.youtube.com/watch?v=FfAqdo67Tts', 1),
    (v_m2, 'OmegaT CAT Tool Tutorial for Beginner Translators', 'Introduces OmegaT, a free CAT (computer-assisted translation) tool, and how to use it on a first project.', 'https://www.youtube.com/watch?v=h4Vy0y9KQUE', 2),
    (v_m3, 'How to Improve Your Transcription Skills: Tips and Techniques', 'Practical tips for increasing typing speed and transcription accuracy on real audio.', 'https://www.youtube.com/watch?v=4GDFhhWpfGE', 1),
    (v_m3, 'CAT Tools Increase Productivity (Freelance Translator)', 'How professional translators use CAT tool features (translation memory, matches) to work faster and more consistently.', 'https://www.youtube.com/watch?v=VWnspvHKsWw', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- youtube-channel-growth: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'youtube-channel-growth';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'Setting up a channel correctly and understanding how YouTube decides what to show viewers.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Hands-on skills for making videos that get clicked on.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Using data and keyword research the way professional creators do.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'How to Create a YouTube Channel for Beginners (Step-by-Step)', 'A full walkthrough of creating and correctly setting up a new YouTube channel, including settings beginners often miss.', 'https://www.youtube.com/watch?v=0qQa8gCvAwc', 1),
    (v_m1, 'The YouTube Algorithm Explained', 'A plain-language explanation of how the YouTube recommendation algorithm decides which videos to promote.', 'https://www.youtube.com/watch?v=NplQ-5IzbOg', 2),
    (v_m2, 'How to Make Thumbnails That Get Views', 'A practical guide to designing thumbnails that grab attention and improve click-through rate, with no design background needed.', 'https://www.youtube.com/watch?v=AR1RjNQdpzc', 1),
    (v_m2, 'How to Write Clickable Titles for Every Video', 'A framework for writing video titles that get more clicks while still describing the content honestly.', 'https://www.youtube.com/watch?v=-5uzJONGZpk', 2),
    (v_m3, 'How to Use YouTube Analytics to Grow Your Channel', 'Shows how to read YouTube Studio analytics (views, watch time, audience retention) to make better content decisions.', 'https://www.youtube.com/watch?v=2O6TXdH_2AA', 1),
    (v_m3, 'YouTube SEO Keyword Research Tutorial', 'A step-by-step keyword research process for optimizing video titles, descriptions, and tags for search.', 'https://www.youtube.com/watch?v=yewWGo03L6o', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- customer-service-virtual-call-center: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'customer-service-virtual-call-center';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'Learn the core etiquette and communication basics every customer service agent needs before taking a live call or chat.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Practice the de-escalation techniques needed to keep difficult calls calm and productive.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Apply your customer-service skills toward landing a real remote support job.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, '10 Telephone Customer Service Tips', 'Covers foundational phone etiquette, from greetings to tone of voice, that every call center agent should master.', 'https://www.youtube.com/watch?v=MGKhCFIUwq8', 1),
    (v_m1, 'How to Excel as a Chat Support Agent: 10 Proven Tips', 'Introduces best practices for written/chat-based support, including response speed and tone, to keep customer satisfaction high.', 'https://www.youtube.com/watch?v=OmyN5Lm36ZY', 2),
    (v_m2, 'Customer Service Training | Master Handling Difficult Phone Calls', 'Demonstrates practical techniques for staying calm, de-escalating, and resolving frustrated customers'' concerns over the phone.', 'https://www.youtube.com/watch?v=eIj7KpobUzc', 1),
    (v_m2, 'Call Center Training | Handling Difficult Phone Calls', 'Walks through step-by-step approaches agents can use to handle difficult and emotional callers professionally.', 'https://www.youtube.com/watch?v=ZiKPH4w7hX0', 2),
    (v_m3, 'How to Get a Remote Job with No Experience — Customer Support', 'Explains realistic strategies for breaking into remote customer-support roles even without prior work experience.', 'https://www.youtube.com/watch?v=sxcMbK3TxGk', 1),
    (v_m3, 'How to Land a Remote Customer Service Job', 'Covers how to search for, apply to, and secure a legitimate work-from-home customer service position.', 'https://www.youtube.com/watch?v=Pzd2oAbV694', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- resume-writing-linkedin-personal-branding: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'resume-writing-linkedin-personal-branding';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'Build the foundational resume and LinkedIn profile every job or freelance search starts with.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Sharpen your resume and personal brand so they stand out to both software and humans.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Turn your brand and profile into real interview calls and freelance clients.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'How to Write a Resume With No Experience (Free Template)', 'Walks beginners through structuring a resume from scratch, even without prior work history, using a free template.', 'https://www.youtube.com/watch?v=XJRYAkFXOkw', 1),
    (v_m1, 'How to Make Your LinkedIn Profile Discoverable to Recruiters', 'Shows six practical profile settings and choices that make a LinkedIn profile more likely to be found by recruiters.', 'https://www.youtube.com/watch?v=beGvKHnZU80', 2),
    (v_m2, 'The Best Resume Template for ATS Scanners (and How to Keyword It)', 'Teaches how to format and keyword a resume so it passes automated applicant tracking systems before a human sees it.', 'https://www.youtube.com/watch?v=xM9i5M2AFGE', 1),
    (v_m2, 'Beyond the Resume: Personal Branding Strategies for Job Seekers', 'Explains how to build a personal-brand narrative that goes beyond the resume to make job seekers memorable to employers.', 'https://www.youtube.com/watch?v=4eYV5dGVqgk', 2),
    (v_m3, 'How I Optimized My LinkedIn Profile and Got 20+ Interview Calls', 'A real-world case study showing the specific profile changes that led directly to a surge in recruiter interview requests.', 'https://www.youtube.com/watch?v=dQ6RNltrXro', 1),
    (v_m3, 'Get Clients On Repeat: 5 Keys To Build A Freelance Personal Brand', 'Shows freelancers five key personal-branding moves for consistently attracting and retaining paying clients.', 'https://www.youtube.com/watch?v=dj3IrEB59Zs', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- 3d-design-animation-blender: 3 modules, 6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = '3d-design-animation-blender';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'Get comfortable moving around Blender''s interface and viewport before building anything.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Model your first simple 3D object using Blender''s core modeling tools.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Bring your model to life with animation and produce a finished, rendered result.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Blender Beginner Tutorial - Part 1', 'Introduces total beginners to Blender''s workspace and the most common tools they''ll use in every project.', 'https://www.youtube.com/watch?v=98qKfdJRzr0', 1),
    (v_m1, 'Blender for Complete Beginners: Navigation & Shortcut Keys', 'Covers essential 3D viewport navigation and keyboard shortcuts that make working in Blender faster and less frustrating.', 'https://www.youtube.com/watch?v=sgMfEq3pDE0', 2),
    (v_m2, 'Blender Tutorial for Absolute Beginners: Basic Modeling', 'Guides absolute beginners through modeling a simple object step by step using Blender''s basic modeling tools.', 'https://www.youtube.com/watch?v=STGSzMfQFoA', 1),
    (v_m2, '3D Modeling for Beginners (Blender Tutorial)', 'Reinforces core modeling workflows and techniques that apply to modeling almost any simple object in Blender.', 'https://www.youtube.com/watch?v=SAcHh9_ZG6A', 2),
    (v_m3, 'The Basics of Animation & Keyframes in Blender', 'Teaches how to animate an object''s location, rotation, and scale over time using keyframes.', 'https://www.youtube.com/watch?v=xACMr9nFELU', 1),
    (v_m3, 'Rendering - Blender Beginner Tutorial', 'Covers render engines and lighting settings needed to produce a finished, polished render of your first Blender project.', 'https://www.youtube.com/watch?v=ZTxBrjN1ugA', 2)
  on conflict (module_id, order_number) do nothing;
end $$;
