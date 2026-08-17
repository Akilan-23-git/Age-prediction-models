# AI Age Prediction Hub

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://age-prediction-hub.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169e1?style=for-the-badge&logo=postgresql)](https://www.prisma.io/)

A portfolio-grade unified frontend and authenticated gateway that provides single sign-on access to two independently deployed machine learning applications: **Facial Age Detection** (EfficientNetB3 computer vision) and **Speaker Age Prediction** (stacked acoustic ML ensemble). It solves the fragmentation problem of multi-modal AI demos by giving clients and recruiters a clean, secure dashboard experience without the security risks or UI degradation of iframes.

---

## Architecture Overview

```
                          ┌───────────────────────────┐
                          │   AI Age Prediction Hub   │
                          │   (Next.js 14 + NextAuth) │
                          └─────────────┬─────────────┘
                                        │
                         Authenticated User Gateway
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
  ┌─────────────────────────────┐               ┌─────────────────────────────┐
  │   Facial Age Detection      │               │   Speaker Age Prediction    │
  │   (Image / EfficientNetB3)  │               │   (Audio / ML Ensemble)     │
  │   Deployed on Vercel        │               │   Deployed on Streamlit     │
  └─────────────────────────────┘               └─────────────────────────────┘
```

> **Decoupled Microservice Architecture**: The ML model applications are deployed independently on specialized infrastructure (Streamlit Cloud for Librosa audio compute, Vercel/FastAPI for PyTorch image inference). This Hub acts as the secure entry gateway layer, opening each model in a dedicated tab while managing authentication and verification state.

---

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router, TypeScript, React 18)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Deep Indigo & Slate design tokens
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials provider, JWT session strategy, bcrypt hashing)
- **Database & ORM**: Hosted [PostgreSQL](https://www.postgresql.org/) (Supabase / Neon) managed via [Prisma ORM](https://www.prisma.io/)
- **Transactional Email**: [Resend](https://resend.com/) API (with dev console fallback)
- **Animations & Icons**: [Framer Motion](https://www.framer.com/motion/) (hover-lift & mobile touch scaling), [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) toast system

---

## Preview

| Landing Page | Authentication & Verification | Dashboard Launcher |
| :---: | :---: | :---: |
| ![Landing Page](./public/screenshots/landing-desktop.png) | ![Auth & Verify Flow](./public/screenshots/auth-flow.png) | ![Dashboard Launcher](./public/screenshots/dashboard.png) |

---

## Core Features

1. **Gatekept Launchpad**: Protected `/dashboard` route accessible only to authenticated and verified users.
2. **Email Verification Lifecycle**: Mandatory 24-hour cryptographically secure email verification via Resend before initial login, with one-click resend capabilities.
3. **Interactive Project Cards**: Responsive cards featuring model architecture tags, active-scale feedback on touchscreens (`active:scale-[0.98]`), and desktop hover-lift.
4. **Security Hardening**: Passwords hashed with 12 bcrypt salt rounds, single-use crypto verification tokens, rate-limited auth endpoints, and server-side input sanitization.

---

## Getting Started Locally

### 1. Prerequisites
- Node.js `20.x` or `22.x`
- PostgreSQL instance (or local SQLite for dev testing)

### 2. Installation
```bash
git clone https://github.com/your-username/ai-age-prediction-hub.git
cd ai-age-prediction-hub
npm install
```

### 3. Environment Setup
Create a `.env.local` file based on `.env.example`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/age_prediction_hub"
NEXTAUTH_SECRET="your-32-byte-hex-secret"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="AI Age Prediction Hub <onboarding@resend.dev>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Migrations
```bash
npx prisma migrate dev
```

### 5. Run Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

---

## Automated Testing

```bash
# Run Database & Token verification pipeline test
npx tsx scripts/test-hub.ts

# Run End-to-End API routes test
npx tsx scripts/test-e2e-api.ts

# Run Authentication & Security scenarios test
npx tsx scripts/test-login-auth.ts
```

---

## Author & Credit

Built by **Akilan** · Portfolio Project
