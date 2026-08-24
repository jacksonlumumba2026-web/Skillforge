-- Curated catalog day 5 of 6 (same pattern as 0006 / 0012 / 0016 / 0028).
--
-- SIX courses, not ten. Ten topics were researched by five parallel agents;
-- four are deliberately NOT shipped because their videos could not be
-- verified to the standard the rest of the catalog holds — two independent
-- searches confirming both the exact title AND the uploading channel:
--
--   Motion Graphics (After Effects) — 3 of 6 lessons had no confirmable
--     channel; two more were low confidence.
--   Google Analytics 4 — 4 of 6 low confidence, and one lesson had no
--     candidate video found at all.
--   Grant & Proposal Writing — 0 of 6 verified. The one genuinely
--     recognised channel (Learn Grant Writing / Meredith Noble) was
--     confirmed to exist, but no specific video could be tied to it.
--   Creating & Selling Digital Products — 4 of 6 lessons unresolved.
--
-- Those four are worth revisiting; shipping them with guessed channels is
-- not. Day 6 can retry them with a fresh search budget.
--
-- Also note: unlike day 4, every course here sets `category` (the column
-- was added in 0026, after day 4's routine was written, which left those
-- ten courses invisible to the /courses filter chips until 0040 backfilled
-- them).
--
-- Lesson titles below deliberately describe what each video ACTUALLY
-- covers, not the topic originally planned — e.g. the Zapier multi-step
-- video doesn't cover filters, so filters became their own lesson, and the
-- A+ ticketing video is documentation-focused rather than
-- customer-communication-focused.

insert into public.courses (slug, title, description, level, price, published, display_order, category) values
  ('it-support-help-desk', 'IT Support & Help Desk Fundamentals', 'Entry-level IT support skills, built around a repeatable method for diagnosing a user''s problem. By the end you''ll be able to work a support request methodically, handle common Windows faults, use a ticketing system, and know which certification path (CompTIA A+, Google IT Support) employers actually look for.', 'beginner', 500, true, 410, 'tech-programming'),
  ('sql-databases-for-beginners', 'SQL & Databases for Beginners', 'Read and write real SQL queries against a relational database. By the end you''ll be able to select and filter data, combine tables with JOINs, summarise with GROUP BY, and work through a full data-exploration project you can show someone.', 'beginner', 500, true, 420, 'tech-programming'),
  ('cloud-computing-aws-fundamentals', 'Cloud Computing Fundamentals (AWS)', 'Understand what the cloud actually is and get working inside a real AWS account. By the end you''ll be able to navigate the AWS console, explain EC2 and S3, apply basic IAM access controls, and map out the Cloud Practitioner certification path.', 'beginner', 500, true, 430, 'tech-programming'),
  ('workflow-automation-zapier', 'Workflow Automation with Zapier', 'Replace repetitive manual work with automated workflows, without writing code. By the end you''ll be able to build a multi-step Zap with filters, automate a real business process end to end, and understand how people package automation as a paid service.', 'beginner', 500, true, 440, 'productivity-tools'),
  ('sales-lead-generation', 'Sales & Lead Generation for Small Business', 'The full cycle of winning a customer, for people who don''t think of themselves as salespeople. By the end you''ll be able to define who you''re selling to, generate leads, write cold outreach that gets replies, handle objections, and keep customers coming back.', 'beginner', 500, true, 450, 'business-freelancing'),
  ('technical-writing-documentation', 'Technical Writing & Documentation', 'A remote-friendly writing career built on explaining technical things clearly. By the end you''ll be able to write documentation someone can actually follow, understand how API and software docs are structured, use the tools documentation teams work in, and assemble a portfolio to show clients.', 'beginner', 500, true, 460, 'business-freelancing')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- it-support-help-desk
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'it-support-help-desk';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'What the job actually involves day to day, and the hardware you''ll be asked about.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'A repeatable troubleshooting method, and the Windows faults that come up most.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Ticketing, documentation, and the certification path employers recognise.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'What an IT Support Role Involves', 'An introduction to entry-level IT support work from Google''s IT Support Certificate series.', 'https://www.youtube.com/watch?v=lJC_sJ6jhDo', 1),
    (v_m1, 'Computer Hardware Basics', 'CPU, RAM, storage, and motherboard — the components every support technician gets asked about.', 'https://www.youtube.com/watch?v=C0F-yIZIQfE', 2),
    (v_m2, 'The Troubleshooting Method', 'CompTIA''s six-step troubleshooting methodology — how to diagnose a fault instead of guessing.', 'https://www.youtube.com/watch?v=_MhEZbyHbyk', 1),
    (v_m2, 'Troubleshooting Windows', 'Diagnosing the common Windows problems that fill a help desk queue.', 'https://www.youtube.com/watch?v=WJOV5QjCiUU', 2),
    (v_m3, 'Ticketing Systems and Documentation', 'How support tickets are logged, tracked, and documented in a real support team.', 'https://www.youtube.com/watch?v=0P-9PYVpQK4', 1),
    (v_m3, 'Getting Certified: The CompTIA A+ Path', 'How the A+ exams work and how to prepare for them, from a long-running A+ trainer.', 'https://www.youtube.com/watch?v=AIfIA7hEgrw', 2);
