import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArrowRight, Sparkles, ScanFace, AudioLines, ShieldCheck, Zap } from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative overflow-hidden">
      {/* Background subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-100/60 via-indigo-50/40 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="mx-auto max-w-3xl text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-sm mb-8">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>Unified AI Gateway & Portfolio Launcher</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          AI Age <span className="text-indigo-600">Prediction</span> Hub
        </h1>

        {/* Tagline */}
        <p className="mt-6 text-lg sm:text-xl font-medium text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Two AI models. One dashboard. Predict age from a face or a voice.
        </p>

        {/* About Blurb */}
        <div className="mt-8 p-6 rounded-2xl bg-white/90 border border-slate-200/80 shadow-subtle text-slate-600 text-sm sm:text-base leading-relaxed text-left sm:text-center max-w-2xl mx-auto backdrop-blur-sm">
          <p>
            This hub acts as a single authenticated gateway to two independently-deployed machine learning systems: a deep convolutional vision model for facial analysis and a stacked ensemble trained on acoustic speech features.
          </p>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/70 shadow-sm">
            <ScanFace className="h-4 w-4 text-indigo-600" />
            <span>Facial Age Estimation</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/70 shadow-sm">
            <AudioLines className="h-4 w-4 text-teal-600" />
            <span>Speaker Voice Analysis</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/70 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Verified Auth Gateway</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-300 transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-300 transition-all"
              >
                <span>Get Started (Register)</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
