"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Mail,
  KeyRound,
} from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const [token, setToken] = useState(tokenFromUrl || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasAttempted, setHasAttempted] = useState(false);

  // Resend form states
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // Auto-verify if token is provided in URL
  useEffect(() => {
    if (tokenFromUrl && !hasAttempted) {
      performVerification(tokenFromUrl);
    }
  }, [tokenFromUrl, hasAttempted]);

  const performVerification = async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) {
      setErrorMessage("Please enter a verification token.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");
    setHasAttempted(true);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToVerify.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Verification failed. The token may be expired or invalid.");
        toast.error(data.error || "Verification failed");
        return;
      }

      setIsSuccess(true);
      toast.success("Email verified successfully! You can now log in.");
    } catch (err) {
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setIsResending(true);
    setResendMessage("");

    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to resend verification email.");
        return;
      }

      setResendMessage(data.message || "A new verification email has been sent!");
      toast.success("Verification link resent! Check your inbox.");
    } catch (err) {
      toast.error("Failed to resend email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Account Verification
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Confirm your email address to unlock access to the AI models
          </p>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/90 shadow-card text-center">
          {isVerifying ? (
            <div className="py-8 space-y-4">
              <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Verifying your token...</p>
            </div>
          ) : isSuccess ? (
            <div className="space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Email Verified Successfully!</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your account is fully activated. You can now log in to the dashboard to launch the AI models.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                >
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
                <XCircle className="h-9 w-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Verification Failed</h3>
                <p className="text-sm text-red-600 leading-relaxed">{errorMessage}</p>
              </div>

              {/* Resend Link Box */}
              <div className="border-t border-slate-100 pt-5 text-left space-y-3">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Request a new verification link
                </h4>
                <form onSubmit={handleResend} className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="block w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-colors outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isResending}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-600 transition-colors disabled:opacity-50"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Resend Verification Link</span>
                    )}
                  </button>
                </form>
                {resendMessage && (
                  <p className="text-xs text-emerald-600 font-medium">{resendMessage}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* Manual Token Entry Form if user arrived without token param */
            <div className="space-y-5 text-left">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-800">
                  Enter Verification Code
                </h3>
                <p className="text-xs text-slate-500">
                  Paste the verification token you received via email.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your 64-character token"
                  className="block w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-colors outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => performVerification(token)}
                disabled={isVerifying || !token.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <span>Verify Token</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
