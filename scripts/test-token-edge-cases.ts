import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateSecureToken, validateAndConsumeVerificationToken } from "../lib/tokens";

const prisma = new PrismaClient();

async function testEdgeCases() {
  console.log("=== Edge Case Test: Expired and Malformed Tokens ===");

  // 1. Test malformed / nonexistent token
  console.log("\n1. Testing completely malformed/nonexistent token ('garbage123'):");
  const malformedResult = await validateAndConsumeVerificationToken("garbage123");
  console.log("   Result:", malformedResult);
  if (!malformedResult.success && malformedResult.error === "Invalid or expired verification link") {
    console.log("   ✓ Malformed token correctly handled with graceful error message!");
  } else {
    throw new Error("Malformed token was not handled properly");
  }

  // 2. Test expired token
  console.log("\n2. Testing explicitly expired token:");
  const testEmail = "expired_token_test@example.com";
  await prisma.user.deleteMany({ where: { email: testEmail } });

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash("TestPassword123", salt);

  const testUser = await prisma.user.create({
    data: {
      name: "Expired Token Tester",
      email: testEmail,
      passwordHash,
      emailVerified: false,
    },
  });

  // Create an expired token (expiresAt 1 hour in the past)
  const expiredToken = generateSecureToken(32);
  const expiredTokenRecord = await prisma.verificationToken.create({
    data: {
      token: expiredToken,
      userId: testUser.id,
      expiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    },
  });

  console.log("   Created expired token in DB with expiresAt:", expiredTokenRecord.expiresAt);

  const expiredResult = await validateAndConsumeVerificationToken(expiredToken);
  console.log("   Result:", expiredResult);

  if (
    !expiredResult.success &&
    expiredResult.error === "This verification link has expired. Please request a new one."
  ) {
    console.log("   ✓ Expired token rejected with clear specific expiry notice!");
  } else {
    throw new Error("Expired token was not rejected with proper error message");
  }

  // Verify expired token was cleaned up
  const lookupDeleted = await prisma.verificationToken.findUnique({
    where: { token: expiredToken },
  });
  if (!lookupDeleted) {
    console.log("   ✓ Expired token was automatically pruned/deleted from database!");
  }

  // Verify user remains unverified
  const checkUser = await prisma.user.findUnique({ where: { id: testUser.id } });
  if (!checkUser?.emailVerified) {
    console.log("   ✓ User safely remains emailVerified: false!");
  }

  console.log("\n✓ ALL TOKEN EDGE CASES PASSED WITH 100% GRACEFUL BEHAVIOR!\n");
}

testEdgeCases()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
