-- Lesson notes render as PLAIN TEXT, not markdown.
--
--   app/learn/[courseId]/[lessonId]/page.tsx:157
--   <p className="text-sm whitespace-pre-line">{lesson.notes}</p>
--
-- React escapes the string, so a lesson written with markdown emphasis
-- displayed literal asterisks to the learner: "**leading** is the space
-- between lines". 36 lessons across four paid courses were affected,
-- including Web Development (the platform's deepest course) and Graphic
-- Design (which carries a completion).
--
-- Every affected field was checked first: all have an EVEN number of '**'
-- occurrences, none contain '***', and none match a digit-**-digit pattern,
-- so no JavaScript exponent operator is caught by this. The replacement
-- removes the markers only; no word, space or newline changes.
--
-- This is a text correction, not a content change. No lesson is inserted,
-- deleted or re-parented and no id changes, so lesson_progress is untouched.

update public.lessons
set notes = replace(notes, '**', '')
where notes like '%**%';

update public.lessons
set practice_activity = replace(practice_activity, '**', '')
where practice_activity like '%**%';

update public.lessons
set learning_objectives = (
  select array_agg(replace(o, '**', '') order by ord)
  from unnest(learning_objectives) with ordinality t(o, ord)
)
where array_to_string(learning_objectives, '') like '%**%';
