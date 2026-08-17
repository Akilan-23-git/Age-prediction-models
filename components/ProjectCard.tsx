"use client";

import React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ExternalLink, Sparkles, ScanFace, AudioLines } from "lucide-react";

export interface ProjectCardProps {
  title: string;
  description: string;
  badge: string;
  badgeColor?: string;
  url: string;
  iconType: "scan-face" | "audio-lines";
  iconBg: string;
  iconColor: string;
  accentColor: string;
  highlights: string[];
  deploymentTag: string;
}

export default function ProjectCard({
  title,
  description,
  badge,
  url,
  iconType,
  iconBg,
  iconColor,
  accentColor,
  highlights,
  deploymentTag,
}: ProjectCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    toast.info(`Opening ${title} in a new tab...`, {
      duration: 2500,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const renderIcon = () => {
    switch (iconType) {
      case "scan-face":
        return <ScanFace className="h-7 w-7" />;
      case "audio-lines":
        return <AudioLines className="h-7 w-7" />;
      default:
        return <Sparkles className="h-7 w-7" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between rounded-2xl bg-white p-7 sm:p-8 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      {/* Top subtle decorative accent glow on hover */}
      <div
        className="absolute inset-x-0 top-0 h-1 transition-all duration-300 opacity-80 group-hover:h-1.5"
        style={{ backgroundColor: accentColor }}
      />

      <div>
        {/* Top Header Row: Icon + Badge + Deployment */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg} ${iconColor} shadow-sm border border-slate-100 transition-transform duration-300 group-hover:scale-105`}
          >
            {renderIcon()}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
              {badge}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {deploymentTag}
            </span>
          </div>
        </div>

        {/* Project Title */}
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
          <span>{title}</span>
        </h3>

        {/* Short Description (2-3 lines) */}
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
          {description}
        </p>

        {/* Model Feature Highlights / Tags */}
        <div className="mt-5 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {highlights.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200/60"
            >
              <Sparkles className="h-3 w-3 text-indigo-500" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer: Launch Button */}
      <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
          Standalone AI microservice
        </span>

        <span
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 group-hover:bg-indigo-600 group-hover:shadow-md group-hover:shadow-indigo-200"
        >
          <span>Launch App</span>
          <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </motion.div>
  );
}
