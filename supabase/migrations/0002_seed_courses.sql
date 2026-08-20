-- Sample courses for the /courses grid, plus one fully-built course
-- ("Web Development for Beginners") with real modules/lessons so the
-- course detail, curriculum, and lesson pages have real data to render
-- against. YouTube URLs are placeholders — swap them for real videos from
-- the admin dashboard once that's built (Phase 5).

insert into public.courses (slug, title, description, level, price_kes, is_published) values
  ('web-development-for-beginners', 'Web Development for Beginners', 'Learn to build and publish real websites from scratch — HTML, CSS, JavaScript, and how to put it all together.', 'beginner', 500, true),
  ('digital-marketing', 'Digital Marketing', 'Learn how businesses find and win customers online — social media, ads, and content that converts.', 'beginner', 500, true),
  ('graphic-design', 'Graphic Design', 'Design logos, social posts, and simple branding — the practical skills clients actually pay for.', 'beginner', 500, true),
  ('ai-tools', 'AI Tools', 'Get productive with today''s AI tools for writing, images, and everyday work.', 'beginner', 500, true),
  ('freelancing', 'Freelancing', 'Find your first client, price your work, and get paid — the practical side of freelancing.', 'beginner', 500, true),
  ('social-media-management', 'Social Media Management', 'Run and grow a brand''s social accounts — content calendars, engagement, and basic analytics.', 'beginner', 500, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Web Development for Beginners: 6 modules, 20 lessons
-- ---------------------------------------------------------------------------
do $$
declare
  v_course_id uuid;
  v_m1 uuid; v_m2 uuid; v_m3 uuid; v_m4 uuid; v_m5 uuid; v_m6 uuid;
begin
  select id into v_course_id from public.courses where slug = 'web-development-for-beginners';

  insert into public.modules (course_id, title, order_index) values
    (v_course_id, 'Introduction to Web Development', 1) returning id into v_m1;
  insert into public.modules (course_id, title, order_index) values
    (v_course_id, 'HTML Basics', 2) returning id into v_m2;
  insert into public.modules (course_id, title, order_index) values
    (v_course_id, 'CSS Basics', 3) returning id into v_m3;
  insert into public.modules (course_id, title, order_index) values
    (v_course_id, 'JavaScript Basics', 4) returning id into v_m4;
  insert into public.modules (course_id, title, order_index) values
    (v_course_id, 'Building a Website', 5) returning id into v_m5;
  insert into public.modules (course_id, title, order_index) values
    (v_course_id, 'Publishing a Website', 6) returning id into v_m6;

  insert into public.lessons (module_id, title, description, youtube_url, order_index) values
    (v_m1, 'What is Web Development?', 'An overview of what web developers actually do, and the difference between frontend and backend work.', 'https://www.youtube.com/watch?v=REPLACE_ME_01', 1),
    (v_m1, 'How the Web Works', 'Browsers, servers, and HTTP requests — the basic flow behind every website you visit.', 'https://www.youtube.com/watch?v=REPLACE_ME_02', 2),

    (v_m2, 'Introduction to HTML', 'What HTML is for and how to write your first HTML page.', 'https://www.youtube.com/watch?v=REPLACE_ME_03', 1),
    (v_m2, 'HTML Elements and Tags', 'The core building blocks of any web page: headings, paragraphs, and structure.', 'https://www.youtube.com/watch?v=REPLACE_ME_04', 2),
    (v_m2, 'Lists, Links and Images', 'Adding lists, links between pages, and images to your HTML.', 'https://www.youtube.com/watch?v=REPLACE_ME_05', 3),
    (v_m2, 'Forms and Tables', 'Collecting input with forms and displaying data with tables.', 'https://www.youtube.com/watch?v=REPLACE_ME_06', 4),

    (v_m3, 'Introduction to CSS', 'How CSS connects to HTML to control how a page looks.', 'https://www.youtube.com/watch?v=REPLACE_ME_07', 1),
    (v_m3, 'Selectors, Colors and Typography', 'Targeting elements with selectors and styling text and color.', 'https://www.youtube.com/watch?v=REPLACE_ME_08', 2),
    (v_m3, 'The Box Model', 'Understanding margin, border, padding, and content — the foundation of CSS layout.', 'https://www.youtube.com/watch?v=REPLACE_ME_09', 3),
    (v_m3, 'Flexbox Layout', 'Building real layouts with Flexbox, the most common CSS layout tool.', 'https://www.youtube.com/watch?v=REPLACE_ME_10', 4),

    (v_m4, 'Introduction to JavaScript', 'What JavaScript is for and how it makes web pages interactive.', 'https://www.youtube.com/watch?v=REPLACE_ME_11', 1),
    (v_m4, 'Variables and Data Types', 'Storing and working with data in JavaScript.', 'https://www.youtube.com/watch?v=REPLACE_ME_12', 2),
    (v_m4, 'Functions and Control Flow', 'Writing reusable logic with functions, conditionals, and loops.', 'https://www.youtube.com/watch?v=REPLACE_ME_13', 3),
    (v_m4, 'Working with the DOM', 'Using JavaScript to read and change the content of a page.', 'https://www.youtube.com/watch?v=REPLACE_ME_14', 4),
    (v_m4, 'Handling Events', 'Responding to clicks, typing, and other user interactions.', 'https://www.youtube.com/watch?v=REPLACE_ME_15', 5),

    (v_m5, 'Planning Your First Website', 'Sketching out the pages and structure of a real project before writing code.', 'https://www.youtube.com/watch?v=REPLACE_ME_16', 1),
    (v_m5, 'Building the Homepage', 'Putting HTML, CSS, and JavaScript together to build a real homepage.', 'https://www.youtube.com/watch?v=REPLACE_ME_17', 2),
    (v_m5, 'Making It Responsive', 'Making sure your site looks good on phones, tablets, and desktops.', 'https://www.youtube.com/watch?v=REPLACE_ME_18', 3),

    (v_m6, 'Choosing a Hosting Provider', 'What hosting is and how to pick a simple, affordable option.', 'https://www.youtube.com/watch?v=REPLACE_ME_19', 1),
    (v_m6, 'Deploying Your Website Live', 'Publishing your finished website so anyone can visit it.', 'https://www.youtube.com/watch?v=REPLACE_ME_20', 2)
  on conflict (module_id, order_index) do nothing;
end $$;
