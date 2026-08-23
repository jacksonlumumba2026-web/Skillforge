-- Course-depth expansion, batch 1 of ~6 (31 courses total need this).
-- Each course goes from 3 modules/6 lessons (beginner-only) to 6
-- modules/12 lessons spanning beginner -> intermediate -> real-world
-- application -> professional-level -> paid/freelance work. The existing
-- "Getting Started" and "Core Skills in Practice" modules (1-2) stay
-- untouched; the existing 3rd module is bumped to position 5 (it was
-- already good, professional-tier content); 3 new modules are inserted
-- at positions 3, 4, and 6.

-- Bump each course's existing module 3 -> module 5
update public.modules set order_number = 5 where id = '5dfcaf8c-0c55-4a00-8176-530f11725544'; -- freelancing: Pricing & Protecting Your Business
update public.modules set order_number = 5 where id = 'aa66fef4-8230-48da-9f9d-591c6724caef'; -- graphic-design: Branding Basics & Designer Habits
update public.modules set order_number = 5 where id = 'b4842a30-12cf-4cb4-af36-23acebe26023'; -- digital-marketing: Measuring Results Like a Pro
update public.modules set order_number = 5 where id = 'c77ab837-aa67-4320-b986-7ea1bf5e8484'; -- ai-tools: Getting Better Results, Faster
update public.modules set order_number = 5 where id = '95602dad-0eaf-4157-bde5-bc1f7727ff10'; -- video-editing: Editing Like a Pro

