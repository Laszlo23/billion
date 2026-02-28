# BiteMine

BiteMine is a mobile-first growth platform for restaurants and contributors:

- Restaurants launch AI-assisted QR menus and social missions.
- Contributors complete missions, submit proof, and earn offchain `PICKS`.
- Gamification includes quests, levels, streaks, leaderboards, district progress, and referral rewards.

This repo is demo-ready with seeded data for local showcase flows.

## Tech Stack

- Next.js 14 (App Router), TypeScript
- Tailwind CSS + custom premium UI primitives
- Prisma + PostgreSQL
- Framer Motion + Sonner
- OpenAI Vision for menu extraction (optional at runtime)

## Quick Start (Local)

### 1) Install

```bash
npm install
```

### 2) Environment

Create `.env` in project root with at least:

```bash
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/premium?schema=billion"
DEMO_MODE=true
OPENAI_API_KEY=<your_openai_key_optional_for_full_ai_menu_extraction>
```

Notes:
- `OPENAI_API_KEY` is required only for real AI menu extraction.
- With `DEMO_MODE=true`, fallback/demo flows are available.

### 3) Prisma setup

```bash
npm run prisma:generate
npx prisma db push
npm run prisma:seed
```

### 4) Run

```bash
npm run dev
```

Open the local URL shown in terminal.

## Demo Routes

- Landing: `/`
- Public restaurant page (menu + missions): `/r/sunset-bistro`
- Public page with personalized progress: `/r/sunset-bistro?userId=<taskerUserId>`
- Player hub: `/player?userId=<taskerUserId>`
- Rewards center: `/rewards?userId=<taskerUserId>`
- Restaurant onboarding: `/restaurant/onboarding`
- Restaurant dashboard: `/restaurant/dashboard`
- Admin: `/admin`

## 5-Minute Demo Script

1. Open `/` and show the people-first hero + live sections.
2. Go to `/restaurant/onboarding`, upload photos, share location, publish.
3. Open `/r/sunset-bistro?userId=<taskerUserId>`, pick a mission, submit proof.
4. Go to `/restaurant/dashboard`, approve pending submission.
5. Return to `/player` and `/rewards` to show updated progress, quests, and referral loop.

## Core Commands

```bash
npm run dev
npm run lint
npm run build
npm run prisma:generate
npm run prisma:seed
```

## Important Notes

- `PICKS` are DB credits in this MVP (offchain), with service-layer design ready for future onchain sync.
- Rewards are transaction-logged and idempotent through backend services.
- If dev server chunk errors appear, stop duplicate dev servers, delete `.next`, then restart `npm run dev`.
