"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  FileText,
  ArrowRight,
  Search,
  Shield,
  Zap,
  ChevronRight,
  UploadCloud,
  AlertCircle,
  Clock,
  Target,
  ListChecks,
  PenLine,
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

const steps = [
  {
    num: "01",
    icon: UploadCloud,
    title: "Upload your DPIIT Certificate",
    desc: "Our AI extracts your startup profile — sector, age, financials, and more — in seconds.",
    color: "bg-violet-100 text-violet-600",
  },
  {
    num: "02",
    icon: Search,
    title: "Discover Matching Schemes",
    desc: "We scan 500+ central and state schemes and rank them by your eligibility score.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    num: "03",
    icon: Shield,
    title: "Verify Eligibility with Evidence",
    desc: "Every match is backed by clause-level reasoning from the actual policy document.",
    color: "bg-sky-100 text-sky-600",
  },
  {
    num: "04",
    icon: PenLine,
    title: "Generate Application Drafts",
    desc: "AI Copilot drafts your application, cover letter, and document checklist automatically.",
    color: "bg-fuchsia-100 text-fuchsia-600",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "Scheme Discovery",
    desc: "AI-powered matching across 500+ government schemes — central, state, and sector-specific.",
    tag: "Core",
    tagColor: "bg-violet-100 text-violet-700",
  },
  {
    icon: CheckCircle2,
    title: "Eligibility Simulator",
    desc: "Run 'what if' scenarios. See exactly how a change in turnover or age affects your eligibility.",
    tag: "Smart",
    tagColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: AlertCircle,
    title: "Gap Analysis",
    desc: "Get a clear list of missing documents and requirements blocking each scheme.",
    tag: "Clarity",
    tagColor: "bg-orange-100 text-orange-700",
  },
  {
    icon: FileText,
    title: "Document Checklist",
    desc: "Auto-generated, scheme-specific document lists with upload tracking.",
    tag: "Organized",
    tagColor: "bg-sky-100 text-sky-700",
  },
  {
    icon: ListChecks,
    title: "Action Plan",
    desc: "A prioritised to-do list that keeps you on track from discovery to submission.",
    tag: "Guided",
    tagColor: "bg-fuchsia-100 text-fuchsia-700",
  },
  {
    icon: Zap,
    title: "Policy Alerts",
    desc: "Instant notifications when a policy that affects your eligibility changes.",
    tag: "Live",
    tagColor: "bg-yellow-100 text-yellow-700",
  },
];

const schemeExamples = [
  {
    badge: "Central",
    badgeColor: "bg-neutral-100 text-neutral-600",
    fit: "Strong Fit",
    fitColor: "bg-emerald-100 text-emerald-700",
    name: "Startup India Seed Fund Scheme",
    desc: "Financial assistance for proof of concept, prototype, and market entry.",
    met: "3 of 3 criteria met",
  },
  {
    badge: "State",
    badgeColor: "bg-neutral-100 text-neutral-600",
    fit: "Possible",
    fitColor: "bg-orange-100 text-orange-700",
    name: "UP Startup Policy 2020",
    desc: "Sustenance allowance and marketing assistance for early-stage startups.",
    met: "2 of 3 criteria met",
  },
  {
    badge: "Central",
    badgeColor: "bg-neutral-100 text-neutral-600",
    fit: "Not Yet",
    fitColor: "bg-neutral-100 text-neutral-600",
    name: "SIDBI Fund of Funds",
    desc: "Growth capital through SEBI-registered AIFs for scaling startups.",
    met: "1 of 3 criteria met",
  },
];