end $$;

-- ---------------------------------------------------------------------------
-- sql-databases-for-beginners
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'sql-databases-for-beginners';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'What a database is, why tables relate to each other, and your first SELECT.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Narrowing results down, and pulling data from more than one table at once.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Summarising data, and a full exploration project worth showing someone.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'What a Database Is and Why SQL Matters', 'Start with the opening chapters ("What is a Database?" and "Tables & Keys") of this full course — the rest is a useful reference to return to later.', 'https://www.youtube.com/watch?v=HXV3zeQKqGY', 1),
    (v_m1, 'SELECT Basics: Retrieving Data', 'Your first real queries — SELECT and FROM, and reading what comes back.', 'https://www.youtube.com/watch?v=PyYgERKq25I', 2),
    (v_m2, 'Filtering Data with WHERE', 'Narrowing a result set down to just the rows you actually want.', 'https://www.youtube.com/watch?v=A9TOuDZTPDU', 1),
    (v_m2, 'JOINs: Combining Data Across Tables', 'INNER, LEFT, and RIGHT joins — pulling related data out of separate tables.', 'https://www.youtube.com/watch?v=0OQJDd3QqQM', 2),
    (v_m3, 'Grouping and Sorting: GROUP BY and ORDER BY', 'Aggregate functions, grouping rows into summaries, and ordering the output.', 'https://www.youtube.com/watch?v=LXwfzIRD-Ds', 1),
    (v_m3, 'A Full SQL Data Exploration Project', 'Working through a real dataset end to end — the kind of project that belongs in a portfolio.', 'https://www.youtube.com/watch?v=qfyynHBFOsM', 2);
end $$;

-- ---------------------------------------------------------------------------
-- cloud-computing-aws-fundamentals
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'cloud-computing-aws-fundamentals';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'What cloud computing means in practice, and finding your way around AWS.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'The two AWS services almost every project touches: EC2 and S3.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Controlling who can do what, and the certification route into cloud work.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'What Cloud Computing Actually Is', 'Renting computing power instead of owning it — the model behind every cloud provider.', 'https://www.youtube.com/watch?v=RWgW-CgdIk0', 1),
    (v_m1, 'The AWS Management Console Tour', 'Finding your way around the AWS console as a new user.', 'https://www.youtube.com/watch?v=i331jNgsL_4', 2),
    (v_m2, 'EC2: Virtual Servers Explained', 'What an EC2 instance is and when you''d launch one.', 'https://www.youtube.com/watch?v=8TlukLu11Yo', 1),
    (v_m2, 'S3: Cloud Storage Explained', 'Object storage, buckets, and what S3 is actually good for.', 'https://www.youtube.com/watch?v=ecv-19sYL3w', 2),
    (v_m3, 'IAM: Controlling Who Can Do What', 'Users, roles, and permissions — the access-control layer underneath every AWS account.', 'https://www.youtube.com/watch?v=GjVFf83dcE8', 1),
    (v_m3, 'The AWS Cloud Practitioner Certification Path', 'What the entry-level AWS certification covers and how people prepare for it.', 'https://www.youtube.com/watch?v=hekG3zWJdLw', 2);
end $$;

