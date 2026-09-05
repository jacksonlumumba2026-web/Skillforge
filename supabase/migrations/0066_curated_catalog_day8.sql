-- Curated catalog day 8. TWO courses: Photo Editing & Retouching
-- (Photoshop), and Notion for Work & Business.
--
-- Every video id below was confirmed through the YouTube Data API for
-- channel, exact title, duration and embeddability before any lesson
-- content was written. Every source is an authority channel: LearnFree
-- (GCFGlobal), Adobe's own two channels, and Notion's own channel. No
-- lesson here rests on an unbranded creator upload.
--
-- TOPIC SUPPLY remains the binding constraint, not sourcing. Four
-- candidates were researched and rejected:
--   Airtable            -> no vendor channel appears at all; every result
--                          was a third-party consultant or creator
--   Proofreading & Editing -> one institutional source (a university
--                          channel) and nothing else brandable; this is
--                          its second failure
--   Shopify store setup -> ecommerce-online-selling already carries the
--                          official Shopify tutorial parts 1-3
--   Git & GitHub        -> web-development-for-beginners teaches Git and
--                          GitHub basics, and vibe-coding gained a full
--                          Git module in 0055
--
-- Notion was rejected on day 7 for overlapping project-management-tools.
-- Revisited deliberately: that course carries exactly ONE introductory
-- Notion lesson inside a three-tool tour. Notion used as a database and
-- team workspace is a different subject, and Notion's own channel covers
-- it properly. The overlap is one lesson, not a course.
--
-- Like day 7 and unlike days 1-6, every lesson ships with objectives,
-- notes, a practice activity and a knowledge check. Neither course adds
-- to the 438-lesson bare-content backlog.

insert into public.courses (slug, title, description, level, price, published, display_order, category) values
  ('photo-editing-photoshop', 'Photo Editing & Retouching (Photoshop)', 'Photo editing is one of the few digital skills someone will pay for the same week you learn it — passport photos, product shots, event pictures, a headshot that needs the background cleaned up. This path teaches Adobe Photoshop the way professionals actually use it: layers and masks so nothing you do is permanent, the retouching tools that remove a blemish or a stray object, and the tone and colour controls that rescue a badly lit photo. It finishes with exporting — the step that decides whether your file is sharp on a website or a 12MB message nobody can open. Taught throughout by GCFGlobal''s LearnFree and Adobe''s own channels.', 'beginner', 500, true, 490, 'design-creative')
on conflict (slug) do nothing;

insert into public.courses (slug, title, description, level, price, published, display_order, category) values
  ('notion-for-work', 'Notion for Work & Business', 'Notion is one app that replaces the notes, the spreadsheet, the shared folder and the task list — which is why so many small teams and freelancers run their whole operation in it. This path teaches it as a work tool rather than a personal notebook: how pages and blocks fit together, how to share without accidentally publishing something to the internet, and above all databases, which is where Notion stops being a notes app and starts being a system. It ends with building a workspace a team can actually use and templates that keep it tidy. Every lesson is taught by Notion''s own channel.', 'beginner', 500, true, 500, 'productivity-tools')
on conflict (slug) do nothing;

do $$
declare
  v_course_id uuid;
  v_l1 uuid; v_l2 uuid; v_l3 uuid;
  v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin

  -- ---- Photo Editing & Retouching (Photoshop) ----
  select id into v_course_id from public.courses where slug = 'photo-editing-photoshop';

  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Foundations', 'Finding your way around, and the one idea the whole program rests on.', 1) returning id into v_l1;
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills', 'Changing part of a picture without wrecking the rest.', 2) returning id into v_l2;
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Getting tone and colour right, then saving a file that is the right size for where it is going.', 3) returning id into v_l3;

  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_l1, 'Getting Started', 'The workspace, and layers — which is the concept everything else depends on.', 1) returning id into v_m1;
  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_l2, 'Core Skills in Practice', 'Masking and retouching — changing one part of a picture while leaving everything else intact.', 2) returning id into v_m2;
  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_l3, 'Working Like a Pro', 'Tone and colour, then getting the file out of Photoshop at the right size for where it is going.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m1, 'Finding Your Way Around Photoshop', 'GCFGlobal''s LearnFree on the Photoshop workspace — the panels, the tools, and how to open and move around an image. Just over 5 minutes.', 'https://www.youtube.com/watch?v=wddbxkS8Wcg', 1,
      array['Open an image and navigate it with zoom and pan', 'Identify the toolbar, options bar, and panels and what each is for', 'Reset the workspace when something disappears'],
      'Photoshop looks intimidating because everything is visible at once. In practice you use perhaps ten of those tools regularly, and the rest can wait years.

THE FOUR AREAS ON SCREEN:

THE TOOLBAR down the left. Selection tools at the top, retouching and painting in the middle, navigation at the bottom. Many icons hide more tools behind them — a small triangle in the corner means press and hold to see the rest.

