import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const DEFAULT_SECRET = "ai-age-prediction-hub-super-secret-key-32chars-minimum-prod";

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || DEFAULT_SECRET,
    });

    const isAuth = !!token;
    const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

    if (isDashboard && !isAuth) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware Error]:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
