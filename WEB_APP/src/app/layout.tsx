import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AROVA — AI-Native Government Scheme Intelligence Platform for Startups",
  description:
    "Know exactly why you qualify, not just what exists. AROVA is your AI-powered intelligence platform that discovers, verifies, and helps you apply for government schemes with evidence-backed eligibility checks.",
  keywords: [
    "AROVA",
    "startup schemes",
    "government funding",
    "DPIIT",
    "startup india",
    "eligibility check",
    "AI agent",
    "incubator matching",
  ],
  openGraph: {
    title: "AROVA — AI-Native Government Scheme Intelligence",
    description:
      "Know exactly why you qualify, not just what exists. Discover, verify, and apply for government startup schemes with AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0A0A0A] text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
