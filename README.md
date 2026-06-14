# Fitdog Academy Web

Online dog training platform — landing page, course library, Stripe checkout, admin panel, free credits, and **Fitdog AI Assist**.

**Live (Vercel):** https://academy-delta-flax.vercel.app

## Quick Start (Local)

```bash
cd ~/Desktop/Fitdog-Academy-Web
npm install
cp .env.example .env
# Set DATABASE_URL to a Postgres URL (Neon free tier works for local + prod)
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Admin / Staff Login

- **Staff portal:** `/staff/login`
- **Admin email:** `lsand.work@gmail.com`
- **Temp password:** `password123`

## Vercel Deployment

1. Import repo: https://github.com/Lsandwork/academy
2. **Settings → Deployment Protection** → **Only Preview Deployments**
3. **Settings → Environment Variables** — add all vars from `.env.example`
4. Use **Neon Postgres** for `DATABASE_URL` (SQLite does not work on Vercel)
5. Redeploy after adding env vars
6. Seed production database once:

```bash
DATABASE_URL="your-neon-url" npm run db:push
DATABASE_URL="your-neon-url" npm run db:seed
```

7. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL
8. Update Stripe webhook to `https://your-domain/api/stripe/webhook`

## Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `SESSION_SECRET` | Yes | 32+ random characters |
| `NEXT_PUBLIC_APP_URL` | Yes | Public site URL |
| `STRIPE_*` | For payments | See Stripe Setup |
| `GEMINI_API_KEY` | For AI Assist | Server-side only |
| `FITDOG_VIDEO_CDN` | Optional | Hosted lesson videos |

## Stripe Setup

1. Create products/prices at [Stripe Dashboard](https://dashboard.stripe.com)
2. Add keys to `.env` / Vercel env vars
3. Local webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Marketing landing |
| `/register`, `/login` | Student auth |
| `/staff/login` | Staff & admin login |
| `/dashboard` | User dashboard |
| `/library` | Course library |
| `/library/[trackId]` | Track curriculum |
| `/library/[trackId]/lessons/[lessonId]` | Lesson + Fitdog AI Assist |
| `/assessment` | Training track recommendation |
| `/pricing` | Stripe checkout |
| `/profile` | Avatar, email, password, credits |
| `/admin` | Users, access, credits, diagnostics |

## Fitdog AI Assist

- **Summarize This Lesson** on every unlocked lesson page
- Floating chat assistant with quick actions
- Admin: **Admin → Diagnostics → AI Assist Health**
- Requires `GEMINI_API_KEY` (never exposed to the browser)

## Tech Stack

- Next.js 15, Tailwind CSS 4, Prisma + PostgreSQL, iron-session, Stripe, Fitdog AI Assist

## Commands

```bash
npm run dev
npm run build
npm run db:push
npm run db:seed
```
