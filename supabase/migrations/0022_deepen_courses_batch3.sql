-- Course-depth expansion, batch 3 of ~6. Same pattern as batches 1-2:
-- existing module 3 bumped to position 5, three new modules inserted
-- at 3, 4, 6.

update public.modules set order_number = 5 where id = 'a775df1e-95fa-41cf-afa4-84062a9cc8e6'; -- ecommerce-online-selling: Working Like a Pro
update public.modules set order_number = 5 where id = '318e83e1-cbda-447d-975d-38754b687d9c'; -- email-marketing: Working Like a Pro
update public.modules set order_number = 5 where id = 'b154c7dc-a5e4-45bc-a7a2-c739f35817c4'; -- cybersecurity-online-safety: Protecting Yourself and Your Business
update public.modules set order_number = 5 where id = 'f3845696-71e9-4d18-a9d8-36726579ee37'; -- presentation-design: Working Like a Pro
update public.modules set order_number = 5 where id = '3b5613f4-b983-448f-8c41-c24cecbde571'; -- seo-search-engine-optimization: Working Like a Pro
update public.modules set order_number = 5 where id = 'd993cc04-aa20-4c81-bb2d-6db664fd8db3'; -- google-facebook-ads: Reading Results & Avoiding Rookie Mistakes

-- ---------------------------------------------------------------------------
-- ecommerce-online-selling: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := 'cd5763ec-82e4-46ae-a45e-00e32deeb6a9';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Store Optimization', 'Sharpens the visual and written presentation of a store so browsers actually convert into buyers.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Running a Real Store Launch', 'Takes a store from "built" to "live" by planning and executing a real product launch that drives traffic and sales.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Scaling & Freelance E-commerce Services', 'Handling fulfillment as a store grows, and turning store-setup skills into freelance income.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'How to Write High-Converting Product Descriptions', 'Practical copywriting techniques for product photos/descriptions that turn store visitors into paying customers.', 'https://www.youtube.com/watch?v=P_qbXe0la88', 1),
    (v_m3, 'How to Upsell and Cross-Sell Products on Your Online Store', 'Concrete techniques for adding upsell and cross-sell offers on product pages/checkout to raise order value.', 'https://www.youtube.com/watch?v=H9d1hS2s9No', 2),
    (v_m4, 'Pre-Launch Strategy To Launch Your Products For Ecommerce', 'A step-by-step pre-launch plan for building buzz before a new store/product goes live.', 'https://www.youtube.com/watch?v=hnVNj_cNFHY', 1),
    (v_m4, 'How To Get Traffic To Your eCommerce Store', 'Practical methods for driving the first wave of visitors and sales to a newly launched store.', 'https://www.youtube.com/watch?v=rfOPJRLKATc', 2),
    (v_m6, 'Ultimate Guide to Ecommerce Order Fulfillment', 'Covers pick-pack-ship, self-fulfillment, and 3PL options for handling rising order volume.', 'https://www.youtube.com/watch?v=XJz0u6G-KcQ', 1),
    (v_m6, 'How to Start Freelancing as a Beginner Shopify Developer', 'First steps toward offering store setup as a paid freelance service to small businesses.', 'https://www.youtube.com/watch?v=29WA73Ilq4g', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- email-marketing: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '80f5bd3c-382c-4c5d-9259-a5d035c0c7ec';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Email Strategy', 'Moves beyond one-size-fits-all sends by targeting segments and proving what works through testing.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Running a Real Email Campaign', 'Plans and sends an actual multi-email sequence, from strategy through the emails themselves.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance Email Marketing', 'Turns email marketing skill into a freelance service, from positioning to landing and pricing clients.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, '8 Best Ways To Segment Your Email List', 'Practical ways to split a list into segments so campaigns feel relevant to each subscriber.', 'https://www.youtube.com/watch?v=ez1WOe1c5XU', 1),
    (v_m3, 'How To A/B Test Your Email Subject Lines to Increase Open Rates', 'How to set up and read A/B tests on subject lines/content to improve performance.', 'https://www.youtube.com/watch?v=ClaFmZA2OlY', 2),
    (v_m4, 'Swipe My Launch Email Sequence Strategy', 'Breaks down how to plan a multi-email launch sequence, including timing and each email''s role.', 'https://www.youtube.com/watch?v=Pk13zUNrdc4', 1),
    (v_m4, 'Write These Emails for Your Next Launch', 'A practical walkthrough of writing the individual emails in a launch/promo sequence.', 'https://www.youtube.com/watch?v=qccZqCjVl2U', 2),
    (v_m6, 'Freelance Email Marketing 101: What You Need to Know', 'Fundamentals of starting to offer email marketing as a freelance service.', 'https://www.youtube.com/watch?v=158PdThI2Rc', 1),
    (v_m6, 'How Much To Charge For Email Marketing Freelance', 'Guidance on pricing email marketing services for freelance clients.', 'https://www.youtube.com/watch?v=5PAUtf2mpOQ', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- cybersecurity-online-safety: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := 'bb0d0b5f-ebb4-4888-af6d-35c5915bf453';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Threat Awareness', 'Goes beyond phishing basics into recognizing malware/ransomware and wider social engineering tricks.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Securing a Real Small Business', 'Backing up data, locking down devices/network, and responding when something goes wrong.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Cybersecurity as a Career or Side Skill', 'Entry-level career paths/certifications, or turning security know-how into side income.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Malware Explained: How to Spot and Avoid Common Cyber Threats', 'What malware/ransomware are, how attacks unfold, and warning signs to watch for.', 'https://www.youtube.com/watch?v=3N3zE3kRrv8', 1),
    (v_m3, 'Common Social Engineering Techniques Explained', 'Covers social engineering tactics beyond phishing, including pretexting and baiting.', 'https://www.youtube.com/watch?v=ngUMyW3kDUU', 2),
    (v_m4, 'How to Secure Your Small Business Network', 'Practical steps (default settings, VPNs, firewalls) for securing business devices and a small office network.', 'https://www.youtube.com/watch?v=O8LICMwOlsU', 1),
    (v_m4, 'How to Create a Cyber Security Incident Response Plan', 'Basic steps for responding to a security incident so a small business knows what to do.', 'https://www.youtube.com/watch?v=kSSStqXlCtw', 2),
    (v_m6, 'Best Entry-Level Cybersecurity Certifications', 'Overview of beginner certifications (Security+, CEH, CCNA) and the career paths they open up.', 'https://www.youtube.com/watch?v=02gQUHhGZBo', 1),
    (v_m6, 'How to Build a Cybersecurity Side Hustle (Starting from Zero)', 'Shows how to start offering basic security audits/consulting as a side service.', 'https://www.youtube.com/watch?v=aZQ4qbQD504', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- presentation-design: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '664ea25b-6ce5-4dd5-974f-15d20dc02b1c';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Deck Design Techniques', 'Moves beyond basic slide-building into visually communicating data and using motion purposefully rather than decoratively.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Designing a Real Presentation Project', 'Learners build one complete, real-world presentation project end-to-end, from blank slide to polished deck.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance Presentation Design', 'Covers turning deck-design skills into a freelance service, including finding and winning clients.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'How to Add a Chart or Graph to Your PowerPoint Presentation', 'Official Microsoft walkthrough on inserting and editing charts/graphs to present data visually inside a deck.', 'https://www.youtube.com/watch?v=QudIA-ARKo4', 1),
    (v_m3, 'Too Much Animation Ruins Your Presentation', 'Explains why over-animating hurts a presentation and how to use animations and transitions sparingly and purposefully.', 'https://www.youtube.com/watch?v=7xoi4AsHyjM', 2),
    (v_m4, 'How to Make a Pitch Deck That Gets Funded', 'A step-by-step build of an investor pitch deck from scratch, covering structure and content for each slide.', 'https://www.youtube.com/watch?v=Tk-RdCFSrKU', 1),
    (v_m4, 'Create Professional PowerPoint Slides for Business & Finance', 'A full walkthrough building professional business/finance presentation slides from scratch using consulting-style best practices.', 'https://www.youtube.com/watch?v=AC0abCLA4dE', 2),
    (v_m6, 'How to Get Clients for PowerPoint Presentations', 'Practical strategies for finding and landing clients who need presentation/deck design work done.', 'https://www.youtube.com/watch?v=pCalNEcoqKc', 1),
    (v_m6, 'How to Become a Presentation Designer', 'Guidance on building presentation design into a career/freelance path, including positioning and client acquisition.', 'https://www.youtube.com/watch?v=qqSmmsOwpMI', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- seo-search-engine-optimization: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := 'cf93d5fe-0401-492d-a865-dbebc90e43de';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate SEO Techniques', 'Builds on on-page/technical basics with off-page authority building and geo-targeted local ranking tactics.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Running a Real SEO Project', 'Learners audit an actual website and carry out real end-to-end SEO improvements.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance & Agency SEO', 'Covers offering SEO as a paid freelance/agency service, from pricing to client delivery.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Link Building for Beginners: Complete Guide to Get Backlinks', 'Covers link building fundamentals and strategies for earning high-quality backlinks.', 'https://www.youtube.com/watch?v=C5ddo63kHHI', 1),
    (v_m3, 'SEO for Local Businesses — How to Rank #1 in Your City', 'A local SEO framework for ranking a business in a specific city/region in Google search and Maps.', 'https://www.youtube.com/watch?v=tHsnpTEDuvE', 2),
    (v_m4, 'How to Do a Technical SEO Audit', 'A hands-on walkthrough auditing a real site''s technical SEO issues from beginner through advanced checks.', 'https://www.youtube.com/watch?v=ff6gHcnI8ps', 1),
    (v_m4, 'How I Grew Traffic 148% (Real SEO Case Study)', 'A real case study showing the specific improvements made to a site and the traffic results achieved.', 'https://www.youtube.com/watch?v=1onvhfMqFXI', 2),
    (v_m6, 'How To Do Client SEO As a Freelancer', 'Walks through doing SEO work for real clients as a freelancer, with concrete examples and outcomes.', 'https://www.youtube.com/watch?v=bf6KEJnHo-4', 1),
    (v_m6, 'How Much To Charge For SEO', 'A pricing framework for SEO services, useful for setting rates and explaining value/results to clients.', 'https://www.youtube.com/watch?v=EndKYhvyQK8', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- google-facebook-ads: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := 'd2c1698b-e25a-47b5-8d0e-58a8a661acad';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Ad Campaign Skills', 'Sharpens ad copywriting and budget/bidding optimization beyond basic campaign setup.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Running a Real Ad Campaign', 'Learners plan and launch one real paid ad campaign from strategy through to live results.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance Paid Ads Management', 'Covers offering Google/Facebook ads management as a freelance service, including pricing and client reporting.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'How To Write Google Ads Copy That Converts', 'Practical techniques for writing ad copy that drives clicks and conversions.', 'https://www.youtube.com/watch?v=LJmE4YexCUQ', 1),
    (v_m3, 'Google Ads Bidding Optimization Strategies', 'Covers optimizing ad budgets and bidding strategy to get more value from ad spend.', 'https://www.youtube.com/watch?v=X0_EMqaBjCI', 2),
    (v_m4, 'Plan First & Then Create Your Google Ads Campaigns', 'Emphasizes planning campaign strategy and goals before building, as the step before launch.', 'https://www.youtube.com/watch?v=YEunMVx93_4', 1),
    (v_m4, 'Google Ads Case Study — PPC Case Study For Local Business', 'A real campaign case study showing a local business''s PPC campaign from setup to live results.', 'https://www.youtube.com/watch?v=QD9nQ1cmXjs', 2),
    (v_m6, 'Becoming a Google Ads Freelancer', 'Guidance on starting out and getting work as an independent Google Ads freelancer.', 'https://www.youtube.com/watch?v=fSby26aAaBo', 1),
    (v_m6, 'How to Price Your Facebook Ads Management Services', 'A pricing guide for Facebook/Meta ads management services, relevant to quoting and reporting value to clients.', 'https://www.youtube.com/watch?v=NSFvWEJt4_g', 2)
  on conflict (module_id, order_number) do nothing;
end $$;
