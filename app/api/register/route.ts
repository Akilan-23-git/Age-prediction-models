import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Basic IP rate limiting: 10 requests per minute
    const ip = req.headers.get("x-forwarded-for") || "local";
    const { allowed } = checkRateLimit(`register:${ip}`, 10, 60000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, password } = body;

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Please provide your full name." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // Password strength: >= 8 characters with at least 1 number
    if (!password || typeof password !== "string" || password.length < 8 || !/\d/.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long and contain at least one number." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { error: "An account with this email address already exists. Please log in." },
          { status: 409 }
        );
      } else {
        // User registered but hasn't verified yet - refresh token and resend
        const tokenRecord = await createVerificationToken(existingUser.id);
        const emailResult = await sendVerificationEmail({
          to: normalizedEmail,
          name: existingUser.name,
          token: tokenRecord.token,
        });

        return NextResponse.json({
          success: true,
          message: "An unverified account already exists. A new verification link has been sent to your email.",
          email: normalizedEmail,
          devVerifyUrl: emailResult.verifyUrl,
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        emailVerified: false,
      },
    });

    // Create verification token
    const tokenRecord = await createVerificationToken(user.id);

    // Send verification email
    const emailResult = await sendVerificationEmail({
      to: normalizedEmail,
      name: trimmedName,
      token: tokenRecord.token,
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      email: normalizedEmail,
      devVerifyUrl: emailResult.verifyUrl,
    });
  } catch (error) {
    console.error("[Register Error]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating your account. Please try again." },
      { status: 500 }
    );
  }
}