-- ---------------------------------------------------------------------------
-- freelancing: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '841c3859-44c9-41fa-aca2-b19ac8409eaa';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Negotiating & Managing Scope', 'Learn to control scope creep and lock in fair terms with a written contract so client relationships stay professional and protected.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Working with Real Clients', 'Master the professional habits — onboarding and handling feedback — that keep real client engagements running smoothly.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Scaling Into a Real Freelance Business', 'Move from taking any job to building a sustainable freelance business through a strong portfolio and referral-driven growth.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'How to Handle Scope Creep in Client Projects', 'Practical tactics for spotting scope creep early and pushing back on "just one more thing" requests without damaging the relationship.', 'https://www.youtube.com/watch?v=UgtrG88EDhU', 1),
    (v_m3, 'You Need a Contract: Legal Basics for Freelancers', 'Covers the essential clauses every freelance contract should have to negotiate fair terms and protect yourself from problem clients.', 'https://www.youtube.com/watch?v=gZxi6AY5v3k', 2),
    (v_m4, 'New Client Onboarding Process Steps for Freelancers', 'A step-by-step walkthrough of onboarding a new client, from welcome materials to first calls, so the relationship starts on the right foot.', 'https://www.youtube.com/watch?v=mYlIDuZJd8I', 1),
    (v_m4, 'How to Best Handle Feedback and Revisions From Clients', 'Strategies for managing revision rounds and client feedback so the process stays constructive instead of going sideways.', 'https://www.youtube.com/watch?v=cbN1uD7jmPY', 2),
    (v_m6, 'How to Build a Freelance Portfolio (That Gets You Hired)', 'Shows how to select and present portfolio pieces that actively win new work, even as your experience grows.', 'https://www.youtube.com/watch?v=rRqm8uAlObs', 1),
    (v_m6, 'How to Get Freelance Clients from Referrals (Without Pitching)', 'A practical approach to turning happy clients into a steady stream of referrals and repeat business.', 'https://www.youtube.com/watch?v=BY_jDmTasoU', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- graphic-design: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '74b4b41c-2bc6-4e05-8ab5-ee22f89a5278';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Design Techniques', 'Build stronger design instincts with real techniques for typography and color that go beyond the basics.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Designing for Real Clients', 'Learn to translate a client''s brief into concepts and present that work with confidence.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance Design & Building a Portfolio', 'Learn how to land your first design clients and build a portfolio that proves your skills even without prior client work.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'How to Pair Fonts (And Create Typographic Hierarchy)', 'Explains how to combine fonts and build clear visual hierarchy so type choices support the design instead of fighting it.', 'https://www.youtube.com/watch?v=oJ4OT1NVNvA', 1),
    (v_m3, 'Color Theory Practice Project: Create Better Color Palettes', 'A hands-on walkthrough of applying color theory to build intentional, harmonious palettes for real design work.', 'https://www.youtube.com/watch?v=3JE8QturI0c', 2),
    (v_m4, 'How to Nail Your Design Brief and the Questions to Ask', 'Covers the questions to ask clients up front so a brief actually gives you enough to design from.', 'https://www.youtube.com/watch?v=NGnSnGUB1vs', 1),
    (v_m4, 'How to Present Graphic Design Projects to Clients', 'A guide to presenting mockups, concepts, and logos to clients so they understand and buy into your ideas.', 'https://www.youtube.com/watch?v=4LgPxxAaJAE', 2),
    (v_m6, 'How to Get Clients as a Freelance Graphic Designer', 'A practical, up-to-date approach to finding and landing freelance graphic design clients.', 'https://www.youtube.com/watch?v=V2hT84-45Hs', 1),
    (v_m6, 'The Best Way to Build a Graphic Design Portfolio (No Clients Needed)', 'Shows how to create strong portfolio pieces using self-initiated and spec projects when you don''t yet have real client work.', 'https://www.youtube.com/watch?v=8M0qxamf1rE', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- digital-marketing: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := 'a2af589f-657c-44a8-ae85-646363a2fcfd';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Ad Strategy', 'Go deeper on paid advertising with sharper audience targeting and retargeting techniques.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Building a Real Campaign', 'Plan and execute an actual marketing campaign across multiple channels from start to finish.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance & Agency-Ready Marketing', 'Learn to sell marketing services to clients and prove results, the core skills of running marketing as a freelance or agency business.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'Google Ads Audience Targeting: The Complete Guide', 'A thorough walkthrough of audience targeting options in Google Ads, going well beyond basic demographic targeting.', 'https://www.youtube.com/watch?v=qWbUEf8fjzg', 1),
    (v_m3, 'Google Retargeting Ads For Beginners', 'Explains how to set up retargeting/remarketing campaigns to re-engage visitors who didn''t convert the first time.', 'https://www.youtube.com/watch?v=XhqAU2otU3U', 2),
    (v_m4, 'How to Make a Digital Marketing Campaign Plan', 'A step-by-step guide to planning a campaign, from goals and audience to timeline and channels, before launch.', 'https://www.youtube.com/watch?v=0VtSDWsqJbM', 1),
    (v_m4, 'How to Run a Successful Multi-Channel Marketing Campaign', 'Shows how to coordinate a campaign across multiple channels so messaging stays consistent and effective.', 'https://www.youtube.com/watch?v=SajtFA0ZECQ', 2),
    (v_m6, 'How to Pitch Clients for Digital Marketing Services', 'Covers selling and closing techniques for pitching digital marketing services to prospective clients.', 'https://www.youtube.com/watch?v=mVUusnW39Sw', 1),
    (v_m6, 'How to Report Your Advertising Results to Clients', 'A practical guide to building clear, client-friendly reports across Facebook, LinkedIn, and Google ad results.', 'https://www.youtube.com/watch?v=ChxVLhMPOP0', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- ai-tools: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '9dd683f2-b259-4c19-b2cc-10d40cb70d52';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate AI Workflows', 'Level up beyond single prompts by learning to chain prompts for complex tasks and build a custom GPT tailored to a specific job.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'AI for Real Projects', 'Apply AI tools to a real, end-to-end work project instead of isolated one-off prompts.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Turning AI Skills into Paid Work', 'Turn AI tool proficiency into freelance income by offering AI-assisted services and packaging them as a product.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'How to Chain Prompts for Accurate ChatGPT Responses', 'Learn to break a big, multi-part task into a logical sequence of smaller prompts so ChatGPT stays accurate and on-track through each step.', 'https://www.youtube.com/watch?v=o-C9lYMMdrg', 1),
    (v_m3, 'How to Build a Custom GPT in ChatGPT (Beginner Tutorial)', 'A step-by-step walkthrough of building your own Custom GPT with tailored instructions and knowledge for a repeatable task.', 'https://www.youtube.com/watch?v=p6Z2d3T-fLM', 2),
    (v_m4, 'How to Use ChatGPT for Content Creation (Custom Workflow)', 'Walks through a full custom ChatGPT workflow for planning and producing content from idea to finished piece, not just single prompts.', 'https://www.youtube.com/watch?v=BtSD3vf6NEg', 1),
    (v_m4, 'How to Use ChatGPT''s Deep Research to Save Hours on Research', 'Shows how to run ChatGPT''s Deep Research feature to complete a full research task and produce a cited report.', 'https://www.youtube.com/watch?v=ld3XMuXwLcE', 2),
    (v_m6, '7 AI Freelance Services You Can Offer as a Beginner', 'Covers concrete AI-assisted services a beginner can start offering clients right away, such as AI writing and research support.', 'https://www.youtube.com/watch?v=BFhWQRsoJ4U', 1),
    (v_m6, 'How Productizing AI Services Can 10X Your Revenue', 'A real case study on turning a one-off AI skill into a packaged, repeatable service offer that scales income.', 'https://www.youtube.com/watch?v=itA4M364nd8', 2)
  on conflict (module_id, order_number) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- video-editing: +3 modules, +6 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid := '4200e755-71a0-45f7-a4c0-a6b648a9fae2';
  v_m3 uuid; v_m4 uuid; v_m6 uuid;
begin
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Intermediate Editing Techniques', 'Build on the editing basics with color grading, audio mixing/cleanup, and the polish techniques that separate amateur from professional-looking video.', 3) returning id into v_m3;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Editing a Real Project', 'Apply everything learned to a full, realistic video project edited start to finish, not just a short clip.', 4) returning id into v_m4;
  insert into public.modules (course_id, title, description, order_number) values
    (v_course_id, 'Freelance Video Editing', 'Turn editing skills into income by learning how to find clients, build a portfolio, and price your work.', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_number) values
    (v_m3, 'How to Color Grade in DaVinci Resolve for Beginners', 'A simple, beginner-friendly workflow for color correcting and grading footage to get a consistent, professional look.', 'https://www.youtube.com/watch?v=jK_nYq4ZpgY', 1),
    (v_m3, '5 Basic Audio-Mixing Techniques for Editing Video', 'Covers practical techniques for balancing dialogue, ambient sound, sound effects, and music into a clean mix.', 'https://www.youtube.com/watch?v=UrSjJ_0SJLk', 2),
    (v_m4, 'My Documentary Editing Workflow: A Step-by-Step Guide', 'Follows a real 30-minute documentary project from raw footage through organization, structure, and final cut.', 'https://www.youtube.com/watch?v=tk5srpIvixo', 1),
    (v_m4, 'POV: Editing a Real Paid Client Project (Full Process)', 'Shows the complete real-world process of editing a paid client video project from start to delivery.', 'https://www.youtube.com/watch?v=wF3ohKV9llw', 2),
    (v_m6, 'How To Get Your First Video Editing Clients Online', 'Practical strategies for landing your first paying video editing clients as a beginner freelancer.', 'https://www.youtube.com/watch?v=BMm99A2nHqQ', 1),
    (v_m6, 'How Much to Charge for Video Editing: Every Pricing Strategy', 'Breaks down different pricing models (hourly, per-project, retainer) so you can set fair, sustainable rates for editing work.', 'https://www.youtube.com/watch?v=Rsj-I9pNLsU', 2)
  on conflict (module_id, order_number) do nothing;
end $$;