THE OPTIONS BAR along the top. It CHANGES depending on which tool is active, which confuses beginners endlessly. If a setting you remember has vanished, you have a different tool selected.

THE PANELS down the right. Layers is the one that matters; the others can be closed.

THE CANVAS in the middle — your actual image.

WHEN SOMETHING GOES WRONG, and it will: Window > Workspace > Reset Essentials puts everything back where it started. Learn that menu path now; it turns a panicked half hour into two seconds.

THE SHORTCUTS WORTH LEARNING TODAY, because they save more time than any other five minutes you will spend: Ctrl+Z (Cmd+Z on Mac) to undo, and press it repeatedly to keep going back. Spacebar held down turns any tool into the hand tool for panning. Ctrl+0 fits the image to the screen. Ctrl+S saves.

AND SAVE AS .PSD WHILE YOU WORK. A .psd keeps your layers so you can come back and change something. A .jpg flattens everything permanently. Export the jpg at the end; keep the psd forever. Every professional works this way, and every beginner learns it the hard way once.

A NOTE ON GETTING PHOTOSHOP, which the video does not cover: it is a paid Adobe subscription, and there is a free trial. If that is out of reach right now, Photopea (photopea.com) runs free in a browser with a near-identical layout, and almost everything in this path transfers directly. Learn the ideas here; the software is a detail.',
      'Open any photo. Zoom in to 200% and pan around with the spacebar held down, then press Ctrl+0 to fit it back to the screen. Switch between three different tools and watch the options bar change each time. Then deliberately drag a panel somewhere silly and use Window > Workspace > Reset Essentials to fix it. Save the file as a .psd before you close it.',
      '[{"question": "The options bar looks different from what you remember. What has usually happened?", "options": ["A different tool is selected — the options bar changes per tool", "Photoshop has updated itself", "The image is the wrong file format", "The workspace is corrupted and must be reinstalled"], "correct_index": 0}, {"question": "Why save as .psd while you are still working?", "options": ["It keeps your layers editable; a .jpg flattens them permanently", "It produces a smaller file", "Only .psd files can be printed", "It automatically backs up to Adobe''s cloud"], "correct_index": 0}]'::jsonb),
    (v_m1, 'Layers — the Idea Everything Else Rests On', 'LearnFree on how layers work: stacking parts of an image so each can be changed on its own. Under 7 minutes.', 'https://www.youtube.com/watch?v=ZOviKhTjLJs', 2,
      array['Explain layers as a stack of transparent sheets', 'Create, reorder, hide and rename layers', 'Say why editing on a separate layer protects the original'],
      'If you understand layers, Photoshop makes sense. If you do not, it will feel like fighting the program forever.

THINK OF TRANSPARENT SHEETS stacked over a photograph. Draw on one sheet and the ones below are untouched. Slide a sheet out and its contribution vanishes. Reorder them and what covers what changes. That is exactly what layers are.

THE STACK READS TOP-DOWN: what is at the top of the Layers panel is in front. Dragging a layer up or down in that panel is how you change what covers what — which is the fix for "my text has disappeared" almost every time.

THE EYE ICON hides a layer without deleting it. Use it constantly to compare before and after: click it off, click it on. That habit alone will improve your editing, because you stop noticing the drift that happens when you stare at something for twenty minutes.

OPACITY makes a layer partly transparent. It is how you dial back an effect that is too strong instead of undoing and starting again.

NAME YOUR LAYERS. Double-click the name and type. Ten layers called "Layer 4 copy 2" is how a file becomes unworkable, and you WILL come back to this file.

THE HABIT THAT MATTERS MOST: NEVER EDIT THE ORIGINAL LAYER. Duplicate it first — Ctrl+J — and work on the copy, or work on a new empty layer above. Then the untouched original is always sitting underneath, and any mistake is one deletion away from being fixed. This is called non-destructive editing, it is the single professional habit separating good work from unrecoverable work, and the next lesson takes it further.

BACKGROUND LAYERS ARE LOCKED by default — the little padlock. Click it to unlock, or duplicate the layer and leave the locked one alone as your safety net.',
      'Open a photo and duplicate the background layer with Ctrl+J. Rename the copy something meaningful. Make an obvious change to the copy — anything at all — then toggle the eye icon on and off to compare with the untouched original beneath. Now reduce the copy''s opacity to 50% and watch the effect soften. Finally add a third layer, drag it above and below the others, and confirm you can predict what covers what.',
      '[{"question": "Your text layer has vanished behind the photo. What is the likely fix?", "options": ["Drag the text layer higher in the Layers panel — the stack reads top-down", "Increase the text size", "Flatten the image", "Re-open the file"], "correct_index": 0}, {"question": "Why duplicate the background layer before editing?", "options": ["The untouched original stays underneath, so any mistake is recoverable", "It makes Photoshop run faster", "Duplicated layers export at higher quality", "The background layer cannot be edited at all"], "correct_index": 0}]'::jsonb)
  on conflict (module_id, order_number) do nothing;
  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m2, 'Layer Masks: Editing Without Destroying', 'Adobe''s own channel, with Jesús Ramirez, on layer masks in seven minutes — hiding parts of a layer instead of deleting them.', 'https://www.youtube.com/watch?v=fE1_nHllIp8', 1,
      array['Add a layer mask and paint on it to reveal or hide', 'Explain why masking is reversible where erasing is not', 'Blend two images together with a soft-edged mask'],
      'The eraser deletes pixels. A mask HIDES them. That single difference is why professionals never use the eraser on anything they might reconsider — and you will reconsider.

