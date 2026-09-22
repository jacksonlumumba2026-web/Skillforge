-- Repair, not new content. Two fields in 0123 were applied to production with
-- possessive apostrophes dropped in transcription. This restores them to the
-- text 0123 already specifies, so the two files together match production.

-- Create a Full Website Design in Figma
update public.lessons set
  learning_objectives = array['Design a complete site rather than a single page', 'Make each page do one job in the visitor''s journey', 'Hand a design over so it can be built']
where id = '0d1e8061-0606-42ec-afc8-7b779e0dd973';

-- UX/UI Portfolio + Case Study Full Course
update public.lessons set
  notes = 'A portfolio of attractive screens gets you compliments. A portfolio of case studies gets you hired, because a client is buying judgement and needs to see it.

THREE OR FOUR PROJECTS IS ENOUGH. Depth beats quantity every time, and a weak fifth project drags down the impression of the other four.

THE CASE STUDY STRUCTURE THAT WORKS:
THE PROBLEM, in the client''s or user''s words. Specific, not "they needed a modern redesign".
WHAT YOU FOUND OUT, however small - five people asked, a look at the existing numbers, a walkthrough of the old thing.
THE DECISIONS YOU MADE AND WHY. This is the whole case study. Not what you designed, but what you chose between and on what grounds. Include something you tried and rejected.
WHAT IT LOOKS LIKE, which is where the screens finally appear.
WHAT HAPPENED. Enquiries, completion rate, time to finish a task, or what the client said. If nothing was measured, say so plainly.

WRITE FOR SOMEONE SKIMMING. Headings that carry the story, short paragraphs, and the outcome near the top.

IF THE PROJECT WAS NEVER BUILT, say so. Nobody minds. What they mind is discovering it later.

ADDITION BEYOND THE VIDEO - making this work for the clients you will actually meet. MOST LOCAL CLIENTS WILL NOT READ A LONG CASE STUDY, so carry two versions: the full write-up for agencies and international applications, and a one-screen before-and-after with a single sentence of outcome for the small business owner on WhatsApp. The second wins more local work than the first. Second, MAKE IT OPENABLE ON A PHONE, on a bundle - a heavy portfolio site with large images is a portfolio nobody sees, and a lightweight page or even a well-made PDF beats an impressive slow one. Third, USE REAL LOCAL WORK EVEN WHEN IT IS SMALL: a redesign of a real shop''s ordering flow, with the owner''s comment about what changed, is more persuasive here than an imagined banking app, and it proves you have dealt with real content, real constraints and a real person''s opinions.'
where id = '66ea3d0d-218d-4d96-a2e3-8aefe6c20366';
