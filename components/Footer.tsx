import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
            <Sparkles className="h-3 w-3" />
          </div>
          <span className="font-medium text-slate-700">AI Age Prediction Hub</span>
          <span className="text-slate-300">•</span>
          <span>Built by Akilan · Portfolio Project</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>Secure Authentication</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Cpu className="h-3.5 w-3.5 text-indigo-500" />
            <span>Dual AI Microservices</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
