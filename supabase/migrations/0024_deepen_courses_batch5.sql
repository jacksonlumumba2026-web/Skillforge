-- Course-depth expansion, batch 5 of 5 (final batch). Same pattern as
-- batches 1-4: existing module 3 bumped to position 5, three new modules
-- inserted at 3, 4, 6. This completes the beginner-to-professional
-- progression across all 31 courses in the catalog.

update public.modules set order_number = 5 where id = '0f7f3cc3-eeae-4f0c-84fe-03de579f5366'; -- mobile-photography-content-creation: Working Like a Pro
update public.modules set order_number = 5 where id = '9015a368-be27-47d4-a32e-7976ca953342'; -- podcasting-voice-over: Working Like a Pro
update public.modules set order_number = 5 where id = '7a607ef2-02a0-40da-8702-dcabfde88a63'; -- transcription-translation-freelancing: Working Like a Pro
update public.modules set order_number = 5 where id = 'c4377b56-634d-4fdd-8e95-0e754e3209ee'; -- youtube-channel-growth: Working Like a Pro
update public.modules set order_number = 5 where id = '39c7a11c-e401-4de2-ada9-39525fe6def8'; -- customer-service-virtual-call-center: Working Like a Pro
update public.modules set order_number = 5 where id = '2123bea0-b847-4e2c-8edf-ff0a80aa5155'; -- resume-writing-linkedin-personal-branding: Working Like a Pro
update public.modules set order_number = 5 where id = 'dc19e8d1-b42e-445f-b740-1ab33035bd27'; -- 3d-design-animation-blender: Working Like a Pro

