-- Curated catalog day 10. ONE course: Print-on-Demand with Printful.
--
-- All six videos come from Printful Custom Printing, the company's own
-- channel, and every id was confirmed through the YouTube Data API for
-- channel, exact title, duration and embeddability before any lesson
-- content was written. A seventh official video, "What Is Printful and
-- How Does Print-On-Demand Work", was rejected at 2:04 -- under the
-- three-minute floor.
--
-- THE HONEST FRAMING, written into the course description and the first
-- lesson rather than buried: Printful prints and ships from the US, EU,
-- Mexico and Japan. A Kenyan learner using it is running an EXPORT
-- business -- designing here, selling to customers abroad, earning
-- foreign currency. Shipping to Kenya is slow and expensive, so this is
-- not a way to sell to your neighbours. The course says so up front,
-- because a learner who discovers that after paying has been misled.
--
-- TOPIC SUPPLY is still the binding constraint. Researched and rejected
-- this firing:
--   Canva               -> Canva's own 10-part beginners series exists and
--                          is good, but graphic-design and
--                          presentation-design already teach Canva. A third
--                          Canva-teaching course is padding. Logged instead
--                          as a sourcing lead for the deepening routine.
--   Microsoft Word      -> no official Microsoft channel appears; the best
--                          results are individual creators
--   Zendesk / support   -> one official demo video, not six
--   Adobe Firefly       -> two official videos, not six
--
-- Every lesson ships with objectives, notes, a practice activity and a
-- knowledge check, so this course does not add to the bare-lesson backlog.

insert into public.courses (slug, title, description, level, price, published, display_order, category) values
  ('print-on-demand', 'Print-on-Demand with Printful', 'Sell T-shirts, hoodies, mugs and posters carrying your own designs without buying stock or handling a single parcel. You upload a design, a customer orders, and Printful prints and ships it for you. IMPORTANT AND STATED UP FRONT: Printful prints in the US, EU, Mexico and Japan, so this is a way to sell to customers ABROAD and earn in foreign currency — not a way to sell to people in Nairobi, where shipping would be slow and expensive. If you can design, or are willing to learn, this is one of the few online businesses you can genuinely start with no capital. Taught entirely by Printful''s own channel.', 'beginner', 500, true, 510, 'business-freelancing')
on conflict (slug) do nothing;

do $$
declare
  v_course_id uuid;
  v_l1 uuid; v_l2 uuid; v_l3 uuid;
  v_m1 uuid; v_m2 uuid; v_m3 uuid;
begin

  -- ---- Print-on-Demand with Printful ----
  select id into v_course_id from public.courses where slug = 'print-on-demand';

  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Foundations', 'How print-on-demand works, whether it works from Kenya, and getting set up.', 1) returning id into v_l1;
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Core Skills', 'Turning a design into a product that looks real enough for a stranger to buy.', 2) returning id into v_l2;
  insert into public.levels (course_id, title, description, order_number) values
    (v_course_id, 'Working Like a Pro', 'Pricing so there is actually money left, and putting it in front of buyers.', 3) returning id into v_l3;

  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_l1, 'Getting Started', 'What the business actually is, what it costs you, and how the platform works.', 1) returning id into v_m1;
  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_l2, 'Core Skills in Practice', 'Getting a design onto a product, and producing images that make a stranger trust it enough to buy.', 2) returning id into v_m2;
  insert into public.modules (course_id, level_id, title, description, order_number) values
    (v_course_id, v_l3, 'Working Like a Pro', 'The two things that separate a shop that earns from a shop that exists: pricing that leaves you something, and a storefront customers can actually reach.', 3) returning id into v_m3;

  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m1, 'How Print-on-Demand Actually Works', 'Printful''s own nine-step walkthrough of starting a print-on-demand business — what happens between a customer clicking buy and a parcel arriving. Under 9 minutes.', 'https://www.youtube.com/watch?v=YWkZhHNdOEI', 1,
      array['Explain what happens between an order and a delivered product', 'Say what the business costs you to start and what it costs per sale', 'Judge honestly whether this model fits your situation'],
      'The model in one sentence: you upload a design, someone buys a product carrying it, and Printful prints and posts that single item to them. You never buy stock, never hold inventory, and never go to a post office.

WHAT IT COSTS. Nothing to open an account, and nothing until something sells. When it does, Printful charges you the base price of the item plus printing plus shipping, and you keep whatever the customer paid above that. There is no risk of unsold stock, which is the entire appeal.