-- ---------------------------------------------------------------------------
-- workflow-automation-zapier
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'workflow-automation-zapier';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'What automation can take off your plate, and building your first working Zap.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Chaining several steps together and stopping a Zap from running when it shouldn''t.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Automating a real business process, and charging for the skill.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'What Workflow Automation Can Replace', 'Triggers and actions — the basic shape of every automation, from Zapier''s own intro series.', 'https://www.youtube.com/watch?v=u82wFcij_qU', 1),
    (v_m1, 'Building Your First Zap', 'Connecting two apps and getting a working automation running end to end.', 'https://www.youtube.com/watch?v=Ia1583VeyjA', 2),
    (v_m2, 'Multi-Step Zaps', 'Chaining several actions together so one trigger does real work.', 'https://www.youtube.com/watch?v=CS58D_uhOzI', 1),
    (v_m2, 'Filtering with Filter by Zapier', 'Making a Zap run only when the conditions you care about are met.', 'https://www.youtube.com/watch?v=QYezEUw3c7Y', 2),
    (v_m3, 'Automating a Real Business Workflow', 'Taking a complete business process and automating it from start to finish.', 'https://www.youtube.com/watch?v=ZwnS2UaPs6w', 1),
    (v_m3, 'Selling Automation as a Service', 'How people turn automation skills into paid client work.', 'https://www.youtube.com/watch?v=RC_JkBjf1Hk', 2);
end $$;

-- ---------------------------------------------------------------------------
-- sales-lead-generation
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'sales-lead-generation';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'Selling without being pushy, and working out exactly who you''re selling to.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'Generating leads, and reaching people who''ve never heard of you.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Getting past objections, and turning one sale into repeat business.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'Sales Fundamentals for People Who Hate Selling', 'The basics of moving a conversation toward a decision, without the hard-sell clichés.', 'https://www.youtube.com/watch?v=ZfeucFcUP0w', 1),
    (v_m1, 'Identifying Your Ideal Customer', 'A step-by-step framework for defining the audience actually worth your time.', 'https://www.youtube.com/watch?v=6mugRyElbd0', 2),
    (v_m2, 'Lead Generation That Actually Works', 'A practical strategy for turning website and social traffic into real leads.', 'https://www.youtube.com/watch?v=5peeYHVV08k', 1),
    (v_m2, 'Cold Email That Gets Replies', 'Writing cold emails to prospective clients that get opened and answered.', 'https://www.youtube.com/watch?v=dWr_GDe-1io', 2),
    (v_m3, 'Handling Objections', 'What to say when a prospect pushes back on price, timing, or trust.', 'https://www.youtube.com/watch?v=rM_kC8rO9jI', 1),
    (v_m3, 'Building Repeat Customers', 'Retention tactics that turn a one-off buyer into a returning one.', 'https://www.youtube.com/watch?v=Y6IBkNNkfJg', 2);
end $$;

-- ---------------------------------------------------------------------------
-- technical-writing-documentation
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid; v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'technical-writing-documentation';

  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Getting Started', 'What technical writers do, and what makes technical writing clear.', 1) returning id into v_m1;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills in Practice', 'How real documentation gets written, including API and software docs.', 2) returning id into v_m2;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'The tools documentation teams use, and a portfolio that gets you hired.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m1, 'What a Technical Writer Actually Does', 'The day-to-day reality of the role, and where technical writers work.', 'https://www.youtube.com/watch?v=8LewoMIyQfw', 1),
    (v_m1, 'The Principles of Clear Technical Writing', 'Audience, structure, definitions, and clarity — a full beginner course in the craft.', 'https://www.youtube.com/watch?v=vT5pcc30Ffw', 2),
    (v_m2, 'How Professional Technical Documents Get Written', 'The real process: prewriting, research, and working with subject-matter experts.', 'https://www.youtube.com/watch?v=urOLNxRm2KM', 1),
    (v_m2, 'API Documentation Basics', 'How software and API documentation is structured, from a full best-practices course.', 'https://www.youtube.com/watch?v=0CSyIBHQy9g', 2),
    (v_m3, 'The Tools Technical Writers Use', 'Docs-as-code in practice — Markdown, VS Code, Git, and static site generators.', 'https://www.youtube.com/watch?v=btC6KFXtRfM', 1),
    (v_m3, 'Building a Technical Writing Portfolio', 'What a portfolio that actually wins work looks like, with real examples.', 'https://www.youtube.com/watch?v=crePAmhdpww', 2);
end $$;