HOW A MASK WORKS, and it is simpler than it looks: a mask is a black-and-white image attached to a layer. WHITE REVEALS, BLACK CONCEALS. Paint black onto the mask and that part of the layer disappears from view; paint white over it and it comes straight back. Nothing was ever destroyed.

Grey gives partial transparency, which is how you get an edge that blends rather than a cut-out that looks pasted on.

THE WORKFLOW: select the layer, click the mask button at the bottom of the Layers panel, choose the brush tool, and check your foreground colour. Press D to reset to black and white, and X to swap between them — you will press X constantly, painting black to hide and white to fix the bit you overdid.

WHAT MASKS ARE ACTUALLY FOR:
- Removing a background so a product sits on white for a listing
- Blending two photos so the join is invisible
- Applying an adjustment to only part of an image — brighten a face without brightening the sky
- Any edit you want to be able to reverse in six months

A SOFT BRUSH IS USUALLY RIGHT. Hard edges look cut out. Set brush hardness low for a natural transition, and use a small hard brush only where the real edge is genuinely sharp.

AND IF THE MASK SEEMS TO DO NOTHING: you are almost certainly painting on the LAYER rather than the mask. Click the mask thumbnail — the white rectangle beside the layer image — so it has the highlight border. That mistake accounts for most of the confusion beginners have with masks.',
      'Take two photos and stack them. Add a mask to the top one and paint with a soft black brush until the lower image shows through in a way that looks deliberate. Then press X and paint white to bring back a part you removed — proving nothing was lost. Finally, do the same job with the eraser instead, close without saving, and note how much less freedom you had.',
      '[{"question": "On a layer mask, what does painting with black do?", "options": ["Hides that part of the layer, reversibly", "Permanently deletes those pixels", "Fills the area with black paint", "Locks that area from further edits"], "correct_index": 0}, {"question": "Your brush strokes are appearing on the picture instead of masking it. What is wrong?", "options": ["The layer thumbnail is selected rather than the mask thumbnail", "The brush is too soft", "The layer needs to be rasterised first", "Masks only work on background layers"], "correct_index": 0}]'::jsonb),
    (v_m2, 'Removing Blemishes and Unwanted Objects', 'Adobe Photoshop''s own tutorial on the Spot Healing Brush and Patch tool — taking out a spot, a wire, or a person who wandered into the shot. Under 5 minutes.', 'https://www.youtube.com/watch?v=sAvn1vo4xDY', 2,
      array['Remove a small blemish with the Spot Healing Brush', 'Remove a larger object with the Patch tool', 'Retouch on a separate layer so the original stays intact'],
      'This is the skill people actually pay for. A portrait with a distracting mark removed, a product photo without the cable in the corner, an event picture where the bin has gone.

THE SPOT HEALING BRUSH is the one to reach for first. Click on a blemish and Photoshop samples the surrounding area and blends it away. Size the brush slightly LARGER than the mark, click once, and move on — dragging it around usually makes a smear.

THE PATCH TOOL handles bigger things. Draw a loose selection around the object, then drag that selection to a clean area of similar texture. Photoshop takes the texture from where you dragged to and matches the lighting back where the object was.

THE HEALING BRUSH (no "spot") lets you choose the source yourself: Alt-click a clean area to sample, then paint. Use it when automatic sampling picks up something wrong — an edge, a different colour — which happens most often near boundaries.

WORK ON A SEPARATE LAYER. Add an empty layer above, and in the options bar tick "Sample All Layers". Every repair then lands on that layer, so you can hide it to compare, reduce its opacity if you overdid it, or erase one bad fix without touching the rest.

WORK AT 100% ZOOM. Retouching that looks perfect at 25% falls apart when someone opens the full-size file.

AND KNOW WHEN TO STOP. The most common beginner mistake in portrait retouching is removing every pore and line until the person looks like plastic. Take out temporary things — a spot, a stray hair, a distraction — and leave what makes the face that person''s face. Clients notice being made to look fake far more than they notice a small blemish, and if you are retouching someone''s photograph for money, that restraint IS the professionalism.

A NOTE THIS VIDEO DOES NOT COVER: newer Photoshop versions add a Remove tool that does much of this in one stroke. If your version has it, use it — but learn the Patch tool anyway, because it works everywhere, including in Photopea and older installations.',
      'Find a photo with something you would rather was not there. Add an empty layer, tick Sample All Layers, and remove one small blemish with the Spot Healing Brush and one larger object with the Patch tool — both at 100% zoom. Then toggle the retouch layer off and on. If the difference is invisible until you look for it, you have it right; if the eye is drawn to where you worked, undo and go gentler.',
      '[{"question": "Why do retouching on a separate empty layer with Sample All Layers ticked?", "options": ["You can compare, soften or undo individual repairs without touching the original", "It is the only way the healing tools function", "It reduces the file size", "It prevents the image from being flattened on export"], "correct_index": 0}, {"question": "What is the most common mistake in portrait retouching?", "options": ["Over-smoothing until the person looks artificial", "Working at too high a zoom level", "Using a brush that is too large for a blemish", "Saving the file as .psd"], "correct_index": 0}]'::jsonb)
  on conflict (module_id, order_number) do nothing;
  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m3, 'Fixing Exposure and Colour with Levels and Curves', 'LearnFree on levels, curves and colour correction — rescuing a photo that is too dark, too flat, or the wrong colour. About 7 minutes.', 'https://www.youtube.com/watch?v=to7CA14b5zE', 1,
      array['Read a histogram and see whether an image is under- or over-exposed', 'Correct brightness and contrast with a Levels adjustment', 'Fix a colour cast so whites look white'],
      'Most photographs that look amateur are not badly composed — they are badly exposed or the wrong colour. Both are fixable in about a minute once you can read a histogram.