WHAT THAT REALLY MEANS FOR MARGINS: they are thin, because you are paying retail-ish prices for one item at a time rather than wholesale for a hundred. Expect a few dollars per shirt, not tens. Volume and repeat buyers are how this earns, not a big markup on each sale.

NOW THE PART THIS COURSE WILL NOT SOFTEN, and you should decide on it before going further. PRINTFUL PRINTS IN THE UNITED STATES, EUROPE, MEXICO AND JAPAN. It does not print in Kenya. That means:

- YOUR CUSTOMERS ARE ABROAD. This is an export business. You design here and sell to people in the US, UK and Europe, who pay in dollars, pounds or euros. That is genuinely attractive — foreign-currency income earned from a laptop — but it is a different business from selling locally.
- SELLING TO KENYAN CUSTOMERS THROUGH PRINTFUL IS IMPRACTICAL. Shipping from the US to Nairobi is slow and the postage often costs more than the shirt. If your plan is to sell to people around you, print-on-demand through an overseas supplier is the wrong tool, and a local printer working on small runs is the right one.
- GETTING PAID needs thought. You will be paid through whichever store platform you sell on, into PayPal or a bank account, and there will be fees and currency conversion. Work out that route before you build a store, not after your first sale.

WHAT ACTUALLY DECIDES WHETHER THIS WORKS is not the platform, which is easy. It is whether you have DESIGNS PEOPLE WANT and a specific audience to sell them to. Generic quotes on a T-shirt compete with millions of identical listings. A design that means something precise to a particular group — a sport, a profession, a subculture, a joke only they get — is what sells. If you cannot design yet, the Graphic Design and Digital Illustration paths on this site are the prerequisite, not an optional extra.

AND BE REALISTIC ABOUT COMPETITION. This is a crowded market with a lot of people doing it badly and a few doing it well. The ones who earn treat it as a design and marketing business that happens to use a printing service.',
      'Before opening an account, answer three questions in writing. Who exactly is your customer, and in which country — be specific, not "anyone who likes football". What can you design, or who will design for you? And how will the money reach you: which selling platform, into which account, and what does the conversion cost? If you cannot answer the third, solve that first — it is the step most people discover too late.',
      '[{"question": "Where does Printful print and ship from?", "options": ["The US, EU, Mexico and Japan — so your customers are abroad, not in Kenya", "Locally in each customer''s country, including Kenya", "A single warehouse in the United States only", "Wherever the seller is based"], "correct_index": 0}, {"question": "What actually decides whether a print-on-demand business earns?", "options": ["Designs a specific audience wants, and reaching that audience", "Choosing the right printing platform", "Listing as many products as possible", "Setting the lowest price in the market"], "correct_index": 0}]'::jsonb),
    (v_m1, 'Setting Up and Finding Your Way Around', 'Printful''s full beginner tutorial — the dashboard, product catalogue, and how an order moves through the system. About 15 minutes.', 'https://www.youtube.com/watch?v=T4hpN0Ba9AU', 2,
      array['Set up an account and understand each area of the dashboard', 'Read a product''s base cost, print areas and fulfilment time', 'Order a sample before selling anything'],
      'The platform is genuinely simple; the decisions inside it are where beginners lose money.

READ THE PRODUCT PAGE PROPERLY before you fall in love with an item. Each one lists the base cost you pay, the available sizes and colours, the print areas and their exact pixel requirements, and the fulfilment time. That last one matters: fulfilment happens BEFORE shipping, so a two-day fulfilment plus a week of postage is a nine-day wait your customer will judge you on.

CHOOSE FEWER PRODUCTS THAN YOU WANT TO. A shop with four products you have checked beats forty you have not. Every product is a different fit, a different print area and a different set of complaints.

PRINT FILES ARE WHERE QUALITY IS WON OR LOST. Printful states the pixel dimensions and DPI for each print area. Upload something smaller and it prints soft and blurry, and the customer blames you rather than the file. Design at the size stated, in the colour mode stated, with a transparent background where the garment colour should show through.

ORDER A SAMPLE OF ANYTHING YOU INTEND TO SELL. This is the advice everyone skips and everyone regrets. You cannot judge print quality, colour accuracy or how a garment actually fits from a mockup on a screen. Printful discounts samples for exactly this reason. It costs you one item and it is the difference between selling with confidence and finding out through a refund request.

And if you are in Kenya, a sample shipped here is slow and pricey — so consider ordering one to a friend or relative abroad who can photograph it for you, or accept the cost once as the price of knowing.

UNDERSTAND WHO ANSWERS THE CUSTOMER. Printful prints and posts; YOU handle the customer. A lost parcel, a wrong size, a print that is off-centre — they message you, and your response is what determines whether they buy again. Decide your policy on reprints and refunds before the first order, and write it on your store.

AND CHECK THE FULFILMENT REGION. Printful routes orders to the facility nearest the customer, which is why a US buyer gets it quickly and why the whole model works better the closer your customers are to a print centre.',
      'Open an account and go through the catalogue properly: pick one product and write down its base cost, its print area dimensions in pixels, and its stated fulfilment time. Then work out what a customer in the US would pay in total including shipping, and what would be left for you. If that number is smaller than you expected, you have learned the most important thing in this course before spending anything.',
      '[{"question": "Why order a sample before selling a product?", "options": ["Print quality, colour and fit cannot be judged from an on-screen mockup", "Printful requires a sample order before listing", "It speeds up fulfilment of later orders", "Samples are the only way to see the base cost"], "correct_index": 0}, {"question": "Who handles a customer''s complaint about a wrong size?", "options": ["You do — Printful prints and ships, but the customer relationship is yours", "Printful, through their own support team", "The selling platform, such as Etsy or Shopify", "Nobody; print-on-demand orders cannot be returned"], "correct_index": 0}]'::jsonb)
  on conflict (module_id, order_number) do nothing;
  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m2, 'Creating Your First Products', 'Printful''s walkthrough of the product creation flow — uploading a design, placing it, and saving a sellable product. Under 7 minutes.', 'https://www.youtube.com/watch?v=jgLibs72fcE', 1,
      array['Upload a print file at the correct size and place it accurately', 'Build product variants across sizes and colours', 'Write a product description that answers what buyers actually ask'],
      'This is the core loop of the whole business: design in, product out.

