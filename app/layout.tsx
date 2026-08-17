import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Age Prediction Hub | Unified Gateway for Facial & Speaker Age Models",
  description:
    "Unified frontend and authenticated launcher for two state-of-the-art AI demo applications: Facial Age Detection and Speaker Age Prediction.",
  keywords: [
    "AI Age Prediction",
    "Facial Age Detection",
    "Speaker Age Prediction",
    "EfficientNetB3",
    "Machine Learning",
    "Audio AI",
    "Computer Vision",
  ],
  authors: [{ name: "Akilan" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