THE HISTOGRAM is a graph of how much of the image is dark (left), mid-toned (middle) and bright (right). Everything bunched to the left means underexposed; bunched right means overexposed; bunched in the middle with nothing at either end means flat and lifeless, which is the most common problem of all.

LEVELS gives you three sliders under that graph. Drag the BLACK point right until it touches where the data starts, and the WHITE point left until it touches where the data ends. That one move — setting the black and white points — makes a flat photo look properly exposed, and it takes seconds. The middle slider adjusts overall brightness without moving those endpoints.

CURVES does the same job with finer control. A gentle S-shape adds contrast: pull the shadows down a little, the highlights up a little. Small movements. Curves punishes enthusiasm.

COLOUR CASTS — the whole image looking orange indoors, or blue in shade — come from the light source. The fastest fix is the grey eyedropper in Levels: click something that should be neutral grey or white, and Photoshop corrects everything else to match. A white shirt, a wall, a sheet of paper.

USE ADJUSTMENT LAYERS, NOT THE IMAGE MENU. Image > Adjustments applies the change permanently to the pixels. An adjustment layer (the half-filled circle at the bottom of the Layers panel) sits above the image and can be reopened, reduced in opacity, masked to affect only part of the picture, or deleted entirely. Same result, completely reversible — this is the layer-mask principle applied to tone.