GET THE FILE RIGHT FIRST. Use the pixel dimensions Printful states for that print area, at 300 DPI, as a PNG with a transparent background. A JPEG will print a white box around your design on a coloured shirt, which is the single most common beginner mistake and it is entirely avoidable.

PLACEMENT IS A DESIGN DECISION, not a default. A chest print sits differently on a small and a 3XL, and Printful scales within the print area rather than resizing the garment. Check your design on the largest and smallest sizes before saving, because the version you designed on is usually a medium.

COLOUR SHIFTS. What glows on a backlit screen prints duller on fabric, and the garment colour shows through anything not fully opaque. Dark designs on dark shirts disappear. This is another argument for the sample.

VARIANTS ARE WHERE PROFIT LEAKS. Every size and colour you enable is another combination to check and another base cost. Base prices differ — 2XL usually costs more than a medium — so if you set one retail price across all sizes, the big sizes earn you less or nothing. Either price by size or accept the difference knowingly.

WRITE DESCRIPTIONS THAT ANSWER REAL QUESTIONS. Buyers want to know the material, the fit, the size guide, how to wash it, and how long delivery takes. "Premium quality unique design" answers none of it and reads like every other listing. State the fabric weight, say whether it runs small, and give an honest delivery window including fulfilment — under-promising on delivery is how you avoid your worst reviews.

