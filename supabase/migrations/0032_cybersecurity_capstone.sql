-- First capstone brief, written as the concrete example for the
-- capstone-projects feature (see 0031_capstone_projects.sql). Rest of
-- the catalog gets briefs in follow-up migrations.
update public.courses
set capstone_title = 'Security Audit & Hardening Plan',
    capstone_brief = 'Pick one real device or one small business (yours, a family member''s, or a friend''s — with their permission) and produce a short written security audit:

1. List every account and device you checked (phone, laptop, email, M-Pesa, social media, business systems — whatever applies).
2. Note what you found: weak or reused passwords, accounts without 2-factor authentication, outdated software, anything that looked like a past phishing attempt.
3. Fix at least THREE of the issues you found, and describe exactly what you changed for each one.
4. Write one paragraph of advice: if this person/business could only do ONE more thing to be safer online, what would you tell them and why?

Submit a link to your write-up (a Google Doc, Notion page, or PDF works fine — it does not need to name the real person or business, just describe what you found and fixed).'
where slug = 'cybersecurity-online-safety';
