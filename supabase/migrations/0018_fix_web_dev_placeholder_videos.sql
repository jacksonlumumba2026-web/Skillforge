-- "Web Development for Beginners" (0002_seed_courses.sql) was published
-- with all 20 lessons pointing at fake placeholder video ids
-- (youtube.com/watch?v=REPLACE_ME_01 ... 20) that were never replaced with
-- real content — the course has been live and completely non-functional.
-- Backfills real, hand-researched YouTube tutorials matching each
-- lesson's existing (already well-structured) title and topic.

update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=oVC-RQ2Nxds' where id = '913081c3-bd45-449c-ba29-000912a19ff5'; -- What is Web Development?
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=VSHXl_ZlzkI' where id = '0984035a-cf1f-4a89-afdc-24649dc5830b'; -- How the Web Works
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=qz0aGYrrlhU' where id = 'd07d2546-76bc-496d-8f54-22041b868a12'; -- Introduction to HTML
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=7y4h7pFbjHA' where id = 'cdddefe0-9bb5-4bd6-bb08-09bb02cc48d1'; -- HTML Elements and Tags
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=I1aKHkLZrOA' where id = '81dada55-f9e3-4e11-a764-883762d4bcda'; -- Lists, Links and Images
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=AJrkz0pzRV4' where id = 'fd2822ca-457a-4044-a077-0d4361bfc81c'; -- Forms and Tables
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=0W6qz0-aDaM' where id = 'c3c05c1a-1ff6-40d4-a632-7dc6b35a72c9'; -- Introduction to CSS
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=WC7WurHBGs0' where id = '08288038-c583-4976-baae-a7c34526fb15'; -- Selectors, Colors and Typography
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=ZaiIDH0qp1c' where id = '7e1c9ff4-9432-4654-bad6-b8bebcbe97ec'; -- The Box Model
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=nbsz6muQRT4' where id = '1b1b5c89-5030-4d22-88d7-1196969048c0'; -- Flexbox Layout
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=W6NZfCO5SIk' where id = '88316d04-3f69-4098-ac05-38d71d67161c'; -- Introduction to JavaScript
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=tY3EYcQJdY4' where id = 'aeed049b-ad4b-4855-9eb6-60a1f4a26f24'; -- Variables and Data Types
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=wnkDlSckKu8' where id = '6b4ce418-9cf0-4cef-9cbf-6a2c5d42caf5'; -- Functions and Control Flow
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=BGkc6dKUZ84' where id = 'ad7c18f6-15fa-47cf-9098-edcd0c52c8fc'; -- Working with the DOM
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=i_8NQuEAOmg' where id = '847d85e3-2bac-495a-af4f-abfe79f4e8a2'; -- Handling Events
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=KuzySg7_Q7Y' where id = '7777b3fc-d54e-4c44-9080-493eff6e0f29'; -- Planning Your First Website
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=FazgJVnrVuI' where id = '2948443d-9a58-4831-9af7-17b047e7f55e'; -- Building the Homepage
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=69IbzTWg5PM' where id = 'e7e50ace-99b9-4a8b-8cfb-b5f38a118d80'; -- Making It Responsive
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=_DfMrZ4PSjw' where id = '00b26348-b38d-47c8-9872-3cb4019442a2'; -- Choosing a Hosting Provider
update public.lessons set youtube_url = 'https://www.youtube.com/watch?v=Dt9BVYjBLpg' where id = '6612278c-f32b-48fa-8ebc-699924056b4f'; -- Deploying Your Website Live
