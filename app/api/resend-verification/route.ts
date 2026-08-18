import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    const { allowed } = checkRateLimit(`resend:${ip}`, 5, 60000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before requesting another email." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't leak user existence in production, but provide helpful feedback
      return NextResponse.json({
        success: true,
        message: "If an unverified account exists for this email, a verification link has been sent.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "This email address is already verified. You can log in directly.",
        alreadyVerified: true,
      });
    }

    // Create fresh token
    const tokenRecord = await createVerificationToken(user.id);

    // Send verification email
    const emailResult = await sendVerificationEmail({
      to: normalizedEmail,
      name: user.name,
      token: tokenRecord.token,
    });

    return NextResponse.json({
      success: true,
      message: `A new verification email has been sent to ${normalizedEmail}.`,
      devVerifyUrl: emailResult.verifyUrl,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Resend Verification Error]:", errorMsg);

    let userFriendlyError = "Failed to send verification email. Please try again.";

    if (
      errorMsg.includes("must start with the protocol") ||
      errorMsg.includes("DATABASE_URL") ||
      errorMsg.includes("Can't reach database server")
    ) {
      userFriendlyError = "Database connection error: DATABASE_URL is not configured with a valid PostgreSQL connection string.";
    } else if (errorMsg.includes("Table") && errorMsg.includes("does not exist")) {
      userFriendlyError = "Database schema not initialized. Please push database migrations.";
    } else if (
      errorMsg.includes("Gmail") ||
      errorMsg.includes("Resend") ||
      errorMsg.includes("email delivery failed") ||
      errorMsg.includes("GMAIL_USER")
    ) {
      userFriendlyError = `Email delivery service error: ${errorMsg}`;
    }

    return NextResponse.json(
      {
        error: userFriendlyError,
        details: process.env.NODE_ENV !== "production" ? errorMsg : undefined,
      },
      { status: 500 }
    );
  }
}