-- ---------------------------------------------------------------------------
-- mobile-photography-content-creation: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '4afdb20e-1aa4-49d3-ad84-7b12528ddb0e';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Advanced Mobile Camera & Editing Techniques', 'Moves past auto mode into manual controls and color grading for a professional, consistent look.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Shoot & Edit a Real Content Project', 'Learners run a full product photo shoot and finish a real short-form video, start to finish.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance & UGC Career Path', 'Covers turning phone content skills into paid UGC creator work with real brands.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Manual Camera Controls (ISO, Shutter Speed, White Balance)', 'Manual camera controls on a smartphone (ISO, shutter speed, white balance, exposure) for shots that don''t look like snapshots.', 'https://www.youtube.com/watch?v=tuHnz8yBEno', 1),
    (v_m3, 'Color Grading in Lightroom Mobile', 'Color grading photos in Lightroom Mobile to give a consistent, professional look across a whole feed.', 'https://www.youtube.com/watch?v=jadS_OdV4DA', 2),
    (v_m4, 'Product Photography Shoot With Just a Phone', 'A full product photography shoot using only a phone, from lighting setup to final edited shots ready to sell.', 'https://www.youtube.com/watch?v=FyL1Omm6dFs', 1),
    (v_m4, 'Editing a Short-Form Video in CapCut', 'Editing and finishing a short-form Reel/TikTok video in CapCut from raw footage to a postable file.', 'https://www.youtube.com/watch?v=yNJ_9PhJ9NE', 2),
    (v_m6, 'Becoming a Paid UGC Creator', 'Step-by-step path to becoming a paid UGC creator with no experience or following, including what to charge per video.', 'https://www.youtube.com/watch?v=Tlv9FiGmmE8', 1),
    (v_m6, 'Building a UGC Portfolio to Pitch Brands', 'Building UGC example content for a portfolio and pitching it directly to brands to land paid deals.', 'https://www.youtube.com/watch?v=QErg0mlRLWc', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- podcasting-voice-over: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '4c5aafcb-830b-4c77-8431-0666db83ad78';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Audio Production & Mic Technique', 'Covers compression, EQ, and proper mic technique so recordings sound broadcast-ready instead of amateur.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Record a Real Podcast/Demo Project', 'Learners record and edit a real podcast episode and put together a voice-over demo reel.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance Voice & Podcast Career', 'Covers turning audio skills into freelance voice-over gigs or podcast editing income.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Podcast Compression & EQ in Audacity', 'Using compression and EQ in Audacity to make a podcast episode sound broadcast-ready instead of amateur.', 'https://www.youtube.com/watch?v=l3B3a5oc6X4', 1),
    (v_m3, 'Voice-Over Microphone Techniques', 'Proper microphone positioning and technique for voice-over work that avoids plosives, breath noise, and room echo.', 'https://www.youtube.com/watch?v=uuZBX74KS38', 2),
    (v_m4, 'Record and Edit a Podcast Episode', 'Recording and editing a complete beginner podcast episode end-to-end, from raw audio to a publishable file.', 'https://www.youtube.com/watch?v=DQO0xJudELM', 1),
    (v_m4, 'Make Your First Voice-Over Demo Reel', 'Putting together a first voice-over demo reel fast, in the format agencies and clients expect to hear.', 'https://www.youtube.com/watch?v=wnFODgENMao', 2),
    (v_m6, 'Fiverr Gig Setup for Voice Actors', 'Setting up a Fiverr voice-over gig correctly, from pricing to sample selection, to start landing paying jobs.', 'https://www.youtube.com/watch?v=_6WEaZQTWog', 1),
    (v_m6, 'Finding Clients as a Freelance Podcast Editor', 'Where and how to find paying clients as a freelance podcast editor when starting from zero.', 'https://www.youtube.com/watch?v=CMh1DVELNzs', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- transcription-translation-freelancing: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '1f2bcae5-c4d3-4a40-84e0-379791b8b722';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Transcription & Translation Technique', 'Covers verbatim formatting standards and how CAT tool match percentages affect real pay.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Real Transcription & Translation Project', 'Learners transcribe a real audio file and translate a real document end-to-end.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance Transcription & Translation Career', 'Covers evaluating transcription platforms and finding direct freelance translation clients.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Clean vs Full Verbatim Transcription', 'The difference between clean and full verbatim transcription formats and when clients expect each one.', 'https://www.youtube.com/watch?v=VzuEJ1cYbNE', 1),
    (v_m3, 'Understanding CAT Tool Matches', 'How CAT tool match percentages work and why they directly affect what a translator gets paid per job.', 'https://www.youtube.com/watch?v=7QnZ62LflkA', 2),
    (v_m4, 'Transcribe a Real Audio File to Text', 'Transcribing a real audio recording into a formatted Word document from start to finish.', 'https://www.youtube.com/watch?v=hasB70xNBTk', 1),
    (v_m4, 'Translate a Document in Smartcat', 'Using Smartcat to translate a real document end-to-end, from upload to exported final file.', 'https://www.youtube.com/watch?v=nNaond9iuy4', 2),
    (v_m6, 'Are Transcription Platforms Worth It?', 'An honest breakdown of what Rev actually pays and whether transcription platforms are worth starting on.', 'https://www.youtube.com/watch?v=dPSngnJlD2Y', 1),
    (v_m6, 'Finding Your First Translation Clients', 'How to land your first paying clients as a freelance translator outside of marketplace gigs.', 'https://www.youtube.com/watch?v=-SsFi5A3dl4', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- youtube-channel-growth: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '566df4af-2367-4473-b090-d3ad9269c291';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Growth Techniques (SEO & Thumbnails)', 'Covers how YouTube search ranking actually works and how to design thumbnails that earn clicks.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Plan, Film & Publish a Real Video', 'Learners edit a real YouTube video end-to-end, including a full DaVinci Resolve edit.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Monetization & Freelance Scaling', 'Covers making money on YouTube beyond ads, and turning editing skill into freelance clients.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'How YouTube Search Ranking Works', 'How YouTube''s search ranking actually works and what to optimize in titles/descriptions to get discovered.', 'https://www.youtube.com/watch?v=3NPieJutT9I', 1),
    (v_m3, 'Live Thumbnail-Design Workshop', 'A live workshop building higher-click YouTube thumbnails from scratch, step by step.', 'https://www.youtube.com/watch?v=4POgXi7KRM8', 2),
    (v_m4, 'Edit Your First YouTube Video, Step-by-Step', 'A step-by-step walkthrough of editing a first YouTube video, from raw clips to finished upload.', 'https://www.youtube.com/watch?v=UR7S663xx8c', 1),
    (v_m4, 'DaVinci Resolve Start-to-Finish Edit', 'A complete start-to-finish edit in DaVinci Resolve, the free professional tool many creators use.', 'https://www.youtube.com/watch?v=mdfMztoP840', 2),
    (v_m6, '14 Proven Ways to Make Money on YouTube', '14 real ways creators make money on YouTube beyond ad revenue, including sponsorships and products.', 'https://www.youtube.com/watch?v=2pbRnLDm8ec', 1),
    (v_m6, 'Get More Video Editing Clients as a Freelancer', 'How to quickly find paying video-editing clients and turn editing skills into freelance income.', 'https://www.youtube.com/watch?v=A0r9z6Eet_k', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- customer-service-virtual-call-center: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '3d04e36d-d144-4780-857a-171991bddaa5';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'De-Escalation & Difficult Customer Handling', 'Covers calming angry callers and practicing active listening so customers feel heard, not processed.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Hands-On Helpdesk & Call Scripting', 'Learners set up a real helpdesk ticketing system and practice empathy scripts on mock calls.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Landing Remote Customer Service Work', 'Covers finding legitimate remote customer service jobs and passing the interview.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Top 3 Ways to Get Angry Customers to Back Down', 'Three proven verbal tactics for calming an angry caller and steering the conversation to resolution.', 'https://www.youtube.com/watch?v=AMWb9rZvn0s', 1),
    (v_m3, 'Active Listening in Customer Service', 'How to practice active listening on live calls so customers feel heard instead of processed.', 'https://www.youtube.com/watch?v=KQxF0AbTLsU', 2),
    (v_m4, 'Zendesk Tutorial for Beginners (CRM)', 'Step-by-step setup of a real helpdesk ticketing system (Zendesk) used by actual support teams.', 'https://www.youtube.com/watch?v=LSB-0Xlhykg', 1),
    (v_m4, 'How to Empathize in Call Center Customer Service — Scripts, Mock Calls', 'Mock call recordings and empathy scripts you can adapt to handle real customer complaints professionally.', 'https://www.youtube.com/watch?v=fmhe6gnCq2w', 2),
    (v_m6, '20 Places to Find Remote Customer Service Jobs Online', '20 legitimate places to find paid remote customer service jobs.', 'https://www.youtube.com/watch?v=5sQy141jyPo', 1),
    (v_m6, 'Customer Service Interview Questions & Answers (How to Pass)', 'Common customer service interview questions with sample answers to land virtual call center offers.', 'https://www.youtube.com/watch?v=a99gQn9pkOM', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- resume-writing-linkedin-personal-branding: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '05f99c38-5909-4c56-9bed-b00ba390aa3a';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'ATS-Proof Resumes & LinkedIn Visibility', 'Covers writing keyword-optimized resumes that pass ATS scanners and LinkedIn headlines that get found by recruiters.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Tailor a Resume & Rebuild a LinkedIn Profile', 'Learners tailor a real resume to a specific job posting and rebuild a full LinkedIn profile.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance Resume Writing & Personal Branding Income', 'Covers turning resume/branding skills into freelance client income.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Writing a Keyword Optimized Resume: Get Past the ATS Scanners', 'How to identify and place the right keywords in a resume so it survives automated ATS scanning software.', 'https://www.youtube.com/watch?v=kV_mC5gCsFQ', 1),
    (v_m3, 'LinkedIn Headline Formula That Works', 'A repeatable formula for writing a LinkedIn headline that gets you found in recruiter searches.', 'https://www.youtube.com/watch?v=2eIGDJDnx7A', 2),
    (v_m4, '10 Easy Steps to Tailor Your Resume to Any Job Description', 'A 10-step walkthrough for rewriting your resume to match a specific real job posting line by line.', 'https://www.youtube.com/watch?v=-T7V3pKgI4g', 1),
    (v_m4, 'How to Optimize Your LinkedIn Profile — Complete Guide', 'A full section-by-section LinkedIn profile rebuild, from photo to featured section.', 'https://www.youtube.com/watch?v=Ih8kvkaMhWw', 2),
    (v_m6, 'How Does a Resume Writer Accept New Clients?', 'How working resume writers actually find and onboard new paying clients.', 'https://www.youtube.com/watch?v=iJeeMGnarjw', 1),
    (v_m6, 'Freelance Pricing Strategies: How to Charge What You''re Worth', 'A pricing framework applicable to freelance resume/branding services so you stop undercharging.', 'https://www.youtube.com/watch?v=h5UC8sHXvko', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- 3d-design-animation-blender: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := 'f0a11b8b-11e0-4af4-999c-ae4c8d3dc0a7';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Character Rigging & Procedural Shading', 'Covers auto-rigging a humanoid character and building materials with node-based procedural shading.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Build & Animate a Game-Ready Asset', 'Learners model, texture, and animate one real game-ready 3D asset end-to-end.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance 3D Art: Clients & Selling Models', 'Covers finding freelance 3D art clients and selling models on real marketplaces.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Use Rigify to Easily Rig Your Characters', 'How to auto-rig a humanoid character using Blender''s Rigify add-on so it''s ready to animate.', 'https://www.youtube.com/watch?v=umtig82NGdk', 1),
    (v_m3, 'Beginners Guide to Nodes', 'Node-based procedural shading fundamentals for building materials without image textures.', 'https://www.youtube.com/watch?v=2vPMMivnMZc', 2),
    (v_m4, 'Blender Lowpoly Modeling & Texturing', 'End-to-end low-poly modeling, UV unwrapping, and texturing of a game-ready asset.', 'https://www.youtube.com/watch?v=q78-sqlWJwI', 1),
    (v_m4, '5 Ways to Make Looping Animations in Blender', 'Five techniques for building animations that loop seamlessly, a common client/portfolio deliverable.', 'https://www.youtube.com/watch?v=GbkFn2yaOgg', 2),
    (v_m6, 'How to Find Clients as a Freelance 3D Artist', 'Organic, no-budget methods a freelance 3D artist can use to land their first paying clients.', 'https://www.youtube.com/watch?v=eTiga_PD8iM', 1),
    (v_m6, 'Sell Your 3D Models Online — 6 Great Sites, Useful Tips', 'Six real marketplaces where you can list and sell Blender models.', 'https://www.youtube.com/watch?v=vgq0nqsIzRE', 2)
  on conflict (module_id, order_number) do nothing;
end $$;