AND CHECK ON A PHONE. Most people will see your work on a phone screen at half brightness in daylight. An edit that looks subtle on a laptop can vanish entirely there.',
      'Take a photo that is too dark or too flat. Add a Levels ADJUSTMENT LAYER, and drag the black and white points inward to meet the ends of the histogram data. Compare before and after with the eye icon. Then find a photo with a colour cast and fix it with the grey eyedropper on something that should be neutral. Finally, mask one adjustment so it affects only half the image — proof that tone and masks work together.',
      '[{"question": "The histogram shows everything bunched in the middle with nothing at either end. What does that mean?", "options": ["The image is flat and low in contrast — bring the black and white points inward", "The image is overexposed", "The image has a colour cast", "The file is corrupted"], "correct_index": 0}, {"question": "Why use an adjustment layer instead of Image > Adjustments?", "options": ["It stays editable, can be masked, softened or deleted later", "It produces stronger contrast", "It is the only method that supports colour correction", "It exports faster"], "correct_index": 0}]'::jsonb),
    (v_m3, 'Saving and Exporting for Web, Print and WhatsApp', 'LearnFree on saving images: which format to use, and how to get a file that is the right size for where it is going. Under 5 minutes.', 'https://www.youtube.com/watch?v=svipv2z0fPw', 2,
      array['Choose between JPEG, PNG and PSD for a given job', 'Export a web-sized image that stays sharp without being huge', 'Keep an editable master file alongside every export'],
      'The last step is where a lot of otherwise good work is ruined — a 12MB file emailed to a client, or a logo saved as a JPEG with a white box behind it.

WHICH FORMAT:

JPEG for photographs. Small files, no transparency, and it loses a little quality each time you re-save. Fine as a final export; never as your working file.

PNG for anything needing TRANSPARENCY — logos, cut-out products — and for screenshots and graphics with sharp edges and flat colour. Bigger files than JPEG for a photograph, so do not use it for one.

PSD is your master. Layers intact, nothing lost. Always keep it.

PDF when a client is printing it.

SIZE MATTERS MORE HERE THAN ALMOST ANYWHERE. Your camera produces a 4000-pixel-wide image; a website needs about 1500 at most, and a WhatsApp status far less. Exporting the full-size file makes a page slow to load, costs your Kenyan viewer real money in data, and gains nothing visible. Resize on export.

RULES OF THUMB: web images around 1200-2000 pixels on the long edge and under about 300KB. Print needs 300 DPI at the physical size — a full A4 page is roughly 2480 x 3508 pixels, so never upscale a small web image for print, because the detail is not there to recover.

EXPORT AS is the modern route: File > Export > Export As lets you set format, dimensions and quality and shows the resulting file size before you commit. Watch that number. JPEG quality 60-80 is usually indistinguishable from 100 at a fraction of the size.

NAME FILES SO THEY CAN BE FOUND — client-product-front-web.jpg beats final_FINAL_2.jpg, and clients judge you on it.

AND SEND THE RIGHT THING. A client asking for "the photos" wants JPEGs at a usable size. Send them a folder of PSDs and they cannot open any of it. Keep the master, deliver the export.',
      'Take one finished edit and export it three ways: a web JPEG about 1600 pixels wide under 300KB, a PNG with a transparent background if the image suits it, and keep the layered PSD. Compare the three file sizes. Then open the web JPEG at 100% and check it still looks sharp — that trade-off between size and sharpness is the judgement this lesson is teaching.',
      '[{"question": "A client needs a logo to place over a coloured background. Which format?", "options": ["PNG, because it supports transparency", "JPEG, because the file is smaller", "PSD, so they can edit it", "It makes no difference"], "correct_index": 0}, {"question": "Why resize a 4000-pixel photo before putting it on a website?", "options": ["The full size loads slowly and costs the viewer data for no visible gain", "Large images cannot be uploaded", "Websites reject files over 1MB", "Resizing improves the sharpness"], "correct_index": 0}]'::jsonb)
  on conflict (module_id, order_number) do nothing;

  -- ---- Notion for Work & Business ----
  select id into v_course_id from public.courses where slug = 'notion-for-work';

  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Foundations', 'What Notion is, how it is put together, and how to share it without leaking anything.', 1) returning id into v_l1;
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills', 'Databases — the feature that separates Notion from a notes app.', 2) returning id into v_l2;
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'A workspace a team can use, and templates that stop it degenerating.', 3) returning id into v_l3;

  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_l1, 'Getting Started', 'How Notion is put together, and the sharing settings you need to understand before you put anything real in it.', 1) returning id into v_m1;
  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_l2, 'Core Skills in Practice', 'Databases: building one, then bending it into whatever view answers the question in front of you.', 2) returning id into v_m2;
  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_l3, 'Working Like a Pro', 'Setting a workspace up so other people can use it, and templates that stop it falling apart.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m1, 'What Notion Is and How It Fits Together', 'Notion''s own training on the basics — pages, blocks, and the sidebar. About 8 minutes.', 'https://www.youtube.com/watch?v=aA7si7AmPkY', 1,
      array['Create pages and nest them inside each other', 'Explain what a block is and rearrange content by dragging', 'Decide what belongs in Notion and what does not'],
      'Notion is built from two ideas, and once both land the rest is detail.

EVERYTHING IS A BLOCK. A paragraph is a block. So is a heading, an image, a to-do checkbox, a table, an embedded video. Type "/" anywhere and you get the list of block types you can insert. Every block can be dragged by the handle on its left and dropped somewhere else, including side by side to make columns. There is no page layout to fight with — you move blocks.

EVERYTHING IS A PAGE, AND PAGES NEST. A page can sit inside another page, which sits inside another. That is the whole organising structure — no folders, no files. Your sidebar is the top of that tree.

WHY THIS MATTERS FOR WORK: a client page can hold their brief, the meeting notes, the invoice, and a task list, all as sub-pages of one place. Nothing lives in a folder somewhere else. When you need to hand a project over, you share one page.

START SMALLER THAN YOU WANT TO. The characteristic Notion failure is spending a weekend building an elaborate system and never using it. Make one page for real work today. Add structure only when the lack of it annoys you.

WHAT NOTION IS GENUINELY GOOD AT: notes that need to be found again, documented processes, client and project records, anything a small team needs to read in one place.

