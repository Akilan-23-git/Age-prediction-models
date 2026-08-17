"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Send,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setUnverifiedEmail(null);
    setResendStatus(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        if (res.error.includes("EMAIL_NOT_VERIFIED")) {
          const extractedEmail = res.error.split(":")[1] || email.trim();
          setUnverifiedEmail(extractedEmail);
          setErrorMessage(
            "Your email address is not verified yet. Please check your inbox or click below to receive a new link."
          );
        } else {
          setErrorMessage("Invalid email or password. Please try again.");
          toast.error("Invalid email or password");
        }
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back! Loading dashboard...");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setErrorMessage("An unexpected error occurred during login. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResendFromLogin = async () => {
    const targetEmail = unverifiedEmail || email.trim();
    if (!targetEmail) return;

    setIsResending(true);
    setResendStatus(null);

    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to resend email.");
        return;
      }

      if (data.devVerifyUrl) {
        setDevVerifyUrl(data.devVerifyUrl);
      }

      setResendStatus(`Verification link sent to ${targetEmail}. Please check your inbox.`);
      toast.success("Verification link sent!");
    } catch (err) {
      toast.error("Failed to resend verification email.");
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
            Sign In to Hub
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Access your AI Age Prediction models dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/90 shadow-card">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error Message */}
            {errorMessage && (
              <div className="space-y-3 p-4 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-900">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>

                {/* If unverified, offer instant resend button */}
                {unverifiedEmail && (
                  <div className="pt-2 border-t border-amber-200/60 space-y-2">
                    <button
                      type="button"
                      onClick={handleResendFromLogin}
                      disabled={isResending}
                      className="inline-flex items-center gap-1.5 font-semibold text-xs text-indigo-700 hover:text-indigo-900 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm transition-colors"
                    >
                      {isResending ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      <span>Resend verification email to {unverifiedEmail}</span>
                    </button>

                    {resendStatus && (
                      <p className="text-[11px] text-emerald-700 font-medium">{resendStatus}</p>
                    )}

                    {devVerifyUrl && (
                      <div className="p-2 bg-indigo-50 rounded-lg text-[11px] text-indigo-900">
                        <a
                          href={devVerifyUrl}
                          className="font-semibold underline text-indigo-700"
                        >
                          Dev Shortcut: Click here to verify directly →
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-colors outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-colors outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all hover:shadow-md hover:shadow-indigo-200 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom link to Register */}
          <div className="mt-6 text-center text-xs text-slate-600 border-t border-slate-100 pt-5">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
