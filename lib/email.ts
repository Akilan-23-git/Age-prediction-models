import { Resend } from "resend";
import nodemailer from "nodemailer";

const DEFAULT_GMAIL_USER = "akilanaki51@gmail.com";
const DEFAULT_GMAIL_APP_PASSWORD = "yism fkxz ytuk sqyx";

export type EmailProvider = "gmail" | "resend";

export const getEmailProvider = (): EmailProvider => {
  return (process.env.EMAIL_PROVIDER?.toLowerCase() as EmailProvider) || "gmail";
};

// Sender address helper
export const SENDER_EMAIL =
  process.env.EMAIL_FROM || `AI Age Prediction Hub <${process.env.GMAIL_USER || DEFAULT_GMAIL_USER}>`;

interface SendVerificationEmailOptions {
  to: string;
  name: string;
  token: string;
}

export function getVerificationEmailHtml(name: string, verifyUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email - AI Age Prediction Hub</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: #4f46e5;
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 13px;
      opacity: 0.9;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .text {
      color: #475569;
      font-size: 15px;
      margin-bottom: 24px;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 10px;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.25);
    }
    .alt-link {
      font-size: 13px;
      color: #64748b;
      word-break: break-all;
      background: #f1f5f9;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      margin-top: 24px;
    }
    .footer {
      background: #f8fafc;
      padding: 20px 32px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AI Age Prediction Hub</h1>
      <p>Single Gateway for Facial & Speaker Age AI Models</p>
    </div>
    <div class="content">
      <div class="greeting">Hi ${name},</div>
      <p class="text">
        Thank you for registering for the <strong>AI Age Prediction Hub</strong>. Please confirm your email address to activate your account and gain access to the prediction models dashboard.
      </p>
      <div class="button-container">
        <a href="${verifyUrl}" class="button" target="_blank">Verify My Email Address</a>
      </div>
      <p class="text" style="font-size: 14px; margin-bottom: 8px;">
        Or copy and paste this link in your browser:
      </p>
      <div class="alt-link">
        ${verifyUrl}
      </div>
      <p class="text" style="font-size: 13px; margin-top: 24px; color: #94a3b8;">
        This verification link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} AI Age Prediction Hub · Built by Akilan
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Universal verification email sender supporting both Resend and Gmail SMTP
 */
export async function sendVerificationEmail({ to, name, token }: SendVerificationEmailOptions) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const verifyUrl = `${appUrl.replace(/\/$/, "")}/verify?token=${encodeURIComponent(token)}`;
  const provider = getEmailProvider();
  const isProduction = process.env.NODE_ENV === "production";
  const htmlContent = getVerificationEmailHtml(name, verifyUrl);

  // -------------------------------------------------------------
  // PROVIDER 1: GMAIL SMTP via nodemailer
  // -------------------------------------------------------------
  if (provider === "gmail") {
    const gmailUser = process.env.GMAIL_USER || DEFAULT_GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD || DEFAULT_GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      if (isProduction) {
        throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be configured when EMAIL_PROVIDER='gmail'.");
      }
      console.log("-------------------------------------------------------");
      console.log(`[DEV MODE / GMAIL FALLBACK] Verification Email for: ${to}`);
      console.log(`Verification URL: ${verifyUrl}`);
      console.log("Reason: GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env.local");
      console.log("-------------------------------------------------------");
      return { success: true, isDevFallback: true, verifyUrl };
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPassword.replace(/\s+/g, ""), // Strip spaces if pasted from Google
        },
      });

      const sender = process.env.EMAIL_FROM || `AI Age Prediction Hub <${gmailUser}>`;

      const info = await transporter.sendMail({
        from: sender,
        to,
        subject: "Confirm your email - AI Age Prediction Hub",
        html: htmlContent,
      });

      console.log(`[Gmail SMTP Success] Message sent to ${to} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, verifyUrl };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("-------------------------------------------------------");
      console.error("[Gmail SMTP Error]:", errorMsg);
      console.error("Tip: Ensure you generated a 16-character Google App Password under Google Account -> Security -> 2-Step Verification -> App Passwords.");
      console.error(`[DEV VERIFY LINK]: ${verifyUrl}`);
      console.error("-------------------------------------------------------");

      if (isProduction) {
        throw new Error(`Gmail SMTP delivery failed: ${errorMsg}`);
      }
      return { success: true, isDevFallback: true, verifyUrl, error: errorMsg };
    }
  }

  // -------------------------------------------------------------
  // PROVIDER 2: RESEND SDK
  // -------------------------------------------------------------
  const resendApiKey = process.env.RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;
  const sender = process.env.EMAIL_FROM || "AI Age Prediction Hub <onboarding@resend.dev>";

  if (!resend) {
    if (isProduction) {
      throw new Error("RESEND_API_KEY is not configured in production environment variables.");
    }
    console.log("-------------------------------------------------------");
    console.log(`[DEV MODE / RESEND FALLBACK] Verification Email for: ${to}`);
    console.log(`From: ${sender}`);
    console.log(`Verification URL: ${verifyUrl}`);
    console.log("-------------------------------------------------------");
    return { success: true, isDevFallback: true, verifyUrl };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to,
      subject: "Confirm your email - AI Age Prediction Hub",
      html: htmlContent,
    });

    if (error) {
      if (isProduction) {
        throw new Error(`Resend email delivery failed: ${error.message}`);
      }
      console.warn("[Resend API Notice in Dev]:", error.message);
      console.log(`[DEV VERIFY LINK]: ${verifyUrl}`);
      return { success: true, isDevFallback: true, verifyUrl, error: error.message };
    }

    return { success: true, data, verifyUrl };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (isProduction) {
      throw err;
    }
    console.error("[Resend API Error]:", message);
    console.log(`[DEV VERIFY LINK]: ${verifyUrl}`);
    return { success: true, isDevFallback: true, verifyUrl, error: message };
  }
}
