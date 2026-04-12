# 💸 SubTracker

A full-stack subscription tracking web app built with Next.js, Supabase, and Tailwind CSS.

## Features
- ✅ User signup/login (email + password)
- ✅ Add, edit, delete subscriptions
- ✅ Dashboard with monthly + yearly totals
- ✅ Billing reminders (3 days before charge)
- ✅ Daily email reminder cron job (via Vercel Cron)

---

## 🚀 Deploy in 5 Steps

### Step 1 — Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) → click **Start your project**
2. Create a new project (save your database password)
3. Go to **SQL Editor** → paste and run the contents of `supabase/migrations/001_subscriptions.sql`
4. Go to **Settings → API** → copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY`

### Step 2 — Enable Email Auth in Supabase

1. Go to **Authentication → Providers**
2. Make sure **Email** is enabled (it is by default)
3. For production, set your site URL under **Authentication → URL Configuration**

### Step 3 — Deploy to Vercel (free)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add these environment variables in Vercel's project settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   CRON_SECRET=any-random-string-you-make-up
   ```
4. Click **Deploy** — your app is live!

### Step 4 — Set up email reminders (optional but recommended)

1. Sign up at [resend.com](https://resend.com) — free tier sends 100 emails/day
2. Get your API key → add `RESEND_API_KEY` to Vercel env vars
3. Uncomment the Resend code in `app/api/reminders/route.ts`
4. The cron job in `vercel.json` already runs daily at 9am UTC

### Step 5 — Add a custom domain (optional)

In Vercel → your project → **Settings → Domains** → add your domain (e.g. `subtracker.app`)

---

## 🛠 Run Locally

```bash
npm install
cp .env.example .env.local
# Fill in your Supabase keys in .env.local
npm run dev
```

Visit `http://localhost:3000`

---

## 📁 Project Structure

```
subtracker/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/page.tsx         # Login / Sign up
│   ├── dashboard/page.tsx    # Main app
│   └── api/reminders/route.ts # Cron job for email reminders
├── components/
│   └── SubModal.tsx          # Add/edit subscription modal
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── types.ts              # TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_subscriptions.sql  # Run this in Supabase SQL editor
├── vercel.json               # Cron job config
└── .env.example              # Copy to .env.local
```

---

## 🗺 Roadmap (v2 ideas)

- [ ] Push notifications (browser + mobile)
- [ ] CSV export
- [ ] Categories & spending breakdown chart
- [ ] Auto-advance billing dates after charge
- [ ] Trial expiry tracking
- [ ] Shared household accounts
- [ ] iOS/Android app (React Native)
