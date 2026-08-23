-- The "How Two-factor Authentication Works?" video in the Cybersecurity
-- course (module 2, lesson 2 — 4th video in play order) had gone private
-- and no longer played. Replaced with a real, currently-public video
-- covering the same topic at the same beginner level.

update public.lessons
set title = 'Two Factor Authentication Explained for Beginners',
    description = 'A clear beginner-friendly explanation of what two-factor authentication is, why it matters, and how to turn it on for your accounts.',
    youtube_url = 'https://www.youtube.com/watch?v=rq_yYNAUQCg'
where id = '7e1b8971-ed55-4f36-b3c5-98450221989c';
