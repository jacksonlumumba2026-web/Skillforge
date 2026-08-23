-- Two independent fixes surfaced by reviewing the depth-expansion project:
--
-- 1. Module order: batches 1-5 inserted the "Real-World Applied Project"
--    module at position 4 and the pre-existing "Working Like a Pro"
--    (professional-tier) module at position 5. That means learners built
--    their capstone project *before* being taught professional-level
--    technique. Swap them so professional technique (4) comes before the
--    capstone project (5) that's meant to use it.
--
-- 2. courses.level is a single beginner/intermediate/advanced value, which
--    is now misleading — every depth-expanded course actually spans the
--    full beginner-to-professional range. Add an explicit
--    has_career_path flag (true for every course except
--    web-development-for-beginners, the one course that was never put
--    through the depth-expansion project and is still a single-tier
--    beginner walkthrough) so the UI can show that honestly instead of
--    guessing from lesson/module counts.

-- --- Part 1: swap module order_number 4 and 5 for each depth-expanded course.
-- Three-step swap per course (via a temporary order_number) to avoid
-- tripping the (course_id, order_number) unique constraint mid-statement.
do $$
declare
  swaps uuid[][] := array[
    array['babbfbf1-0384-479f-9c55-0c9a1fb68a70', 'dc19e8d1-b42e-445f-b740-1ab33035bd27']::uuid[], -- 3d-design-animation-blender
    array['67e3c7f8-e0ba-4918-83b6-864d84fad67f', 'c77ab837-aa67-4320-b986-7ea1bf5e8484']::uuid[], -- ai-tools
    array['61f655e2-0b0d-42c7-a668-f2a62e6c04fb', 'fdda28a5-a2d1-43c0-8958-641f23257cac']::uuid[], -- bookkeeping-quickbooks
    array['f73e5909-f49a-41a0-8bcb-021230a2275b', '7a865daa-7172-47ad-b9f7-941290484d78']::uuid[], -- copywriting-content-writing
    array['9617d95e-2d85-443d-8d21-21f38096214f', '39c7a11c-e401-4de2-ada9-39525fe6def8']::uuid[], -- customer-service-virtual-call-center
    array['a4d896a1-05f0-4f3d-a2a9-4fc9d7afac07', 'b154c7dc-a5e4-45bc-a7a2-c739f35817c4']::uuid[], -- cybersecurity-online-safety
    array['c1ac066e-2108-4640-8188-0d86f7d473c5', '46111cbc-52b8-44de-9aaa-81fcfa262838']::uuid[], -- data-analysis-visualization
    array['b03ef159-8f0c-4c69-b9df-e6241a1792f3', 'b4842a30-12cf-4cb4-af36-23acebe26023']::uuid[], -- digital-marketing
    array['bd8063bd-bd3e-42db-a303-916a0b94e9f0', 'a775df1e-95fa-41cf-afa4-84062a9cc8e6']::uuid[], -- ecommerce-online-selling
    array['73b3c904-ee05-4593-a2b0-384337fe2571', '318e83e1-cbda-447d-975d-38754b687d9c']::uuid[], -- email-marketing
    array['8ebea263-c9e2-449d-9c3f-47cc3ef8e16e', '57679404-f4b1-4946-943d-ef15f4b4fbbb']::uuid[], -- excel-spreadsheets-for-work
    array['f1e1e94f-0d4c-440a-a123-13b4794aede2', '5dfcaf8c-0c55-4a00-8176-530f11725544']::uuid[], -- freelancing
    array['c7f75dce-fc9a-4fc7-b178-957ef9069c5e', 'd993cc04-aa20-4c81-bb2d-6db664fd8db3']::uuid[], -- google-facebook-ads
    array['a0406bba-7884-4e5a-a5d2-76746294196d', '55291168-e69c-4484-88ec-0f36eb97f5b3']::uuid[], -- google-workspace-productivity
    array['887e7dea-7c7d-402e-b8e8-5b9b33d5e44a', 'aa66fef4-8230-48da-9f9d-591c6724caef']::uuid[], -- graphic-design
    array['e78a6342-14b1-44c4-9712-e7063b670519', '415b1356-5001-4f4b-ba8a-4bbf03688a84']::uuid[], -- instagram-tiktok-growth
    array['d8f3b955-4b8e-4527-b7d5-02277c4779df', '0f7f3cc3-eeae-4f0c-84fe-03de579f5366']::uuid[], -- mobile-photography-content-creation
    array['5dfedac5-3c84-481e-a816-e1654aee1b52', '9015a368-be27-47d4-a32e-7976ca953342']::uuid[], -- podcasting-voice-over
    array['fbdc8065-3468-4e69-90af-67847262a6ec', 'f3845696-71e9-4d18-a9d8-36726579ee37']::uuid[], -- presentation-design
    array['adb6d77f-2f69-4a29-bce5-6464df410b95', '9d93f009-961a-4c02-be48-1dc23d422e54']::uuid[], -- project-management-tools
    array['d288bd4f-c657-44d6-9fa9-8c70294c914c', '49047497-f736-4567-ba0a-a9a13b34528d']::uuid[], -- python-programming-for-beginners
    array['652c86e5-e0ad-4579-ad91-fa6a2d71e4ef', '2123bea0-b847-4e2c-8edf-ff0a80aa5155']::uuid[], -- resume-writing-linkedin-personal-branding
    array['b875f5fd-d686-4ad8-97a5-be2abfafacfe', '3b5613f4-b983-448f-8c41-c24cecbde571']::uuid[], -- seo-search-engine-optimization
    array['dadb55eb-1509-4d98-b73b-ab52226a2e2e', '7d14eea3-f24e-4027-8437-f7584fa42e8e']::uuid[], -- social-media-management
    array['68222359-5b23-4be6-8055-397462082d23', '7a607ef2-02a0-40da-8702-dcabfde88a63']::uuid[], -- transcription-translation-freelancing
    array['1a41df1d-0a2b-4497-9783-2b32a31f0314', 'b658a185-d411-4ef1-a9c6-05a5331105d3']::uuid[], -- ui-ux-design-figma
    array['fd3a8d56-ed82-43fb-acc0-57bfaaf1ab6a', '3d3ce790-0557-40a3-b355-1578de60e5dd']::uuid[], -- vibe-coding
    array['bcff87fe-e7ad-410b-84aa-ba46713cd506', '95602dad-0eaf-4157-bde5-bc1f7727ff10']::uuid[], -- video-editing
    array['cbd6940b-ec8b-4fb4-9981-ea86ab444dac', '598b396c-5144-44c4-bf2b-1ffc43434b8a']::uuid[], -- virtual-assistance-data-entry
    array['4f2b563c-c233-47de-a637-d7ce616a7270', 'c4377b56-634d-4fdd-8e95-0e754e3209ee']::uuid[]  -- youtube-channel-growth
  ];
  pair uuid[];
  v_m4 uuid;
  v_m5 uuid;
begin
  foreach pair slice 1 in array swaps
  loop
    v_m4 := pair[1];
    v_m5 := pair[2];
    update public.modules set order_number = 100 where id = v_m4;
    update public.modules set order_number = 4 where id = v_m5;
    update public.modules set order_number = 5 where id = v_m4;
  end loop;
end $$;

-- --- Part 2: has_career_path flag.
alter table public.courses add column has_career_path boolean not null default false;
update public.courses set has_career_path = true where slug <> 'web-development-for-beginners';
