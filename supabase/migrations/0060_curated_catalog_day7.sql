-- Curated catalog day 7. ONE course: Power BI for Data Reporting.
--
-- Attribution is no longer the bottleneck. The YouTube Data API returns the
-- uploading channel directly, so the verification work that limited day 5
-- (6 of 10) and day 6 (1 of 6) now takes seconds. Every id below was
-- confirmed for channel, exact title, duration and embeddability before a
-- word of lesson content was written.
--
-- The constraint has moved to TOPIC SUPPLY. The catalogue is 48 courses and
-- the obvious in-demand subjects are taken. Candidates were checked against
-- live slugs and rejected for overlap rather than for weak sourcing:
--   CapCut mobile video editing  -> video-editing already teaches CapCut
--   Google Sheets automation     -> overlaps excel-spreadsheets-for-work
--                                   and google-workspace-productivity
--   Notion for Work & Business   -> project-management-tools covers Notion
--   Customer support tooling     -> customer-service-virtual-call-center
--   Voice-over production        -> podcasting-voice-over
--   Landing page copywriting     -> copywriting-content-writing
--   Basic accounting             -> bookkeeping-quickbooks
--
-- Power BI survived because it is genuinely absent, has a clear vendor
-- channel, and is a hiring keyword rather than a hobby. data-analysis-
-- visualization exists but is a general analysis path; this is the
-- tool-specific one.
--
-- Unlike days 1-6, every lesson here ships with learning objectives, notes,
-- a practice activity and a knowledge check. Days 1-6 shipped title-plus-
-- video lessons, which is how the 438-lesson content backlog was created.
-- This course does not add to it.

insert into public.courses (slug, title, description, level, price, published, display_order, category) values
  ('power-bi-data-reporting', 'Power BI for Data Reporting', 'Turn a spreadsheet into a report people actually use. Power BI is Microsoft''s free desktop tool for connecting to data, cleaning it, and building interactive dashboards — and it appears by name in job adverts far more often than most tools you can learn in a weekend. By the end you''ll be able to load and clean messy data, choose the right chart for a question, write your own calculations, and assemble a working dashboard. Spreadsheet familiarity helps; no programming needed.', 'beginner', 500, true, 480, 'tech-programming')
on conflict (slug) do nothing;

do $$
declare
  v_course_id uuid;
  v_l1 uuid; v_l2 uuid; v_l3 uuid;
  v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin
  select id into v_course_id from public.courses where slug = 'power-bi-data-reporting';

  -- Levels created in the same migration that fills them, never as empty
  -- placeholders.
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Foundations', 'What Power BI is for, and getting it running on your own machine.', 1) returning id into v_l1;
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills', 'The two things you do over and over: clean the data, then show it.', 2) returning id into v_l2;
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Your own calculations, and a finished dashboard.', 3) returning id into v_l3;

  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_l1, 'Getting Started', 'What the tool is for and how to get it running.', 1) returning id into v_m1;
  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_l2, 'Core Skills in Practice', 'Cleaning messy data, then choosing charts that answer a question.', 2) returning id into v_m2;
  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_l3, 'Working Like a Pro', 'Write your own measures, then build a dashboard end to end.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m1, 'What Power BI Is Actually For', 'A clear beginner explanation of what Power BI does and where it fits alongside Excel. Under 8 minutes.', 'https://www.youtube.com/watch?v=Vqz2d7pTOV8', 1,
      array['Explain what Power BI does that a spreadsheet does not', 'Name the three stages of the Power BI workflow', 'Decide when a problem needs Power BI rather than Excel'],
      'Power BI is Microsoft''s tool for turning data into reports other people can use. The desktop version is free, which is unusual for a tool this employable.

THE HONEST COMPARISON WITH EXCEL, because that is the question everyone actually has. Excel is a workbook: you type in it, calculate in it, and it holds the data. Power BI is a reporting layer: it CONNECTS to data that lives somewhere else, transforms it, and presents it. You do not type your data into Power BI.

Use Excel when the dataset is small, you are doing one-off analysis, and you are the only person who needs it.

Use Power BI when the same report has to be rebuilt every week from a fresh export, when the data is too big for a spreadsheet to stay responsive, when several sources have to be combined, or when other people need to explore the numbers themselves rather than ask you for a new chart.

That last one is the real difference. An Excel chart answers the question you had. A Power BI report lets the reader filter it and answer the question THEY have.

THE WORKFLOW is always the same three stages, and this course follows them:
1. CONNECT and CLEAN — load the data and fix it (Power Query)
2. MODEL and CALCULATE — define relationships and write measures (DAX)
3. VISUALISE and SHARE — build the report and publish it