WHAT IT IS NOT: it is not a spreadsheet — real calculation belongs in Sheets or Excel. It is not accounting software. And it needs a connection: offline access is limited, so if you work where the network drops, keep anything you truly cannot lose somewhere that works offline too. Say that plainly to a client before you move their work into it.',
      'Create one page for something real — a client, a project, a course you are taking. Add a heading, a paragraph, a to-do list and an image using the "/" menu. Then drag one block to a completely different position, and drag another beside an existing block to make two columns. Finally create a sub-page inside it and find both in the sidebar.',
      '[{"question": "What is a block in Notion?", "options": ["Any single piece of content — a paragraph, image, checkbox — that can be dragged and rearranged", "A locked section that cannot be edited", "A template you buy from the Notion store", "A permission setting for a page"], "correct_index": 0}, {"question": "How is content organised in Notion?", "options": ["Pages nest inside other pages — there are no folders", "Files are stored in folders like a computer", "Everything sits in one long document", "Content is sorted automatically by date"], "correct_index": 0}]'::jsonb),
    (v_m1, 'Sharing and Permissions', 'Notion''s own guide to sharing — who can see what, guests versus members, and publishing to the web. About 10 minutes.', 'https://www.youtube.com/watch?v=x2Ov8tsfXhU', 2,
      array['Share a page with the right level of access for the person', 'Tell the difference between inviting a guest and publishing to the web', 'Check what a client can actually see before sending a link'],
      'Learn this BEFORE you put client work in Notion. Getting it wrong means either a client who cannot open the link you sent, or something confidential readable by anyone who finds the URL.

THE ACCESS LEVELS, from least to most:
- CAN VIEW — read only
- CAN COMMENT — read and leave comments, no edits
- CAN EDIT — change the content
- FULL ACCESS — change the content AND change who else has access

Give the least that does the job. A client reviewing a draft needs Can comment, not Full access.

PERMISSIONS INHERIT DOWNWARD. Share a page and everything nested inside it goes too — including sub-pages you had forgotten were there. Before sharing a parent page, open it and look at what is underneath.

GUESTS versus MEMBERS: a member belongs to your workspace and can generally see the shared parts of it. A guest is invited to specific pages only. For clients and contractors, guest is almost always right.

PUBLISH TO WEB IS THE DANGEROUS ONE, and it is a separate switch from sharing with a person. Turning it on makes the page readable by ANYONE with the link, no login, and search engines can index it. It is genuinely useful — a public portfolio, a price list, a form — but never for anything you would not put on a billboard.

THE CHECK THAT TAKES TEN SECONDS: after sharing, open the link in a private browsing window where you are not logged in. What you see is exactly what an outsider sees. Do this every single time you share something that matters. It catches both failure modes — the client who gets a login wall, and the internal note you did not mean to publish.

AND WHEN A PROJECT ENDS, remove the guest. Access left open for years is a small, quiet risk that costs nothing to close.',
      'Create a page with a sub-page inside it. Share the parent with a friend''s email as a guest with Can comment, and confirm they can see the sub-page too — that is inheritance in action. Then turn on Publish to web and open the link in a private browsing window to see exactly what a stranger sees. Turn it off again. Do that last step twice, until finding the toggle is automatic.',
      '[{"question": "What does turning on Publish to web do?", "options": ["Makes the page readable by anyone with the link, with no login, and indexable by search engines", "Shares it with everyone in your workspace only", "Creates a backup copy on Notion''s servers", "Converts the page to a template"], "correct_index": 0}, {"question": "What is the fastest way to check what an outsider can see?", "options": ["Open the shared link in a private browsing window where you are not logged in", "Ask Notion support to review the page", "Read the permission list on the page", "Send it to the client and wait for feedback"], "correct_index": 0}]'::jsonb)
  on conflict (module_id, order_number) do nothing;
  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m2, 'Your First Database: a Content Calendar', 'Notion''s own walkthrough of building a database from scratch — a content calendar for a marketing team. Under 5 minutes.', 'https://www.youtube.com/watch?v=WAjGg5ubA8I', 1,
      array['Create a database and add records with useful properties', 'Explain how a Notion database differs from a spreadsheet table', 'Choose the right property type for each piece of information'],
      'This is the lesson that changes what Notion is for. Up to here it has been a nicer notes app. A database turns it into a system.

THE KEY DIFFERENCE FROM A SPREADSHEET: every ROW in a Notion database is itself a full PAGE. A row in your content calendar is not just a line of cells — open it and you get a page holding the draft, the images, the client feedback, the checklist. The table is the index; the page is the work. A spreadsheet cannot do that, and it is the reason people move.

PROPERTIES ARE COLUMNS, and choosing the type properly is most of the skill:
- TEXT for anything free-form
- SELECT for one choice from a fixed list — status, category
- MULTI-SELECT for several — tags, platforms
- DATE for deadlines, which is what makes calendar views possible
- PERSON for who owns it
- CHECKBOX for done or not
- FILES for attachments
- RELATION to link to a row in another database — the tasks for a client, the invoices for a project

