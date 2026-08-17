# Deploying AI Age Prediction Hub to Netlify

This guide walks you through deploying the **AI Age Prediction Hub** to **Netlify** with Gmail SMTP email delivery and hosted PostgreSQL.

---

## 1. Prerequisites

1. **Hosted PostgreSQL Database** (Free from [Supabase](https://supabase.com) or [Neon](https://neon.tech)):
   - Create a project on Supabase or Neon.
   - Copy the connection string (e.g., `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require`).
2. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: configure for Netlify deployment with Gmail SMTP"
   git push origin main
   ```

---

## 2. Deploy on Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com) and log in.
2. Click **"Add new site"** &rarr; **"Import an existing project"**.
3. Choose **GitHub** and select your `Age-prediction-models` repository.
4. Netlify will auto-detect the configuration from [`netlify.toml`](./netlify.toml):
   - **Build command**: `npx prisma generate && npm run build`
   - **Publish directory**: `.next`

---

## 3. Configure Environment Variables in Netlify

Before deploying, click **"Site configuration"** &rarr; **"Environment variables"** (or add them during setup) and add the following:

| Variable | Value / Description | Example |
|---|---|---|
| `DATABASE_URL` | Hosted PostgreSQL connection string | `postgresql://postgres:pass@db.ref.supabase.co:5432/postgres?sslmode=require` |
| `NEXTAUTH_SECRET` | 32-byte secret key for JWT session encryption | `f6c8d7e9b0a1f2e3d4c5b6a7890123456789abcdef0123456789abcdef012345` |
| `NEXTAUTH_URL` | Your Netlify site URL | `https://your-site-name.netlify.app` |
| `NEXT_PUBLIC_APP_URL` | Same Netlify site URL | `https://your-site-name.netlify.app` |
| `EMAIL_PROVIDER` | Active email service | `gmail` |
| `GMAIL_USER` | Your Gmail address | `akilanaki51@gmail.com` |
| `GMAIL_APP_PASSWORD` | 16-character Google App Password | `yism fkxz ytuk sqyx` |
| `EMAIL_FROM` | Branded sender header | `AI Age Prediction Hub <akilanaki51@gmail.com>` |
| `NODE_VERSION` | Node.js runtime version | `20` |

---

## 4. Run Initial Database Migration

To create the `User` and `VerificationToken` tables in your live PostgreSQL database, run this one-time command from your terminal:

```bash
# Set your hosted DATABASE_URL and apply the committed PostgreSQL migration
npx prisma migrate deploy
```

---

## 5. Click "Deploy Site"

1. In Netlify, click **Deploy site**.
2. Netlify will build the Next.js App Router project and deploy it to a global edge URL.
3. Open your live URL (e.g., `https://your-site-name.netlify.app`), register a test account, and receive the live Gmail verification email!
