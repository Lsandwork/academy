# Fitdog Academy Web

Online dog training website matching the Fitdog Academy mockup — landing page, dashboard, course library, Stripe checkout, staff login, and user profiles.

## Quick Start

```bash
cd ~/Desktop/Fitdog-Academy-Web
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Admin / Staff Login

- **Staff portal:** [/staff/login](http://localhost:3000/staff/login)
- **Admin email:** `lsand.work@gmail.com`
- **Temp password:** `password123`

## Stripe Setup (recommended)

1. Create a [Stripe account](https://dashboard.stripe.com)
2. Create three Products/Prices:
   - Single Lesson — one-time (~$29–49)
   - Monthly Membership — recurring $39/month
   - Lifetime Access — one-time $499
3. Add keys to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_PRICE_SINGLE_LESSON=price_...
   STRIPE_PRICE_MONTHLY=price_...
   STRIPE_PRICE_LIFETIME=price_...
   ```
4. For local webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Marketing landing (mockup hero, featured courses, trust bar) |
| `/register` | Create student account |
| `/login` | Student login |
| `/staff/login` | Staff & admin login |
| `/dashboard` | User dashboard |
| `/library` | Course library with filters & progress |
| `/pricing` | Stripe secure checkout |
| `/profile` | Avatar upload, email, password |
| `/admin` | User management (staff/admin only) |

## Tech Stack

- **Next.js 15** (App Router)
- **Tailwind CSS 4**
- **Prisma + SQLite**
- **iron-session** auth
- **Stripe Checkout** payments
- **bcryptjs** password hashing
# academy