USE SELECT, NOT TEXT, FOR ANYTHING YOU WILL FILTER BY. Typed text drifts — "Done", "done", "DONE" become three different values and your filters quietly miss things. A select field only allows the options you defined. This is the same lesson dirty data teaches everywhere.

START WITH FOUR OR FIVE PROPERTIES, no more. Every extra column is something to fill in, and a database nobody updates is worse than no database, because people trust it and it is wrong.

AND ONE DATABASE, NOT MANY. The instinct is a separate table per month or per client. Keep one, and use views — the next lesson — to slice it. Splitting is what makes Notion workspaces unmaintainable.',
      'Build a real content calendar or task tracker with five properties: a title, a date, a status as a SELECT (not text), a person, and one multi-select for tags. Add six real rows. Then open one row as a full page and put actual content inside it — a draft, a link, a checklist. That page-inside-a-row is the thing a spreadsheet cannot do.',
      '[{"question": "What can a Notion database row do that a spreadsheet row cannot?", "options": ["Open as a full page holding drafts, files and checklists", "Hold more than 100 characters", "Be sorted by date", "Contain a formula"], "correct_index": 0}, {"question": "Why use a Select property rather than plain text for status?", "options": ["Typed text drifts into inconsistent values and filters then miss rows", "Text properties cannot be displayed in a table", "Select properties are required for sharing", "Text properties have a character limit"], "correct_index": 0}]'::jsonb),
    (v_m2, 'Views, Filters and Properties', 'Notion''s own deeper guide to databases — properties, views, filters and templates, and how one set of records becomes many useful screens. About 6 minutes.', 'https://www.youtube.com/watch?v=Nx114VWepoI', 2,
      array['Show the same data as a table, board, calendar or gallery', 'Filter and sort a view to answer one specific question', 'Use a database template so new records start correctly'],
      'One database, many views. This is the idea that makes Notion worth learning, and it is the thing people most often miss.

YOUR RECORDS DO NOT MOVE. A view is just a different lens on the same rows. Change something in one view and every other view updates, because there is only ever one copy of the data.

THE VIEW TYPES AND WHEN EACH EARNS ITS PLACE:
- TABLE — the default. Best for scanning a lot of records and their properties.
- BOARD — kanban columns grouped by a select property, usually Status. Dragging a card from In Progress to Done actually changes the property. This is the same discipline a Trello board gives you, on the same data as your table.
- CALENDAR — laid out by a date property. Obvious for anything with deadlines, and the reason your date field needs to be a real Date type.
- GALLERY — big previews. Good for anything visual: portfolio pieces, product shots.
- LIST — stripped back, for reading.

FILTERS ARE WHERE THE VALUE IS. Build a view filtered to "Status is not Done AND Owner is me AND Due date is within the next week" and you have a personal to-do screen that maintains itself. You never file anything into it; it just shows what matches. Then a second view, unfiltered, for the full picture. Same records.

SORTING makes a view readable — by due date for work, by created date for a log.

DATABASE TEMPLATES are the quiet time-saver. Set a template for the database and every new row starts with your standard structure already inside: the meeting-notes headings, the client-onboarding checklist. Nobody has to remember the format, so nobody skips it.

AND NAME VIEWS FOR THEIR PURPOSE — "My week", "Awaiting client", "Everything". A row of views called Table, Table 2, Board is a system nobody else can use.',
      'On the database you built, create three views of the same records: a Board grouped by Status, a Calendar by your date property, and a Table filtered to show only what is not Done and due in the next seven days. Name each for its purpose. Then drag a card between board columns and confirm the status changed in the table view too — one set of data, three lenses.',
      '[{"question": "You change a record in the board view. What happens in the calendar view?", "options": ["It updates too — views are lenses on one set of records", "Nothing; each view holds its own copy", "It updates only after a manual sync", "The record is removed from the calendar"], "correct_index": 0}, {"question": "What makes a filtered view better than a manually maintained to-do list?", "options": ["It updates itself — anything matching the filter appears without being filed", "It can hold more items", "It can be shared publicly", "It sends reminders automatically"], "correct_index": 0}]'::jsonb)
  on conflict (module_id, order_number) do nothing;
  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m3, 'Building a Workspace a Team Can Use', 'Notion''s own guide to structuring a workspace for a team rather than for yourself. Under 5 minutes.', 'https://www.youtube.com/watch?v=5rWbNTrIJQI', 1,
      array['Structure a workspace so a newcomer can find things unaided', 'Decide what is shared with everyone and what stays private', 'Agree the few conventions that keep a shared space usable'],
      'A workspace built for one person and a workspace built for a team are different things. The first can rely on you remembering where everything is. The second cannot.

THE TEST THAT MATTERS: could someone who joined this morning find the client brief without asking anyone? If not, the structure is wrong, however elegant it looks to you.

