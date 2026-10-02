"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  Clock,
  ExternalLink,
  Filter,
  Search,
  Sparkles,
  Tag,
} from "lucide-react";
import CardNav from "@/components/landing/CardNav";
import Footer from "@/components/Footer";

type EaseTuple = [number, number, number, number];
const EASE: EaseTuple = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: EASE },
  }),
};

const updates = [
  {
    id: 1,
    type: "critical",
    icon: AlertTriangle,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
    badge: "Critical Change",
    badgeColor: "bg-red-100 text-red-700",
    date: "Sep 30, 2026",
    tag: "Seed Fund",
    tagColor: "bg-violet-100 text-violet-700",
    title: "Startup India Seed Fund: Turnover limit raised to ₹50L",
    summary:
      "The Ministry of Commerce revised the maximum turnover eligibility for the Startup India Seed Fund Scheme from ₹25 Lakhs to ₹50 Lakhs. This opens eligibility to an estimated 12,000+ additional startups across India.",
    impact: "Affects You",
    impactColor: "bg-neutral-900 text-white",
    source: "Ministry of Commerce & Industry",
    link: "#",
  },
  {
    id: 2,
    type: "new",
    icon: Sparkles,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
    badge: "New Scheme",
    badgeColor: "bg-violet-100 text-violet-700",
    date: "Sep 22, 2026",
    tag: "State — UP",
    tagColor: "bg-blue-100 text-blue-700",
    title: "UP launches ₹500 Cr AI Startup Fund for early-stage founders",
    summary:
      "The Uttar Pradesh government announced a dedicated ₹500 Crore fund for AI-first startups headquartered in the state. DPIIT-recognised startups under 3 years old are eligible for grants up to ₹25 Lakhs.",
    impact: "Possible Match",
    impactColor: "bg-orange-100 text-orange-700",
    source: "UP IT & Electronics Department",
    link: "#",
  },
  {
    id: 3,
    type: "update",
    icon: Info,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-100",
    badge: "Policy Update",
    badgeColor: "bg-sky-100 text-sky-700",
    date: "Sep 15, 2026",
    tag: "Fund of Funds",
    tagColor: "bg-neutral-100 text-neutral-600",
    title: "SIDBI FoF application window reopened for FY 2026-27",
    summary:
      "SIDBI has reopened the application window for its Fund of Funds scheme. Only SEBI-registered AIFs with a minimum corpus of ₹100 Crore qualify. The deadline for the current tranche is November 30, 2026.",
    impact: "Check Eligibility",
    impactColor: "bg-sky-100 text-sky-700",
    source: "SIDBI",
    link: "#",
  },
  {
    id: 4,
    type: "good",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    badge: "Positive Change",
    badgeColor: "bg-emerald-100 text-emerald-700",
    date: "Sep 8, 2026",
    tag: "DPIIT",
    tagColor: "bg-neutral-100 text-neutral-600",
    title: "DPIIT recognition process reduced to 72 hours from 30 days",
    summary:
      "The Department for Promotion of Industry and Internal Trade has streamlined its recognition process. Startups can now receive their DPIIT certificate within 72 hours of submission, down from the previous 30-day window.",
    impact: "Good News",
    impactColor: "bg-emerald-100 text-emerald-700",
    source: "DPIIT — Startup India Portal",
    link: "#",
  },
  {
    id: 5,
    type: "update",
    icon: Info,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-100",
    badge: "Policy Update",
    badgeColor: "bg-sky-100 text-sky-700",
    date: "Aug 29, 2026",
    tag: "State — Karnataka",
    tagColor: "bg-blue-100 text-blue-700",
    title: "Karnataka Elevate Scheme: Batch 7 applications now open",
    summary:
      "The Karnataka government has opened applications for Elevate Batch 7, offering grants up to ₹50 Lakhs for technology startups. Sectors prioritised this round include Agritech, Healthtech, and Cleantech.",
    impact: "Possible Match",
    impactColor: "bg-orange-100 text-orange-700",
    source: "Startup Karnataka",
    link: "#",
  },
  {
    id: 6,
    type: "critical",
    icon: AlertTriangle,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
    badge: "Deadline Alert",
    badgeColor: "bg-red-100 text-red-700",
    date: "Aug 14, 2026",
    tag: "Atal Innovation Mission",
    tagColor: "bg-violet-100 text-violet-700",
    title: "AIM challenge deadline extended to October 31, 2026",
    summary:
      "The Atal Innovation Mission has extended the application deadline for its Grand Innovation Challenge to October 31, 2026. Startups working on climate-tech solutions can still submit their applications.",
    impact: "Deadline Extended",
    impactColor: "bg-orange-100 text-orange-700",
    source: "Atal Innovation Mission — NITI Aayog",
    link: "#",
  },
];