AND KEEP YOUR SOURCE FILES ORGANISED from day one. Layered originals, named by product, backed up somewhere that is not just your laptop. When a design sells, you will want to put it on three more products, and re-creating it because you only kept the flattened PNG is a genuinely miserable afternoon.',
      'Create one complete product end to end: a correctly sized transparent PNG, placed and checked on both the smallest and largest size, with at least two colour variants. Then write the description, and make sure it answers material, fit, size guide, washing and delivery time. Read it back as a stranger deciding whether to spend twenty-five dollars with someone they have never heard of.',
      '[{"question": "Why upload a PNG with a transparent background rather than a JPEG?", "options": ["A JPEG prints a white box around the design on a coloured garment", "PNGs are printed at higher resolution", "Printful rejects JPEG files", "It makes the file smaller to upload"], "correct_index": 0}, {"question": "Why can one retail price across all sizes be a problem?", "options": ["Base costs differ by size, so the largest sizes earn you less or nothing", "Platforms require different prices per variant", "Customers expect large sizes to be cheaper", "It slows down fulfilment"], "correct_index": 0}]'::jsonb),
    (v_m2, 'Mockups: Making It Look Like a Real Product', 'Printful''s guide to the custom mockup maker — turning a flat design into images that look like a photographed product. Under 6 minutes.', 'https://www.youtube.com/watch?v=VKxcm6K4gjE', 2,
      array['Generate mockups that show the product in a believable setting', 'Choose images that answer a buyer''s doubts', 'Build a consistent set of images across a whole shop'],
      'Nobody can touch your product. The images are the product, as far as the buyer is concerned, and they are the single biggest lever on whether a listing sells.

WHAT A GOOD SET OF IMAGES DOES:
- Shows the item ON A PERSON, so the buyer can judge the fit and scale. A flat shirt on white tells them almost nothing.
- Shows a CLOSE-UP of the print, which answers "will this look cheap?"
- Shows more than one colour, so they can picture the one they want.
- Shows it in a context that matches the audience — a gym shirt in a gym, not on a marble table.

USE THE MOCKUP MAKER PROPERLY. Printful generates images with your design applied to real photographs, including lifestyle shots. Pick models and settings that look like your customers; a listing aimed at nurses photographed on a fashion model in a studio feels off in a way buyers notice without being able to name.

BE CONSISTENT ACROSS THE SHOP. Same background style, same crop, same lighting feel on every listing. A shop where every image is a different style reads as a collection of random things rather than a brand, and that difference shows up in conversion.

DO NOT FAKE WHAT IT IS. Mockups are legitimate — everyone uses them — but do not present a mockup as a customer photo, and do not use images of a product you have not checked. If the print in your mockup is crisper than the real thing, your reviews will say so.

AND OPTIMISE THE FILE SIZE before uploading. Store pages full of enormous images load slowly, and a slow page loses buyers on a phone — which is most of them.

ONE THING THE VIDEO DOES NOT COVER: once you have ordered a sample, PHOTOGRAPH IT YOURSELF. A real photograph of the actual product, even taken on a phone in good daylight, outperforms a mockup because buyers can tell the difference. Use mockups to launch, then replace them with real images as samples arrive. The Mobile Photography path on this site covers exactly how to shoot that well.',
      'Produce four images for one product: one on a person, one close-up of the print, one showing an alternative colour, and one in a setting that matches your intended buyer. Put them side by side and ask whether they look like one shop or four. Then write down which of the four you would replace first with a real photograph once you have a sample.',
      '[{"question": "Why does a mockup showing the product on a person matter?", "options": ["It lets the buyer judge fit and scale, which a flat image cannot show", "Platforms rank listings with people higher", "It hides imperfections in the print", "It is required before a product can be published"], "correct_index": 0}, {"question": "What should replace mockups once you have ordered a sample?", "options": ["Your own photographs of the real product — buyers can tell the difference", "Nothing; mockups are always preferable", "Stock photography of similar products", "Illustrations of the design on its own"], "correct_index": 0}]'::jsonb)
  on conflict (module_id, order_number) do nothing;
  insert into public.lessons (module_id, title, description, youtube_url, order_number, learning_objectives, notes, practice_activity, knowledge_check) values
    (v_m3, 'Pricing So There Is Money Left', 'Printful on print-on-demand pricing strategy — what to charge, and why most beginners price themselves into working for nothing. About 16 minutes.', 'https://www.youtube.com/watch?v=_kwXAFdvKNk', 1,
      array['Calculate your true cost per sale including every fee', 'Set a price with a margin that survives discounts and refunds', 'Decide how to handle shipping cost in your pricing'],
      'This is the lesson that decides whether the business is worth running. Most people who quit print-on-demand did not fail to sell — they sold, and found there was nothing left.

COUNT EVERY COST, not just the shirt:
- Printful''s base price for the item
- Printing, and extra for a second print area
- Shipping
- The selling platform''s fees — Etsy and Shopify both take a cut, and Shopify has a monthly charge whether you sell or not
- Payment processing, typically a percentage plus a fixed fee
- Currency conversion, which is easy to forget when your costs are in dollars and your bank is in shillings
- Any advertising

Add those up before choosing a retail price. The number is always higher than people expect, and the fixed per-transaction fees hurt small orders most — which is why single low-priced items rarely work.

MARGIN HAS TO SURVIVE REALITY. Some orders go wrong; you will reprint or refund occasionally, and that comes out of the good orders. A margin that only works if nothing ever goes wrong is not a margin.

DO NOT COMPETE ON PRICE. There is always someone selling a similar shirt for less, often at no profit, and you cannot win that. Compete on the design being specifically right for someone. A person who finds the exact shirt for their profession or their team pays full price and does not shop around.

SHIPPING: charge it separately or fold it into the price. Folding it in and saying "free shipping" usually converts better, because a shipping cost appearing at checkout is a leading cause of abandoned carts — but only do it if the price genuinely covers it.

AND THINK IN THE RIGHT CURRENCY. Your customers pay in dollars or euros; your costs are in dollars; your life is in shillings. The exchange rate moves, and a margin that looked fine can shrink. Price in the customer''s currency, check your real shilling income monthly, and do not assume today''s rate.

A LAST HONEST NOTE: at realistic margins, a few sales a month is pocket money, not an income. This becomes real money at volume, and volume comes from designs people specifically want plus consistent marketing over months. Anyone telling you otherwise is selling a course, which is what makes the arithmetic in this lesson worth doing yourself.',
      'Take one product and build the full sum: base cost, printing, shipping, platform fee, payment processing and conversion. Subtract from the price you were planning to charge. Then multiply what is left by ten sales a month and convert to shillings. Decide, with that number in front of you, whether the price needs to rise or the product needs to change.',
      '[{"question": "Which cost do beginners most often leave out of the sum?", "options": ["Platform fees, payment processing and currency conversion", "The base cost of the garment", "The cost of the design software", "Printful''s printing charge"], "correct_index": 0}, {"question": "Why is competing on price a losing strategy here?", "options": ["Someone is always selling similar items at no profit, and you cannot beat that", "Platforms penalise low-priced listings", "Printful sets a minimum retail price", "Cheap products attract more refund requests"], "correct_index": 0}]'::jsonb),
    (v_m3, 'Connecting a Real Storefront', 'Printful''s full setup guide for connecting to Shopify — putting your products where customers can actually find and buy them. About 12 minutes.', 'https://www.youtube.com/watch?v=nJUJRt81dlE', 2,
      array['Connect Printful to a storefront so orders fulfil automatically', 'Choose a selling channel that suits your budget and audience', 'Test the whole path with a real order before promoting anything'],
      'Printful is a supplier, not a shop. Something has to take the money and send the order through, and choosing that is a real decision.

THE OPTIONS, honestly compared:

ETSY — a marketplace with buyers already on it, searching for exactly this kind of product. Lower effort, listing and transaction fees, and you are one of millions. Usually the right place to start, because you do not need traffic of your own.

SHOPIFY — your own store, full control, better margins per sale, and a monthly fee from day one whether you sell or not. It is the right move once you have proven something sells; starting here means paying rent on an empty shop while you learn.

SOCIAL SELLING — Instagram or TikTok driving people to either of the above. This is where the audience actually comes from for most small sellers.

The video covers Shopify because it is the most involved to set up; the connection principle is the same for whichever you choose.

WHAT THE INTEGRATION DOES once connected: an order on your store is pushed to Printful automatically, printed, shipped, and the tracking sent back. You do nothing. That automation is the whole reason this model works for one person.

TEST WITH A REAL ORDER BEFORE YOU PROMOTE ANYTHING. Buy from your own store, at full price, and watch the entire path: does the order reach Printful, is the right variant printed, does tracking come back, what emails does the customer receive and are they in your name or a stranger''s? Every seller who skipped this found a broken step with a real customer instead.

FOR A KENYAN SELLER, three practical points the video will not mention. Your store platform must pay out somewhere you can reach — check that before building, because it is difficult to change later. Some platforms verify identity and business details, so have documents ready. And set your store''s timezone and support hours honestly: a customer in California messaging at their lunchtime is messaging you at midnight, and "replies within 24 hours" is a promise you can keep while "instant support" is not.

AND START THE MARKETING BEFORE THE SHOP IS PERFECT. A finished store with no visitors sells nothing. The SEO, Social Media Management and Instagram & TikTok Growth paths on this site are where the customers actually come from — this course gets the product ready, not the traffic.',
      'Choose your selling channel and write one paragraph justifying it against your budget and where your audience already is. Connect it to Printful and publish one product. Then place a real order on your own store and follow it the whole way: order received, pushed to Printful, printed, shipped, tracking returned, customer emails checked. Write down anything that surprised you — that list is what would have gone wrong in public.',
      '[{"question": "Why is Etsy usually the better place to start than Shopify?", "options": ["It already has buyers searching, where Shopify charges monthly while you build traffic", "Etsy has lower fees per sale", "Shopify cannot connect to Printful", "Etsy handles customer service for you"], "correct_index": 0}, {"question": "What should you do before promoting your store?", "options": ["Place a real order yourself and follow it all the way to tracking", "List at least twenty products", "Order samples of every product in the catalogue", "Wait until the design portfolio is complete"], "correct_index": 0}]'::jsonb)
  on conflict (module_id, order_number) do nothing;

end $$;