A SHAPE THAT WORKS for a small team or a freelancer with clients:
- A HOME page: what this workspace is, where things live, links to the main areas. One page, boring, and the single most useful thing in the whole setup.
- CLIENTS or PROJECTS: one database, one row per client, each opening to their own page.
- A TASK DATABASE, shared, related to the projects database so a task knows which client it belongs to.
- DOCS or WIKI: how we do things — the processes you currently explain over and over on WhatsApp.
- PERSONAL pages, private to each person.

FLAT BEATS DEEP. Something buried five levels down does not exist. Two or three levels is usually enough, and the home page carries the links.

AGREE THE CONVENTIONS EARLY, and write them on the home page. Where new client pages go. What the status values mean — specifically, what "Done" means, because everyone assumes their own definition. Who is allowed to delete things. Five lines of agreement prevents most of the mess.

ONE PERSON OWNS THE STRUCTURE. Shared spaces where everyone reorganises freely become unnavigable within a month. Anyone can add content; one person tends the shape.

AND ACCEPT THAT ADOPTION IS THE HARD PART. The system that works is the one your colleagues actually open, which is usually a simpler one than you wanted to build. Start with a task database and a home page. Earn the rest.',
      'Design a workspace for a real team or your own client work: a home page, a projects or clients database, a task database, and one docs page. Write on the home page where each thing lives and what your status values mean. Then apply the test — hand the link to someone who has never seen it and ask them to find one specific thing, without helping. Watch where they hesitate.',
      '[{"question": "What is the practical test of a good team workspace?", "options": ["Someone who joined this morning can find what they need without asking", "It uses every database property type available", "Every page is nested under a single parent", "It has a view for each person"], "correct_index": 0}, {"question": "Why should one person own the workspace structure?", "options": ["Shared spaces everyone reorganises freely become unnavigable", "Notion only allows one editor at a time", "It reduces the subscription cost", "Other members cannot create pages"], "correct_index": 0}]'::jsonb),
    (v_m3, 'Templates That Keep It Tidy', 'Notion''s own guide to building a good template — so recurring work starts from the same structure every time. About 8 minutes.', 'https://www.youtube.com/watch?v=W4p7tntGYQg', 2,
      array['Build a template for work you repeat', 'Write instructions inside a template so others use it correctly', 'Decide what belongs in a template and what does not'],
      'Anything you do more than twice should be a template. Client onboarding, meeting notes, a project kickoff, a monthly report — the structure is the same every time, and re-creating it by hand is both slow and inconsistent.

A TEMPLATE IS A PAGE you can spawn copies of, on demand or as the default for every new database row. The second is the powerful one: set a database template and every new record already contains the checklist, the headings, the fields to fill in. Nobody has to remember the format, so nobody quietly invents their own.

WHAT A GOOD TEMPLATE CONTAINS:
- The headings, in the order the work is actually done
- Checklists for steps that get forgotten
- Placeholder text saying what goes in each section
- Links to anything needed every time

WRITE THE INSTRUCTIONS INSIDE IT. A line in italics saying "replace this with the client''s stated goal, in their own words" makes a template usable by someone who was not there when you designed it. Templates without instructions get used wrongly and then abandoned.

TEMPLATES WORTH BUILDING FIRST, if you work with clients: a client onboarding page (what you need from them, what they get, when), a meeting notes page (attendees, decisions, actions with owners), and a project page (scope, deliverables, deadline, what is NOT included). That last one connects directly to the discipline of writing scope down.

KEEP THEM SHORT. A forty-field template gets half-filled and stops being trusted. Better a ten-line one that is completed every time.

AND REVISE THEM. When you find yourself adding the same thing to every copy, put it in the template. When a section is always left blank, delete it. A template is a living document, and the ten minutes a month it takes to maintain is repaid every time you start a job with the thinking already done.

ONE HONEST CAUTION: Notion''s public template gallery is full of elaborate systems built to be impressive rather than used. Borrow ideas, but build yours around work you actually do.',
      'Build one template for something you genuinely repeat — client onboarding, meeting notes, or a weekly report. Include headings, a checklist, and italic instructions saying what belongs in each section. Set it as the default template on the relevant database, create a new record from it, and fill it in for real. Then delete anything you did not use and add anything you had to type manually.',
      '[{"question": "Why write instructions inside a template?", "options": ["So someone who was not there when you designed it can use it correctly", "Notion requires a description on every template", "It makes the template appear in the public gallery", "Instructions are needed for the template to save"], "correct_index": 0}, {"question": "A section of your template is always left blank. What should you do?", "options": ["Delete it — an unused field makes the template less likely to be completed", "Make it a required field", "Move it to the top so it is not missed", "Leave it; templates should be comprehensive"], "correct_index": 0}]'::jsonb)
  on conflict (module_id, order_number) do nothing;

end $$;
