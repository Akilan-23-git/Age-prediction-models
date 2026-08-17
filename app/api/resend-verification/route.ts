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
  } catch (error) {
    console.error("[Resend Verification Error]:", error);
    return NextResponse.json(
      { error: "Failed to send verification email. Please try again." },
      { status: 500 }
    );
  }
}
