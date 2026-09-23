-- Repair, not new content. One knowledge-check question in 0129 was applied to
-- production with its quoted phrase paraphrased away in transcription. This
-- restores the wording 0129 already specifies.

-- Top 3 Ways to Get Angry Customers to Back Down
update public.lessons set
  knowledge_check = '[{"question": "What is anger in a support call usually about?", "options": ["Waiting, repeating themselves, not being believed, or a broken promise", "The stated issue itself", "The price of the product", "The agent personally"], "correct_index": 0}, {"question": "Why is ''I am sorry you feel that way'' harmful?", "options": ["It is heard as an insult, because it acknowledges nothing specific", "It is too formal", "It admits liability", "It takes too long to say"], "correct_index": 0}]'::jsonb
where id = 'e942d429-c291-4f1d-9336-59530d3e8892';
