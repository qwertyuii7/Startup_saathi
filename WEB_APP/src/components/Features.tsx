"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Search,
  ShieldCheck,
  FileText,
  Building2,
  Bell,
  Languages,
  Zap,
  ClipboardCheck,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Scheme Discovery",
    description:
      "Find relevant Central, State, and sector-specific government schemes in seconds — not hours of manual searching.",
    gradient: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    span: "md:col-span-2",
  },
  {
    icon: ShieldCheck,
    title: "Evidence-First Eligibility",
    description:
      "Every decision linked to an official government clause. No hallucinations — only verified answers.",
    gradient: "from-emerald-500/10 to-green-500/10",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    span: "",
  },
  {
    icon: FileText,
    title: "Document Intelligence",
    description:
      "Upload your DPIIT certificate, incorporation docs, or financials. Our OCR engine extracts and builds your profile automatically.",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
    span: "",
  },
  {
    icon: Zap,
    title: "Gap Analysis",
    description:
      "Instantly see what's missing from your application and get actionable steps to fix each gap.",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
    span: "md:col-span-2",
  },
  {
    icon: Building2,
    title: "Incubator Matching",
    description:
      "Get matched with suitable incubators and accelerators based on your startup's stage, sector, and location.",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-600",
    iconBg: "bg-rose-100",
    span: "",
  },
  {
    icon: Bell,
    title: "Policy Change Alerts",
    description:
      "Stay ahead with real-time tracking of scheme guideline changes. Get notified when updates affect your eligibility.",
    gradient: "from-cyan-500/10 to-teal-500/10",
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-100",
    span: "",
  },
  {
    icon: ClipboardCheck,
    title: "Application Copilot",
    description:
      "Go beyond discovery. Generate application checklists, draft cover letters, and prepare submission-ready documents.",
    gradient: "from-indigo-500/10 to-blue-500/10",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100",
    span: "md:col-span-2",
  },
  {
    icon: Languages,
    title: "Hindi & Hinglish Support",
    description:
      "Ask questions in Hindi or Hinglish. Breaking language barriers so every founder can access government support.",
    gradient: "from-fuchsia-500/10 to-purple-500/10",
    iconColor: "text-fuchsia-600",
    iconBg: "bg-fuchsia-100",
    span: "",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10 bg-surface-secondary" />
      <div className="absolute inset-0 -z-10 dot-pattern opacity-30" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-200/60 bg-brand-50/50 mb-6">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
              Features
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-content-primary">
            Everything you need to
            <br />
            <span className="gradient-text">unlock government support</span>
          </h2>
          <p className="mt-5 text-lg text-content-secondary max-w-2xl mx-auto">
            From scheme discovery to application submission — a complete
            AI-powered pipeline designed for Indian startups.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={`group relative rounded-2xl border border-border-default bg-white p-6 sm:p-7 transition-all duration-300 hover:shadow-lg hover:border-brand-200/60 hover:-translate-y-0.5 ${feature.span}`}
            >
              {/* Hover gradient */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="relative">
                <div
                  className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110`}
                >
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-display font-semibold text-content-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-content-secondary">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
