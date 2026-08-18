import { withAuth } from "next-auth/middleware";

const DEFAULT_SECRET = "ai-age-prediction-hub-super-secret-key-32chars-minimum-prod";

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || DEFAULT_SECRET,
  callbacks: {
    authorized: ({ token }) => {
      // Require authenticated session AND email verified
      return !!token && token.emailVerified === true;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
