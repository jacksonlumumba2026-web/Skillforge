-- Course-depth expansion, batch 4 of ~5. Same pattern as batches 1-3:
-- existing module 3 bumped to position 5, three new modules inserted
-- at 3, 4, 6.

update public.modules set order_number = 5 where id = '9d93f009-961a-4c02-be48-1dc23d422e54'; -- project-management-tools: Running Projects Like a Pro
update public.modules set order_number = 5 where id = '415b1356-5001-4f4b-ba8a-4bbf03688a84'; -- instagram-tiktok-growth: Growing Like a Pro
update public.modules set order_number = 5 where id = '55291168-e69c-4484-88ec-0f36eb97f5b3'; -- google-workspace-productivity: Working Like a Pro
update public.modules set order_number = 5 where id = '49047497-f736-4567-ba0a-a9a13b34528d'; -- python-programming-for-beginners: Working Like a Pro
update public.modules set order_number = 5 where id = '46111cbc-52b8-44de-9aaa-81fcfa262838'; -- data-analysis-visualization: Working Like a Pro
update public.modules set order_number = 5 where id = 'fdda28a5-a2d1-43c0-8958-641f23257cac'; -- bookkeeping-quickbooks: Working Like a Pro

-- ---------------------------------------------------------------------------
-- project-management-tools: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := 'e0c4e391-99a7-4c64-8258-3077b62b17de';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Advanced Workflows: Automations & Connected Databases', 'Goes beyond basic boards/cards into automation rules and linked databases so your workspace updates itself.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Applied Project: Run a Real Project End-to-End', 'Learners set up and actually run one complete project from kickoff to completion in a real board.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance & Career: Getting Paid as a PM/Notion Pro', 'Covers turning project-management-tool fluency into freelance income or a PM career.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Connecting Your Data with Notion Relations & Rollups', 'Link databases together and pull live summary data across them so your Notion workspace updates itself instead of you re-typing information.', 'https://www.youtube.com/watch?v=v4NL7IGRl0Q', 1),
    (v_m3, 'Automating Repetitive Work with Asana Rules', 'Set up if-this-then-that rules in Asana so tasks get assigned, due-dated, and moved automatically without manual busywork.', 'https://www.youtube.com/watch?v=BOnLpqTWRUk', 2),
    (v_m4, 'Building and Running a Full Project Board in Trello', 'Set up and actually run a complete project — lists, cards, labels, due dates, checklists — from kickoff to completion in one Trello board.', 'https://www.youtube.com/watch?v=GvvBQQF1I1Y', 1),
    (v_m4, 'Build a Complete Project Management System in Notion', 'Construct a working project tracker in Notion from a blank page, covering task databases, statuses, and views used to manage real work.', 'https://www.youtube.com/watch?v=9sZ-IB3bttw', 2),
    (v_m6, 'Becoming a Notion Consultant (No Experience Needed)', 'A concrete path from knowing Notion to charging clients for it, including certification and marketplace listing steps.', 'https://www.youtube.com/watch?v=AWWVlbpJPMM', 1),
    (v_m6, '10 Places to Find Freelance Project Management Work', 'Ten specific platforms and channels where freelance/remote project managers actually land paying clients.', 'https://www.youtube.com/watch?v=WJul9B2z7Rk', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- instagram-tiktok-growth: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := 'd1d5c008-f6d8-46d7-8ec6-a0f9434bbeaf';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Algorithm Mastery: What Actually Gets Reach', 'Goes deeper into the specific content formats and hooks the current Instagram/TikTok algorithms reward with reach.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Applied Project: Plan and Produce Real Content', 'Learners plan and edit real, publish-ready content and build out a full posting calendar.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance & Career: Social Media Management for Income', 'Covers turning growth skills into freelance social media management income.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, '7 Reel Types the Instagram Algorithm Currently Favors', 'Breaks down the specific Reel formats the current Instagram algorithm rewards with reach, with concrete examples of each.', 'https://www.youtube.com/watch?v=XPdfSb1umG4', 1),
    (v_m3, 'Writing TikTok Hooks That Stop the Scroll', 'Seven proven hook-writing formulas for the first 3 seconds of a TikTok video that measurably reduce swipe-away rate.', 'https://www.youtube.com/watch?v=OyFwb8ha5Hg', 2),
    (v_m4, 'Editing a Viral-Style Reel in CapCut, Start to Finish', 'Full CapCut workflow — cuts, captions, transitions, audio syncing — used to produce one publish-ready Reel/TikTok.', 'https://www.youtube.com/watch?v=c2u-7fNuits', 1),
    (v_m4, 'Planning 30 Days of Content in One Sitting', 'Build a real 30-day content calendar in one session so posting stays consistent instead of scrambling daily for ideas.', 'https://www.youtube.com/watch?v=i-nQSW-FZNE', 2),
    (v_m6, '35 Places to Find Clients as a Freelance Social Media Manager', 'A concrete list of where to actually find paying social media management clients, not just theory.', 'https://www.youtube.com/watch?v=YeZ3olMSbzs', 1),
    (v_m6, 'What to Charge as a Social Media Manager', 'Real pricing structures — hourly, package, and sample rates — for quoting social media management work.', 'https://www.youtube.com/watch?v=U0LQX-tQwvo', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- google-workspace-productivity: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '4a335bba-f8b8-4ff1-9dd5-e4003b9cb196';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Advanced Sheets & Automation with Apps Script', 'Moves beyond basic spreadsheet use into query-based reporting and scripted automation across Workspace apps.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Applied Project: Build a Working Tracker/Dashboard', 'Learners build one real, functional tracker or dashboard from a blank sheet.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance & Career: Becoming a Virtual Assistant', 'Covers turning Google Workspace fluency into freelance virtual assistant income.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Google Sheets QUERY Function for Pivot-Style Reports', 'Use the QUERY function to build pivot-table-style reports that group and summarize data by month/year automatically.', 'https://www.youtube.com/watch?v=q0B58muHybM', 1),
    (v_m3, 'Google Apps Script for Beginners: Automating Sheets, Docs & Gmail', 'Write your first Apps Script automations to handle repetitive Google Workspace tasks without manual clicking.', 'https://www.youtube.com/watch?v=Nd3DV_heK2Q', 2),
    (v_m4, 'Building a Complete Budget Tracker in Google Sheets', 'Construct a fully functional budget tracker from a blank sheet, including formulas and category breakdowns.', 'https://www.youtube.com/watch?v=bjJf2tnEVsE', 1),
    (v_m4, 'Building a Project/Event Expense Tracker Dashboard', 'Step-by-step build of a real expense-tracking dashboard usable for a business or event budget, with live totals.', 'https://www.youtube.com/watch?v=Dwg9TR8ipLs', 2),
    (v_m6, 'Virtual Assistant Skills Clients Actually Pay For', 'The specific Google Workspace and admin skills that get freelance VAs hired, not generic advice.', 'https://www.youtube.com/watch?v=WAIHsbytK9k', 1),
    (v_m6, 'Getting Your First VA Clients Without Cold Pitching', 'A concrete, non-spammy client-acquisition method for new virtual assistants to land their first paying client.', 'https://www.youtube.com/watch?v=yi61CRE3DRg', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- python-programming-for-beginners: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '9fc81ee6-12bf-4000-8495-07ad815fbdb4';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Python Beyond the Basics', 'Introduces object-oriented programming and proper error handling so code moves past beginner scripts.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Build a Real Python Project', 'Learners build a real, working Python tool — a web scraper and automation scripts — end-to-end.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Python Freelancing & Career Path', 'Covers turning Python skill into freelance gigs or a junior developer portfolio.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Object-Oriented Programming in Python', 'Learn to structure Python code with classes, constructors, inheritance, and getters/setters instead of scattered functions and variables.', 'https://www.youtube.com/watch?v=Ej_02ICOIgs', 1),
    (v_m3, 'Handling Errors with Try/Except', 'Use try/except blocks to catch and handle runtime errors so a script fails gracefully instead of crashing.', 'https://www.youtube.com/watch?v=NIWwJbo-9_8', 2),
    (v_m4, 'Build a Web Scraper with Beautiful Soup', 'Build a working Python script that pulls real data off a live webpage and saves it to a file, start to finish.', 'https://www.youtube.com/watch?v=XVv6mJpFOb0', 1),
    (v_m4, 'Build 3 Python Automation Scripts', 'Build three practical automation tools (multi-clipboard, weather fetcher, email sender) you can actually use day to day.', 'https://www.youtube.com/watch?v=v-pUon2F5L8', 2),
    (v_m6, 'Landing Freelance Jobs with Python', 'Turn basic Python skills into paid freelance automation gigs, even with no prior client work.', 'https://www.youtube.com/watch?v=kFhOLYaosDc', 1),
    (v_m6, '5 Python Portfolio Projects That Get You Hired', 'Pick and build the specific portfolio projects that hiring managers actually want to see from a junior Python developer.', 'https://www.youtube.com/watch?v=prwrk0GikqI', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- data-analysis-visualization: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := 'c2eca76b-a87d-4bbd-a537-58c25d90acfe';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Advanced Data Wrangling & Visualization', 'Moves beyond basic pandas into grouping, merging, and cleaning messy multi-file datasets like a working analyst.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Real-World Data Analytics Project', 'Learners take a real dataset through cleaning, analysis, and a client-ready dashboard, start to finish.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance & Career Path for Data Analysts', 'Covers turning data analysis skill into freelance income or a hireable analyst portfolio.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Advanced Pandas: GroupBy, Merge & Cleaning', 'Go beyond basic pandas to group, merge, and clean messy multi-file datasets the way working analysts do.', 'https://www.youtube.com/watch?v=2uvysYbKdjM', 1),
    (v_m3, 'Building a Marketing Dashboard with Matplotlib & Seaborn', 'Turn raw KPI data into a polished multi-chart dashboard using Matplotlib and Seaborn together.', 'https://www.youtube.com/watch?v=2r7g1mdjXWQ', 2),
    (v_m4, 'End-to-End Data Analytics Project (Python + SQL)', 'Pull a real dataset via the Kaggle API, clean it, analyze it with SQL and Python, and present findings, start to finish.', 'https://www.youtube.com/watch?v=uL0-6kfiH3g', 1),
    (v_m4, 'Build a Complete Power BI Dashboard Project', 'Connect a real dataset, clean it, and build an interactive Power BI dashboard with filters and slicers a client could use.', 'https://www.youtube.com/watch?v=UqrsTIiOnO4', 2),
    (v_m6, 'How to Become a Freelance Data Analyst', 'Steps to package your analysis skills into freelance income: niche, portfolio, and where to find first clients.', 'https://www.youtube.com/watch?v=kNeQGaVx2tg', 1),
    (v_m6, '3 Data Analyst Portfolio Projects to Get Hired', 'Build the specific 3-project portfolio pattern that recruiters and hiring managers respond to for data analyst roles.', 'https://www.youtube.com/watch?v=csRFfm-BwE0', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- bookkeeping-quickbooks: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := 'ebcd254b-df64-476f-b9b4-26232762a2f3';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Reports & Smart Automation in QuickBooks', 'Moves beyond basic entry into reading financial reports and automating transaction categorization.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Set Up a Real Small Business''s Books', 'Learners set up a real chart of accounts and reconcile an actual bank statement.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance Bookkeeping Business', 'Covers turning QuickBooks skill into a freelance bookkeeping business with real clients.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Reading Profit & Loss and Balance Sheet Reports', 'Generate and interpret a business''s P&L and balance sheet in QuickBooks Online to answer "is this business making money."', 'https://www.youtube.com/watch?v=ptyJvqHQMxs', 1),
    (v_m3, 'Automating Categorization with Bank Rules', 'Set up bank rules in QuickBooks Online so recurring transactions categorize themselves instead of manual entry every time.', 'https://www.youtube.com/watch?v=TNNp59A3WuE', 2),
    (v_m4, 'Setting Up a Company''s Chart of Accounts', 'Build a real chart of accounts in QuickBooks Online from scratch for a new small business client.', 'https://www.youtube.com/watch?v=uQmB23dXtbU', 1),
    (v_m4, 'Reconciling a Bank Account End to End', 'Reconcile a business bank account against a real statement in QuickBooks Online, including fixing discrepancies.', 'https://www.youtube.com/watch?v=gmN331eEB-k', 2),
    (v_m6, 'Getting Your First Bookkeeping Client', 'A concrete plan for landing your first paying bookkeeping client, even with no prior client experience.', 'https://www.youtube.com/watch?v=uof5hCTnIrY', 1),
    (v_m6, 'Pricing Your Bookkeeping Services', 'How to build tiered pricing packages for bookkeeping clients instead of guessing an hourly rate.', 'https://www.youtube.com/watch?v=G1Y9eeDLeLI', 2)
  on conflict (module_id, order_number) do nothing;
end $$;
