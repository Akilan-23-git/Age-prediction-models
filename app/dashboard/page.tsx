import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProjectCard from "@/components/ProjectCard";
import { Activity, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    session = null;
  }

  if (!session?.user) {
    redirect("/login");
  }

  const userName = session.user.name || "User";

  return (
    <div className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Welcoming Header */}
      <div className="mb-10 sm:mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/80 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Authenticated Session Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {userName} 👋
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
              Select an AI model microservice below to launch its dedicated prediction interface in a new tab.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-sm">
              <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span>2 Models Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Large Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {/* Card 1: Facial Age Detection */}
        <ProjectCard
          title="Facial Age Detection"
          description="Upload a photo and let an EfficientNetB3-based deep learning model estimate age from facial features using soft classification over age bins."
          badge="Image Model"
          url="https://age-prediction-frontend.vercel.app/"
          iconType="scan-face"
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          accentColor="#4f46e5"
          deploymentTag="Vercel App"
          highlights={[
            "EfficientNetB3 CNN",
            "Soft Classification Bins",
            "FastAPI / React Client",
            "Photo Upload & WebCam",
          ]}
        />

        {/* Card 2: Speaker Age Prediction */}
        <ProjectCard
          title="Speaker Age Prediction"
          description="Analyze a voice sample through a stacked ensemble (LightGBM, XGBoost, Random Forest) trained on acoustic features to predict the speaker's age."
          badge="Audio / ML Ensemble"
          url="https://speaker-age-prediction.streamlit.app/"
          iconType="audio-lines"
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          accentColor="#0d9488"
          deploymentTag="Streamlit App"
          highlights={[
            "Stacked Ensemble (LGBM/XGB/RF)",
            "Acoustic Feature Extraction",
            "Librosa Audio Processing",
            "Interactive Streamlit UI",
          ]}
        />
      </div>
    </div>
  );
}
