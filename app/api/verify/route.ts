import { NextRequest, NextResponse } from "next/server";
import { validateAndConsumeVerificationToken } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Verification token is required." }, { status: 400 });
    }

    const result = await validateAndConsumeVerificationToken(token.trim());

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now log in to access the AI Age Prediction Hub.",
      user: {
        id: result.user?.id,
        name: result.user?.name,
        email: result.user?.email,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Verify API Error]:", errorMsg);

    let userFriendlyError = "An unexpected error occurred during email verification.";
    if (
      errorMsg.includes("must start with the protocol") ||
      errorMsg.includes("DATABASE_URL") ||
      errorMsg.includes("Can't reach database server")
    ) {
      userFriendlyError = "Database connection error: DATABASE_URL is not configured with a valid PostgreSQL connection string.";
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

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Verification token is required." }, { status: 400 });
    }

    const result = await validateAndConsumeVerificationToken(token.trim());

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (error) {
    console.error("[Verify API GET Error]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during email verification." },
      { status: 500 }
    );
  }
}
