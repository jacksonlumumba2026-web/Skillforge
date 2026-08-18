# SkillForge

Turn YouTube's best tutorials into structured, step-by-step learning paths.

Next.js (App Router) + TypeScript + Tailwind CSS, Supabase (auth/DB/RLS), Stripe
(subscriptions + 7-day trial), YouTube Data API v3 (curation) + YouTube IFrame
Player API (playback), Anthropic Claude (step summaries/checklists). Deploys to
Vercel.

## Product flow

1. Visitor signs up (email/password or Google) and immediately starts a Stripe
   Checkout session with a 7-day trial — a card is required at signup, but no
   charge happens until the trial ends.
2. After the trial starts, the user picks a skill + level on `/onboarding`.
   SkillForge curates a YouTube playlist for that skill+level (cached per
   skill+level combination in Postgres so we only hit the YouTube API once per
   combination), writes a plain-English summary + action checklist per step
   with Claude, and drops the user into `/path/[id]`.
3. `/dashboard` shows active paths, per-path progress, and a streak counter.
4. `/path/[id]` is the step player: an embedded YouTube IFrame Player, a
   summary, a checklist, and a "mark step complete" action.
5. After the trial, Stripe converts the subscription to paid ($19/mo or
   $15/mo billed annually) or the webhook marks the account `past_due` /
   `canceled`, which blocks path content via Postgres RLS until the user
   resubscribes from `/billing`.
6. Completing every step in a path issues a certificate at
   `/certificate/[id]` — a public, shareable, branded PNG (name, skill,
   completion date) generated on the fly via `next/og`.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

- Create a project at [supabase.com](https://supabase.com).
- In the SQL Editor, run the migrations in order:
  - `supabase/migrations/0001_init.sql` (schema, RLS policies, triggers)
  - `supabase/migrations/0002_seed_skills.sql` (the initial 8-skill catalog)
- Under **Authentication → Providers**, enable **Google** and set the
  authorized redirect URI to `<your-site-url>/auth/callback`.
- Under **Authentication → Settings**, decide whether to require email
  confirmation. This app is written to work with either setting — with
  confirmation **off**, signup goes straight into the trial checkout flow;
  with it **on**, the user is sent to `/login` with a "check your inbox"
  notice after signing up.
- Copy the Project URL, anon key, and service_role key into `.env.local`
  (see `.env.example`).

### 3. Create a Stripe account

- Create two recurring **Prices** on one **Product**: monthly ($19/mo) and
  annual ($15/mo, billed yearly). Copy both price IDs into `.env.local`.
- Create a webhook endpoint pointing at `<your-site-url>/api/stripe/webhook`
  subscribed to: `checkout.session.completed`, `customer.subscription.created`,
  `customer.subscription.updated`, `customer.subscription.deleted`,
  `customer.subscription.trial_will_end`, `invoice.payment_failed`. Copy the
  signing secret into `.env.local`.
- Enable the **customer billing portal** (Settings → Billing → Customer
  portal) so `/billing`'s "Manage billing" button works.

### 4. Get a YouTube Data API v3 key

Enable the "YouTube Data API v3" on a Google Cloud project and create an API
key. Copy it into `.env.local` as `YOUTUBE_API_KEY`.

### 5. Get an Anthropic API key

Create a key at [console.anthropic.com](https://console.anthropic.com) and
set it as `ANTHROPIC_API_KEY`. Used server-side only, to write each step's
plain-English summary + action checklist from the curated video's
title/description.

### 6. Run it

```bash
cp .env.example .env.local   # fill in the values above
npm run dev
```

## Architecture notes

- **Auth & data**: Supabase Postgres with row-level security. `profiles`
  extends `auth.users` (trial/subscription state); `skills` →
  `learning_paths` → `path_steps` is the cached, shared curriculum content;
  `user_paths` / `step_progress` / `certificates` are per-user state. See
  `supabase/migrations/0001_init.sql` for the full schema and policies.
- **Access gating**: a Postgres function `has_active_access(uid)` backs an
  RLS policy on `path_steps`, so a user without an active trial/subscription
  simply cannot read step content (video IDs, summaries, checklists) at the
  database layer — not just hidden in the UI. `middleware.ts` additionally
  redirects unauthenticated visitors away from `/dashboard`, `/onboarding`,
  `/path/*`, and `/billing`.
- **Path generation & caching**: `lib/path-generator.ts` checks for an
  existing `learning_paths` row for the requested skill+level before doing
  any external API calls; a unique constraint on `(skill_id, level)` makes
  concurrent first-requests race-safe (the loser just re-reads what the
  winner inserted). `lib/youtube.ts` runs one YouTube search per curriculum
  stage (fundamentals → techniques → project → common mistakes → tips, per
  level), scores candidates by view count, like ratio, recency, and video
  length, and de-duplicates by topic (title-word Jaccard similarity) and by
  channel. `lib/anthropic.ts` then writes the summary + checklist per
  selected video with Claude.
- **Adding a new skill**: insert one row into `skills` (see
  `supabase/migrations/0002_seed_skills.sql`) — no code changes required.
  The first onboarding request for that skill+level generates and caches its
  path automatically.
- **Billing**: `/billing` starts a Stripe Checkout session
  (`subscription_data.trial_period_days: 7`) for a brand-new customer, or
  opens the Stripe customer portal for an existing one.
  `app/api/stripe/webhook/route.ts` is the single source of truth that keeps
  `profiles.subscription_status` / `trial_ends_at` in sync with Stripe.
- **Design system**: `app/globals.css` holds the shared token set (colors,
  radii, shadows, `.btn`/`.card`/`.field-input` primitives) ported from the
  marketing site; `app/marketing.css` holds the landing page's
  section-specific styles, scoped with an `m-` prefix so they never leak
  into the app shell.

## Phase 2 (explicitly out of scope for this build)

- Native mobile app
- Community / social features (leaderboards, comments, sharing within the app)
- Mentorship / live coaching
- Multi-language support (UI and curated content are English-only for now)
- Expanding beyond the initial 8-skill catalog into the full 300+ skill
  library referenced in the marketing copy — the schema and generation
  pipeline already support this (see "Adding a new skill" above), it's just
  not pre-populated
- Per-checklist-item persistence (checklists currently display as a static
  reference list; only step-level completion is tracked)
- PDF certificate export (currently a shareable PNG only)
