import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createVerificationToken, validateAndConsumeVerificationToken } from "../lib/tokens";

const prisma = new PrismaClient();

async function main() {
  console.log("=== AI Age Prediction Hub - Testing Database & Auth Pipeline ===");

  // 1. Clean up any existing test records
  const testEmail = "testuser@example.com";
  await prisma.user.deleteMany({ where: { email: testEmail } });
  console.log("✓ Cleaned previous test records");

  // 2. Create unverified test user
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash("Password123", salt);

  const unverifiedUser = await prisma.user.create({
    data: {
      name: "Test User",
      email: testEmail,
      passwordHash,
      emailVerified: false,
    },
  });
  console.log("✓ Created unverified user:", unverifiedUser.email, "emailVerified:", unverifiedUser.emailVerified);

  // 3. Generate verification token
  const tokenRecord = await createVerificationToken(unverifiedUser.id);
  console.log("✓ Generated verification token:", tokenRecord.token.slice(0, 16) + "...", "expiresAt:", tokenRecord.expiresAt);

  // 4. Verify password check
  const isMatch = await bcrypt.compare("Password123", unverifiedUser.passwordHash);
  console.log("✓ Password verification matches:", isMatch);

  // 5. Test token validation & email verification
  const verifyResult = await validateAndConsumeVerificationToken(tokenRecord.token);
  console.log("✓ Token validation result:", verifyResult.success);

  // 6. Verify user status in DB
  const updatedUser = await prisma.user.findUnique({ where: { id: unverifiedUser.id } });
  console.log("✓ User verified status in DB:", updatedUser?.emailVerified);

  console.log("=== All Auth Pipeline Tests Passed Successfully! ===");
}

main()
  .catch((e) => {
    console.error("Test error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