export default function StartupsPage() {
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

      {/* Hero */}
      <section className="relative bg-[#0A0A0A] pt-40 pb-28 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/50 to-[#0A0A0A]" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Built for Indian Startups
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-5xl md:text-6xl lg:text-7xl font-display font-medium tracking-tight text-white mb-6 leading-tight"
          >
            Know exactly{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              why you qualify
            </span>
            ,<br className="hidden sm:block" /> not just what exists.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Startup Saathi discovers, verifies, and helps you apply for government
            schemes with evidence-backed eligibility checks — so you stop guessing
            and start winning.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-medium transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              View Demo Dashboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-violet-600 tracking-widest uppercase mb-3"
            >
              How it works
            </motion.p>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-display font-medium tracking-tight text-neutral-900"
            >
              From zero to funded in 4 steps
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                className="relative bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.color}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="font-display font-bold text-4xl text-neutral-100 leading-none">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-medium text-neutral-900 text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="w-6 h-6 text-neutral-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Scheme Preview */}
      <section className="py-24 bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-sm font-semibold text-violet-600 tracking-widest uppercase mb-3"
              >
                Scheme Discovery
              </motion.p>
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="text-4xl font-display font-medium tracking-tight text-neutral-900 mb-5"
              >
                Every scheme ranked by how well you fit
              </motion.h2>
              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={1}
                className="text-neutral-500 leading-relaxed mb-8"
              >
                Instead of a generic list, you get a personalised ranking based on
                your DPIIT profile — with each match backed by clause-level evidence
                from the policy document.
              </motion.p>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={2}
                className="space-y-3"
              >
                {["Strong Fit — 3 of 3 criteria met with evidence", "Possible — 1 criterion missing, easy to fix", "Not Yet — clear gap analysis with your action plan"].map(
                  (item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-neutral-600 text-sm">{item}</span>
                    </div>
                  )
                )}
              </motion.div>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={3}
                className="mt-8"
              >
                <Link
                  href="/dashboard/schemes"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium transition-colors"
                >
                  Explore Schemes <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Mock Schemes UI */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-3"
            >
              {schemeExamples.map((s, i) => (
                <div
                  key={i}
                  className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-violet-200 hover:shadow-sm transition-all cursor-default"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${s.badgeColor}`}>
                          {s.badge}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${s.fitColor}`}>
                          {s.fit}
                        </span>
                      </div>
                      <h4 className="font-medium text-neutral-900 mb-1">{s.name}</h4>
                      <p className="text-sm text-neutral-500">{s.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-neutral-400 font-medium">{s.met}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-violet-600 tracking-widest uppercase mb-3"
            >
              Everything you need
            </motion.p>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-display font-medium tracking-tight text-neutral-900"
            >
              The complete funding toolkit
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i * 0.5}
                className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-md hover:border-neutral-300 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 group-hover:bg-violet-50 flex items-center justify-center transition-colors">
                    <f.icon className="w-6 h-6 text-neutral-600 group-hover:text-violet-600 transition-colors" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${f.tagColor}`}>
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-medium text-neutral-900 text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gap Analysis Preview */}
      <section className="py-24 bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Mock Gap Analysis UI */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm order-2 lg:order-1"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-neutral-900">Missing Requirements</h3>
                <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                  2 gaps
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900 text-sm mb-1">Audited Financials</h4>
                    <p className="text-xs text-neutral-500">Required for Seed Fund scheme. Upload FY2023-24 balance sheet to unlock.</p>
                    <button className="mt-2 text-xs font-semibold text-violet-600 hover:underline">
                      Upload now →
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900 text-sm mb-1">Turnover Below ₹25L</h4>
                    <p className="text-xs text-neutral-500">SIDBI FoF requires &gt;₹25L turnover. You are at ₹14L currently.</p>
                    <button className="mt-2 text-xs font-semibold text-neutral-400 cursor-default">
                      Monitor milestone
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="font-medium text-neutral-900 text-sm">DPIIT Certificate</h4>
                    <p className="text-xs text-neutral-500">Valid and verified. Expires in 18 months.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="order-1 lg:order-2">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-sm font-semibold text-violet-600 tracking-widest uppercase mb-3"
              >
                Gap Analysis
              </motion.p>
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="text-4xl font-display font-medium tracking-tight text-neutral-900 mb-5"
              >
                Know exactly what's blocking you
              </motion.h2>
              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={1}
                className="text-neutral-500 leading-relaxed mb-8"
              >
                For every scheme you don't yet qualify for, Startup Saathi gives you
                a precise gap list — not vague advice. Upload a document, hit a
                milestone, and watch your eligibility update in real time.
              </motion.p>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={2}
              >
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors"
                >
                  Analyse My Gaps <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-8">
              <Target className="w-4 h-4" />
              Start for free
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-white mb-5">
              Stop missing schemes you qualify for
            </h2>
            <p className="text-neutral-400 text-lg mb-10">
              Join thousands of Indian startups using Startup Saathi to find and win
              government funding — evidence-backed, not guesswork.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-neutral-900 hover:bg-neutral-100 rounded-2xl font-medium transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                Talk to Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
