# SkillForge

Turn YouTube's best tutorials into structured, step-by-step learning paths.

Next.js (App Router) + TypeScript + Tailwind CSS, Supabase (auth/DB/RLS),
M-Pesa STK Push via the Safaricom Daraja API (payments — no free trial
pre-authorization, no silent auto-renewal), YouTube Data API v3 (curation) +
YouTube IFrame Player API (playback), Anthropic Claude (step
summaries/checklists). Deploys to Vercel.

**Live Supabase project:** `skillforge` (`ixzpoypraqnnmlvzaqxk`, `us-east-1`)
— migrations `0001`–`0004` are applied. See "Getting started" for what's
still needed to run the app (service role key, M-Pesa/YouTube/Anthropic
keys).

## Product flow

1. Visitor signs up (email/password or Google) — no payment info required. A
   Postgres trigger starts a frictionless 7-day trial (`trial_ends_at`)
   automatically, and the user goes straight to `/onboarding`.
2. The user picks a skill + level. SkillForge curates a YouTube playlist for
   that skill+level (cached per skill+level combination in Postgres so we
   only hit the YouTube API once per combination), writes a plain-English
   summary + action checklist per step with Claude, and drops the user into
   `/path/[id]`.
3. `/dashboard` shows active paths, per-path progress, and a streak counter.
4. `/path/[id]` is the step player: an embedded YouTube IFrame Player, a
   summary, a checklist, and a "mark step complete" action.
5. When the trial ends, path content locks (enforced by Postgres RLS, not
   just the UI) until the user pays via `/billing`: pick monthly (KSh
   2,500/mo) or annual (KSh 24,000/yr), enter a Safaricom number, and approve
   the STK push prompt on their phone. A successful payment extends
   `profiles.current_period_end` by 30 or 365 days.
6. **Renewal is manual, by design** — M-Pesa STK Push requires the customer
   to approve every charge on their phone, so there's no Stripe-style silent
   recurring billing. `/dashboard` and `/billing` show days remaining and
   prompt the user to pay again before/after their period lapses (see Phase
   2 for an SMS/push reminder job).
7. Completing every step in a path issues a certificate at
   `/certificate/[id]` — a public, shareable, branded PNG (name, skill,
   completion date) generated on the fly via `next/og`.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase

The live project above already has the schema, RLS policies, and seed
skills applied. To point your local app at it (or to stand up your own
project instead):

- Grab the Project URL + anon key from **Project Settings → API**, and the
  **service_role** key from the same page (never exposed via tooling — copy
  it yourself) into `.env.local` (see `.env.example`).
- If starting a fresh project instead, run the migrations in order in the
  SQL Editor: `0001_init.sql`, `0002_seed_skills.sql`,
  `0003_harden_function_privileges.sql`, `0004_switch_to_mpesa.sql`.
- Under **Authentication → Providers**, enable **Google** and set the
  authorized redirect URI to `<your-site-url>/auth/callback`.
- Under **Authentication → Settings**, decide whether to require email
  confirmation. This app works with either setting — with confirmation
  **off**, signup goes straight to `/onboarding`; with it **on**, the user
  is sent to `/login` with a "check your inbox" notice after signing up.

### 3. M-Pesa (Safaricom Daraja API)

- Create an account at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
  and create an app — this gives you **sandbox** `Consumer Key` /
  `Consumer Secret` instantly, no approval needed. The sandbox shortcode and
  passkey are published on Daraja's "Lipa Na M-Pesa Online" docs page.
- Set `MPESA_ENV=sandbox`, plus `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`,
  `MPESA_SHORTCODE`, `MPESA_PASSKEY` in `.env.local`.
- `MPESA_CALLBACK_URL` must be a **publicly reachable HTTPS URL** pointing at
  `/api/mpesa/callback` — Safaricom calls it directly, so `localhost` won't
  work. Use a tunnel (ngrok, Cloudflare Tunnel, etc.) for local development,
  or your deployed Vercel URL in production.
- Going to production requires Safaricom's go-live process to get a real
  paybill/till shortcode, passkey, and production API access — sandbox is
  for development and testing only (payments aren't real).
- Adjust `NEXT_PUBLIC_MPESA_PRICE_MONTHLY_KES` / `NEXT_PUBLIC_MPESA_PRICE_ANNUAL_KES`
  if you want different pricing than the KSh 2,500/mo and KSh 24,000/yr
  defaults.

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
  extends `auth.users` (`trial_ends_at`, `current_period_end`,
  `mpesa_phone`); `skills` → `learning_paths` → `path_steps` is the cached,
  shared curriculum content; `user_paths` / `step_progress` / `certificates`
  / `mpesa_transactions` are per-user state. See `supabase/migrations/` for
  the full schema and policies.
- **Access gating is timestamp-based, not a stored status.** Because M-Pesa
  can't pre-authorize or silently re-charge, `lib/access.ts` (client/server)
  and the SQL function `has_active_access(uid)` (RLS) both just compare
  `trial_ends_at` / `current_period_end` against `now()` — there's no
  webhook-synced `subscription_status` column to drift out of sync. A user
  without active trial/paid access simply cannot read step content (video
  IDs, summaries, checklists) at the database layer, not just in the UI.
  `middleware.ts` additionally redirects unauthenticated visitors away from
  `/dashboard`, `/onboarding`, `/path/*`, and `/billing`.
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
- **M-Pesa payment flow**: `POST /api/mpesa/stk-push` (authenticated) creates
  a `mpesa_transactions` row and calls Daraja's STK Push API
  (`lib/mpesa.ts`). The client polls `GET /api/mpesa/status` every few
  seconds while the customer approves the prompt on their phone. Safaricom's
  result lands on the public `POST /api/mpesa/callback` webhook, which
  updates the transaction and extends `profiles.current_period_end` — this
  is the only place a paid period gets granted, so it's the source of truth
  regardless of whether the client is still polling.
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
- **Renewal reminders**: a scheduled job (Vercel Cron, Supabase Edge
  Function cron, etc.) that emails/SMS's users a few days before
  `current_period_end` lapses, so renewal isn't purely "notice it in the
  dashboard." M-Pesa's Standing Order product could eventually enable true
  silent auto-renewal, but it's a separate, more involved Safaricom
  integration path than STK Push.
