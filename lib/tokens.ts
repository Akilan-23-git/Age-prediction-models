import crypto from "crypto";
import { prisma } from "./prisma";

/**
 * Generate a cryptographically secure random token string
 */
export function generateSecureToken(byteLength: number = 32): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

/**
 * Create and persist a new verification token for a user (24h expiry by default)
 */
export async function createVerificationToken(userId: string, hoursValid: number = 24) {
  // Delete any existing verification tokens for this user first
  await prisma.verificationToken.deleteMany({
    where: { userId },
  });

  const token = generateSecureToken(32);
  const expiresAt = new Date(Date.now() + hoursValid * 60 * 60 * 1000);

  const verificationToken = await prisma.verificationToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return verificationToken;
}

/**
 * Validate a verification token, mark the user's email as verified, and remove the token.
 */
export async function validateAndConsumeVerificationToken(token: string) {
  if (!token) {
    return { success: false, error: "Missing verification token" };
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) {
    return { success: false, error: "Invalid or expired verification link" };
  }

  if (new Date() > record.expiresAt) {
    // Delete expired token
    await prisma.verificationToken.delete({ where: { id: record.id } }).catch(() => {});
    return { success: false, error: "This verification link has expired. Please request a new one." };
  }

  // Mark user as emailVerified
  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });

  // Delete consumed token
  await prisma.verificationToken
    .delete({
      where: { id: record.id },
    })
    .catch(() => {});

  return { success: true, user: record.user };
}
