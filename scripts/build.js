const { execSync } = require("child_process");

// Set safe fallback build-time environment variables for static generation & Prisma client codegen
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_R2do6JACFIzn@ep-fancy-pine-ay10whqg.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";
  console.log("[Build] Provided build-time DATABASE_URL for Prisma code generation.");
}

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "ai-age-prediction-hub-super-secret-key-32chars-minimum-prod";
}

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
}

try {
  console.log("[Build] Running prisma generate...");
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });
  
  console.log("[Build] Running next build...");
  execSync("npx next build", { stdio: "inherit", env: process.env });
  
  console.log("[Build] Build completed successfully!");
} catch (error) {
  console.error("[Build Error]:", error);
  process.exit(1);
}