const typeFilters = ["All Updates", "Critical", "New Schemes", "Deadlines", "Policy Changes"];

export default function UpdatesPage() {
  return (
    <div className="bg-white min-h-screen text-neutral-900 font-default selection:bg-violet-200">
      <CardNav
        baseColor="#0A0A0A"
        menuColor="#fff"
        buttonBgColor="#fff"
        buttonTextColor="#000"
        items={[
          {
            label: "Product",
            bgColor: "#1B1722",
            textColor: "#fff",
            links: [
              { label: "Scheme Discovery", href: "/dashboard" },
              { label: "Eligibility Simulator", href: "/simulator" },
            ],
          },
          {
            label: "Solutions",
            bgColor: "#2F293A",
            textColor: "#fff",
            links: [
              { label: "For Startups", href: "/startups" },
              { label: "For Incubators", href: "/incubators" },
            ],
          },
          {
            label: "Resources",
            bgColor: "#1B1722",
            textColor: "#fff",
            links: [
              { label: "Policy Updates", href: "/updates" },
              { label: "Contact Us", href: "/contact" },
            ],
          },
        ]}
      />

      {/* Page Header */}
      <section className="relative bg-[#0A0A0A] pt-36 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/50 to-[#0A0A0A]" />

        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6"
          >
            <Bell className="w-4 h-4" />
            Live Policy Intelligence
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight text-white mb-4"
          >
            Policy Updates
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-lg text-neutral-400 max-w-2xl"
          >
            Stay ahead of every scheme change, deadline, and new opportunity. Our AI
            monitors 500+ government sources daily — so you never miss what matters.
          </motion.p>

          {/* Alert strip */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-8 flex flex-wrap gap-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>2 critical changes this week</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>1 new scheme added</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-neutral-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Last updated: 2 hours ago</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters + Feed */}
      <section className="py-12 bg-neutral-50 border-b border-neutral-200 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Search & filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search policy updates..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-500/15 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Tab filters */}
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {typeFilters.map((f, i) => (
              <button
                key={f}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  i === 0
                    ? "bg-neutral-900 text-white"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Updates feed */}
          <div className="space-y-5">
            {updates.map((update, i) => (
              <motion.article
                key={update.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i * 0.3}
                className="bg-white border border-neutral-200 rounded-2xl p-6 hover:border-neutral-300 hover:shadow-sm transition-all"
                aria-labelledby={`update-title-${update.id}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${update.iconBg}`}>
                    <update.icon className={`w-5 h-5 ${update.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${update.badgeColor}`}>
                        {update.badge}
                      </span>
                      <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md flex items-center gap-1 ${update.impactColor}`}>
                        {update.impact}
                      </span>
                      <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md flex items-center gap-1 ${update.tagColor}`}>
                        <Tag className="w-2.5 h-2.5" />
                        {update.tag}
                      </span>
                      <span className="ml-auto text-xs text-neutral-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {update.date}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      id={`update-title-${update.id}`}
                      className="font-medium text-neutral-900 text-lg mb-2 leading-snug"
                    >
                      {update.title}
                    </h2>

                    {/* Summary */}
                    <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                      {update.summary}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <span className="text-xs text-neutral-400">
                        Source:{" "}
                        <span className="text-neutral-600 font-medium">{update.source}</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <button className="text-xs font-semibold text-violet-600 hover:underline flex items-center gap-1">
                          Re-check eligibility
                        </button>
                        <a
                          href={update.link}
                          className="text-xs font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
                          aria-label={`Read full notice for ${update.title}`}
                        >
                          Full notice <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load more */}
          <div className="text-center mt-10">
            <button className="px-8 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              Load older updates
            </button>
          </div>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Bell className="w-8 h-8 text-violet-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white mb-4">
              Get alerts that are personalised to you
            </h2>
            <p className="text-neutral-400 mb-8">
              Sign up and our AI will notify you the moment a policy change affects
              your eligibility — not every policy, just the ones that matter.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-medium transition-all duration-200 shadow-lg shadow-violet-500/25"
            >
              Get Personalised Alerts <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
