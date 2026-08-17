# AI Age Prediction Hub — Production Deployment & Pre-Launch Guide

This guide covers deploying the **AI Age Prediction Hub** to **Vercel** with hosted **PostgreSQL** (Supabase, Neon, or Railway) and **Resend** transactional emails.

---

## 1. Database Setup (Hosted PostgreSQL)

### A. Create a PostgreSQL Database
You can use **Supabase**, **Neon**, **Railway**, or any standard PostgreSQL provider:
1. **Supabase**: Create a project &rarr; Project Settings &rarr; Database &rarr; Copy Connection String (`URI` or `Transaction Pooler (port 6543)`).
2. **Neon**: Create a project &rarr; Copy the Postgres connection string with `sslmode=require`.

### B. Run Migrations
Run the committed migration against your hosted database:
```bash
# Set your production database connection string temporarily in terminal or .env.production:
export DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Apply all migrations:
npx prisma migrate deploy
```
*Note: `prisma/migrations/20260817000000_init/migration.sql` contains the complete DDL for the `User` and `VerificationToken` tables with indexes and cascade delete foreign keys.*

---

## 2. Environment Variables Configuration

Set the following environment variables in your **Vercel Project Dashboard** (**Settings &rarr; Environment Variables**):

| Variable Name | Environment | Example Value / Description |
|---|---|---|
| `DATABASE_URL` | Production, Preview, Dev | `postgresql://user:password@host:5432/dbname?sslmode=require` |
| `NEXTAUTH_SECRET` | Production, Preview, Dev | `f6c8d7e9b0a1f2e3d4c5b6a7890123456789abcdef0123456789abcdef012345` *(Generated 32-byte hex key)* |
| `NEXTAUTH_URL` | Production | `https://your-production-domain.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Production | `https://your-production-domain.vercel.app` |
| `RESEND_API_KEY` | Production, Preview, Dev | `re_123456789_abcdefghijklmnopqrstuvwxyz` *(From https://resend.com/api-keys)* |
| `EMAIL_FROM` | Production | `AI Age Prediction Hub <auth@yourdomain.com>` *(or `onboarding@resend.dev`)* |

> [!TIP]
> To generate a fresh, cryptographically strong `NEXTAUTH_SECRET` at any time, run:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## 3. Deploying to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. In [Vercel](https://vercel.com/):
   - Click **"Add New Project"** &rarr; Select your repository.
   - Framework Preset: **Next.js** (automatically detected).
   - Build Command: `next build` (Vercel automatically executes `postinstall: "prisma generate"` from `package.json`).
   - Add the Environment Variables from Section 2.
3. Click **"Deploy"**.

---

## 4. Pre-Launch Verification Checklist

Run these validation steps against your live deployed domain (e.g. `https://your-hub.vercel.app`):

- [ ] **1. Public Landing Page Load (`/`)**:
  - Visit the live URL. Verify header, "Two AI models. One dashboard." tagline, and CTA buttons render cleanly.
- [ ] **2. User Registration Flow (`/register`)**:
  - Register a new account with a valid real email address.
  - Confirm the registration form submits and shows the "Check Your Inbox" confirmation view.
- [ ] **3. Real Transactional Email Delivery (Resend)**:
  - Check the real inbox for the confirmation email from `EMAIL_FROM`.
  - Confirm email styling is branded and the verification URL points to `https://your-hub.vercel.app/verify?token=...` (not localhost).
- [ ] **4. Unverified Login Blocking (`/login`)**:
  - Before clicking the verification email, attempt to log in on the live site.
  - Verify access is blocked with the alert notice and an option to resend verification.
- [ ] **5. Email Verification (`/verify`)**:
  - Click the verification link from the email.
  - Confirm the page displays "Email Verified Successfully!" and prompts to sign in.
- [ ] **6. Verified Login & Session (`/login`)**:
  - Log in with the newly verified credentials.
  - Verify immediate redirect to `/dashboard` with session JWT cookies set.
- [ ] **7. Dashboard & Project Launchers (`/dashboard`)**:
  - Confirm welcoming greeting: `Welcome back, {Name} 👋`.
  - Click **Facial Age Detection** card &rarr; confirms opening [`https://age-prediction-frontend.vercel.app/`](https://age-prediction-frontend.vercel.app/) in a new tab without altering the hub session.
  - Click **Speaker Age Prediction** card &rarr; confirms opening [`https://speaker-age-prediction.streamlit.app/`](https://speaker-age-prediction.streamlit.app/) in a new tab.
- [ ] **8. Mobile Touch & Responsive Validation**:
  - Open the live URL on a mobile device (iOS/Android).
  - Test tapping on cards &rarr; confirm visible active-scale touch feedback (`active:scale-[0.98]`).
  - Test mobile hamburger menu navigation.
- [ ] **9. Session Logout**:
  - Click "Log out" from the navbar.
  - Confirm session is destroyed and user is redirected back to `/`.
  - Try visiting `/dashboard` directly &rarr; confirms middleware redirects back to `/login`.