Beginners try to skip straight to stage three because that is the fun part. Reports built on unclean data look professional and are wrong, which is worse than looking rough and being right.

Power BI Desktop runs on Windows only. On a Mac or a Chromebook, the browser-based Power BI Service covers much of stage three, though not the full Power Query experience.',
      'Before installing anything, write down one report you or someone you know rebuilds regularly — a weekly sales summary, monthly attendance, stock levels. Note three things: where the data comes from, how long rebuilding it takes, and who reads it. That is your practice project for the rest of this course, and having a real one beats following along with sample data.',
      '[{"question":"What is the clearest sign a job needs Power BI rather than Excel?","options":["The same report must be rebuilt regularly and other people need to explore it themselves","The dataset contains more than 100 rows","You need to add two columns together","The file must be emailed as an attachment"],"correct_index":0},{"question":"Why is skipping straight to building charts a mistake?","options":["A report built on unclean data looks professional and is wrong","Charts take the longest to build","Power BI blocks charts until data is cleaned","Visuals cannot be edited later"],"correct_index":0}]'::jsonb),
    (v_m1, 'Installing and Finding Your Way Around', 'Microsoft''s own short walkthrough of Power BI Desktop — installing it, connecting to your first data source, and what each part of the window does. About 5 minutes.', 'https://www.youtube.com/watch?v=PXqFXG4rzXE', 2,
      array['Install Power BI Desktop and open your first file', 'Identify the Report, Data and Model views and what each is for', 'Connect to a spreadsheet and see the data load'],
      'This is Microsoft''s own introduction, so what it shows is what you will actually see.

THREE VIEWS down the left edge, and knowing which one you are in saves a lot of early confusion:

REPORT VIEW — the canvas where you build charts. This is where you spend most of your time and it is what you show people.

DATA VIEW — the loaded tables as rows and columns, like a spreadsheet. Useful for checking that data arrived the way you expected. You cannot type new data here; it reflects what was loaded.

MODEL VIEW — how your tables relate to each other. It looks intimidating and matters enormously once you have more than one table. With a single table you can ignore it for now.

GETTING DATA IN starts with the Get Data button. Excel and CSV are the common beginner sources; Power BI can also read databases, web pages and dozens of services, but start with a file you already have.

TWO THINGS WORTH KNOWING EARLY:

Power BI takes a COPY of the data when it loads. Changing the source spreadsheet does not change your report until you press Refresh. This surprises people who expect it to behave like a linked cell.

The .pbix file holds your report AND the loaded data, so it can get large. That matters on a slow connection when sharing.

INSTALLING: Power BI Desktop is free from Microsoft''s site or the Microsoft Store, Windows only. If you are on a Mac, you can still follow the concepts here and use the browser-based Power BI Service for much of the reporting, though Power Query in the next lesson is a desktop feature.',
      'Install Power BI Desktop and load a real spreadsheet — the one from your practice project if you have it, or any file with at least three columns and thirty rows. Click through Report, Data and Model view and name out loud what each shows. Then change a value in the source spreadsheet, save it, and watch the report NOT change until you press Refresh. That one experiment prevents a whole category of confusion later.',
      '[{"question":"You edit the source spreadsheet. What happens to your Power BI report?","options":["Nothing until you press Refresh — Power BI loaded a copy","It updates instantly like a linked cell","The report breaks and must be rebuilt","Power BI reopens the source file"],"correct_index":0},{"question":"Which view shows how your tables relate to each other?","options":["Model view","Report view","Data view","Refresh view"],"correct_index":0}]'::jsonb),
    (v_m2, 'Cleaning Messy Data with Power Query', 'A practical walkthrough of Power Query — the part of Power BI that fixes data before it reaches your report. About 13 minutes.', 'https://www.youtube.com/watch?v=gP-AxNi6uxo', 1,
      array['Open Power Query and apply cleaning steps to a table', 'Remove, split and reshape columns without touching the source file', 'Explain why recorded steps re-run automatically on new data'],
      'Real data is messy. Dates stored as text, extra header rows, names with trailing spaces, one column holding two facts, blank rows in the middle. Power Query is where you fix all of it, and it is the most valuable part of Power BI to learn properly.

THE IDEA THAT MAKES IT POWERFUL: Power Query RECORDS your cleaning as a list of steps rather than performing them once. Next month you drop in a fresh export and every step re-runs automatically, in order. Clean it once, and it stays clean forever.

This is the difference between an hour of tidying every month and a single click. It is also why Power Query is worth learning even if you never build a chart.

THE STEPS YOU WILL USE CONSTANTLY:
- Remove Columns — drop what you do not need. Smaller and faster.
- Change Type — tell Power BI a column is a date, a number, or text. Most calculation problems trace back to a wrong type here.
- Split Column — one column holding "Nairobi, Kenya" becomes two.
- Remove Rows — blanks, errors, duplicated headers.
- Trim and Clean — strips invisible whitespace, which is the usual reason two values that look identical refuse to match.
- Replace Values — fix a consistent misspelling everywhere at once.

THE APPLIED STEPS PANEL on the right is your history. Every action appears there, you can click back through them to see the table at each stage, and you can delete a step you regret. Nothing is destructive.

AND CRUCIALLY: none of this touches your source file. The original spreadsheet is untouched. If you get it wrong, delete the step and try again.

THE HABIT: do all your cleaning HERE, not in the report. Cleaning in the report layer means doing it again next time.',
      'Take a genuinely messy spreadsheet — exported data is ideal — and clean it entirely in Power Query. Set every column to the right type, remove what you do not need, trim the text columns, and drop blank rows. Then look at the Applied Steps list and read it top to bottom: that list is a repeatable recipe. Now replace the source file with a newer export and press Refresh to watch the whole recipe re-run.',
      '[{"question":"What makes Power Query different from cleaning data by hand in Excel?","options":["It records the steps and re-runs them automatically on new data","It is faster for a single edit","It permanently fixes the source file","It requires no data types"],"correct_index":0},{"question":"Two values look identical but will not match. What is the usual cause?","options":["Trailing or invisible whitespace, fixed with Trim","The file is too large","The column is hidden","Power BI needs reinstalling"],"correct_index":0}]'::jsonb),
    (v_m2, 'Choosing Charts That Answer a Question', 'A tour of the main Power BI visualisations and what each is good for. About 14 minutes.', 'https://www.youtube.com/watch?v=3NV5Jtbhfcw', 2,
      array['Match a chart type to the question being asked', 'Add slicers so readers can filter the report themselves', 'Recognise the chart choices that mislead'],
      'The mistake is picking a chart because it looks impressive. The discipline is picking one because it answers a specific question at a glance.

MATCH THE CHART TO THE QUESTION:
- Comparing categories ("which branch sold most?") — BAR or COLUMN chart. The workhorse, and almost always the right answer.
- Change over time ("are sales growing?") — LINE chart.
- A single headline number ("total revenue this month") — CARD. Underrated; often the most-read thing on a dashboard.
- Parts of a whole — treat pie charts with suspicion. People compare angles badly. A bar chart usually communicates the same thing more clearly, and beyond about five slices a pie becomes unreadable.
- Relationship between two numbers — SCATTER chart.
- Detail people need to look up — TABLE or MATRIX. Not every question wants a picture.

SLICERS are what make a Power BI report different from a picture of a chart. A slicer is an on-screen filter — by month, by region, by product — and every visual on the page responds to it. That is the whole reason to build a report rather than export a chart: the reader answers their own follow-up question instead of asking you.

CROSS-FILTERING comes free: click a bar in one chart and the other visuals filter to it. Show this to whoever you build for, because most people do not realise they can click.

CHART CHOICES THAT MISLEAD, and you should avoid them even when they look better:
- A bar chart whose axis does not start at zero exaggerates small differences.
- 3D effects distort the very comparison the chart exists to make.
- Too many colours. Colour should mean something, not decorate.

A CLEAR TITLE stating the question — "Sales by branch, this quarter" — does more for comprehension than any amount of styling.',
      'Take your cleaned dataset and build one page that answers three specific questions. Write the three questions down FIRST, then choose a chart for each. Add one slicer and check that all three visuals respond to it. Finally, show the page to someone who has never seen the data and ask what they think it says. Where they hesitate is where your chart choice or title is wrong.',
      '[{"question":"You want to show which of eight branches sold the most. Which chart?","options":["A bar chart","A pie chart","A scatter chart","A line chart"],"correct_index":0},{"question":"What does adding a slicer give the reader?","options":["The ability to filter every visual and answer their own follow-up questions","A faster refresh","An automatic chart title","A printable version"],"correct_index":0}]'::jsonb),
    (v_m3, 'Writing Your Own Calculations with DAX', 'A thorough tutorial on DAX, the formula language behind Power BI measures. About 37 minutes, so watch it in parts — the first section covers what you need to start.', 'https://www.youtube.com/watch?v=waG_JhBgUpM', 1,
      array['Write a basic measure using SUM, COUNT and AVERAGE', 'Explain the difference between a measure and a calculated column', 'Use CALCULATE to answer a filtered question'],
      'DAX is the formula language of Power BI. If you can write an Excel formula you can write DAX — the syntax is deliberately familiar. What differs is WHEN it runs.

MEASURE VERSUS CALCULATED COLUMN — the distinction that confuses everyone at first, and the one worth getting right early:

A CALCULATED COLUMN is worked out once per row when the data loads, and stored. Use it when each row genuinely needs its own value, such as Price times Quantity per line.

A MEASURE is worked out on demand, based on whatever is filtered on screen right now. Total Sales as a measure shows the total for the branch and month the reader has selected. Change the slicer, and the same measure returns a different number.

Nearly always, you want a MEASURE. Beginners reach for calculated columns because they feel like spreadsheet cells, and end up with a file that is large, slow, and does not respond to filters.

STARTING FORMULAS, which cover most of what a beginner needs:
  Total Sales = SUM(Sales[Amount])
  Order Count = COUNTROWS(Sales)
  Average Order = AVERAGE(Sales[Amount])

CALCULATE is the one function worth learning beyond those. It computes something under a filter you specify:
  Nairobi Sales = CALCULATE(SUM(Sales[Amount]), Sales[Branch] = "Nairobi")

That pattern — a calculation plus a condition — answers a large share of real business questions.

A NOTE ON LENGTH: this video runs about 37 minutes, which is a lot of mobile data. The measure-versus-column distinction and the basic aggregations come early and are the part you need. CALCULATE and the more advanced time functions can wait for a second sitting.

NAME MEASURES IN PLAIN LANGUAGE. "Total Sales", not "M1". Six weeks later the name is the only explanation you have.',
      'On your own dataset, write three measures: a total, a count, and an average. Put each on the page as a card visual. Then add a slicer and watch all three change as you filter — that responsiveness is what makes them measures. Finally write one CALCULATE measure answering a filtered question that matters to your project, such as sales for a single branch.',
      '[{"question":"Total Sales should show the total for whatever the reader has filtered. Measure or calculated column?","options":["A measure — it is calculated on demand from the current filters","A calculated column — it is stored per row","Either works identically","Neither; use a slicer instead"],"correct_index":0},{"question":"What does CALCULATE let you do?","options":["Compute something under a filter condition you specify","Speed up the data refresh","Convert measures into columns","Publish the report"],"correct_index":0}]'::jsonb),
    (v_m3, 'Building a Complete Dashboard', 'A full beginner walkthrough building a working dashboard from raw data to finished report. About 23 minutes.', 'https://www.youtube.com/watch?v=c7LrqSxjJQQ', 2,
      array['Assemble cleaned data, measures and visuals into one dashboard', 'Lay out a report so the most important number is seen first', 'Produce something you can show an employer or client'],
      'This lesson puts the whole course together. Everything so far was a piece; this is the assembly.

LAYOUT, in the order people actually read a screen. Eyes go top-left first, so that is where the headline numbers belong — total sales, total orders, as cards. Trend and comparison charts go in the middle. Detailed tables go at the bottom for the minority who want to look something up. Slicers along the top or down the left, where they are visible without hunting.

THE ONE-PAGE RULE for a first dashboard. If it does not fit on a screen, it is two dashboards. Scrolling hides things, and hidden things do not get used.

CONSISTENCY reads as competence: same fonts, a small colour palette, aligned edges. Power BI has alignment guides — use them. A tidy report is trusted more than a cluttered one, fairly or not.

WRITE TITLES AS ANSWERS, not labels. "Sales by branch, this quarter" tells the reader what they are looking at. "Chart 1" makes them work it out.

BEFORE YOU CALL IT FINISHED, check three things:
1. Do the totals match the source data? Cross-check one number against the original spreadsheet. Reports have been trusted for months before someone noticed a filter was silently excluding rows.
2. Does every visual respond to the slicers? A visual that ignores a filter will quietly show the wrong number.
3. Would someone who has never seen it understand it without you explaining? If it needs narration, it is not finished.

AND FOR YOUR CAREER, which is why this course exists: a finished dashboard is a portfolio piece. It is far more persuasive to an employer than a certificate, because it shows the work rather than claiming it. Build it on data you can share publicly, screenshot it, and put it where people can see it.',
      'Build one complete dashboard on your own dataset: headline cards top-left, two or three charts, a slicer, and a table at the bottom. Then run the three finishing checks — cross-check one total against the source, confirm every visual responds to the slicer, and show it to someone unfamiliar without explaining it first. Fix whatever they stumble on. Then screenshot it and keep it as a portfolio piece.',
      '[{"question":"Where should the headline numbers go on a dashboard?","options":["Top-left, where people look first","Bottom-right, as a summary","On a separate page","Beside the slicers only"],"correct_index":0},{"question":"Which check most reliably catches a report that is confidently wrong?","options":["Cross-checking one total against the original source data","Confirming the colours are consistent","Checking the file size","Making sure it fits on one page"],"correct_index":0}]'::jsonb);
end $$;
