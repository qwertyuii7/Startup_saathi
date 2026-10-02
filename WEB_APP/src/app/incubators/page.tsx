"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Sparkles,
  Users,
  Target,
  ArrowRight,
  CheckCircle2,
  MapPin,
  TrendingUp,
  BarChart2,
  Search,
  Star,
  Globe,
  Filter,
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

const incubatorFeatures = [
  {
    icon: Search,
    title: "Startup Portfolio Matching",
    desc: "Automatically surface schemes that match startups in your portfolio, ranked by eligibility.",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Gap Analysis",
    desc: "Identify what each portfolio startup needs to unlock the next funding tier.",
    color: "bg-fuchsia-100 text-fuchsia-600",
  },
  {
    icon: BarChart2,
    title: "Portfolio Analytics",
    desc: "Track eligibility rates, pending applications, and funding potential across your cohort.",
    color: "bg-sky-100 text-sky-600",
  },
  {
    icon: TrendingUp,
    title: "Scheme Trend Alerts",
    desc: "Live notifications when new central or state schemes align with your portfolio sectors.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Users,
    title: "Multi-Startup Dashboard",
    desc: "Manage all your portfolio startups from a single, clean command centre.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Globe,
    title: "State Scheme Database",
    desc: "Access schemes from all 28 states + UTs — not just the popular central ones.",
    color: "bg-neutral-900 text-white",
    dark: true,
  },
];

const incubators = [
  {
    name: "T-Hub",
    location: "Hyderabad, Telangana",
    sectors: ["Deep Tech", "AI/ML"],
    stage: "Seed",
    portfolio: "320+",
    match: "98%",
  },
  {
    name: "IIM-A CIIE",
    location: "Ahmedabad, Gujarat",
    sectors: ["Fintech", "Agritech"],
    stage: "Early",
    portfolio: "250+",
    match: "93%",
  },
  {
    name: "Startup Incubation Centre, IIT-D",
    location: "New Delhi",
    sectors: ["DeepTech", "Robotics"],
    stage: "Pre-Seed",
    portfolio: "180+",
    match: "89%",
  },
  {
    name: "NASSCOM 10K Startups",
    location: "Bengaluru, Karnataka",
    sectors: ["SaaS", "Enterprise"],
    stage: "Growth",
    portfolio: "400+",
    match: "85%",
  },
];

const benefits = [
  "Scheme eligibility checked against every portfolio startup's DPIIT profile",
  "Document gap report generated per startup per scheme",
  "Policy alerts delivered when rules affecting your cohort change",
  "Application copilot drafts ready for review — not just templates",
  "Track submission status across all active applications",
];

export default function IncubatorsPage() {
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
            <Building2 className="w-4 h-4" />
            For Incubators &amp; Accelerators
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-5xl md:text-6xl lg:text-7xl font-display font-medium tracking-tight text-white mb-6 leading-tight"
          >
            Power your portfolio{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              with scheme intelligence
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Help every startup in your cohort discover and apply for the government
            funding they deserve — from a single, AI-powered incubator dashboard.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-medium transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 flex items-center justify-center gap-2"
            >
              Book a Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              See the Dashboard
            </Link>
          </motion.div>

          {/* Stat strip */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-20 grid grid-cols-3 gap-6 max-w-xl mx-auto"
          >
            {[
              { val: "500+", label: "Schemes tracked" },
              { val: "28", label: "States &amp; UTs covered" },
              { val: "AI", label: "Eligibility engine" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-2xl md:text-3xl font-display font-bold text-white mb-1"
                  dangerouslySetInnerHTML={{ __html: s.val }}
                />
                <div className="text-xs text-neutral-500" dangerouslySetInnerHTML={{ __html: s.label }} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-violet-600 tracking-widest uppercase mb-3"
            >
              Incubator features
            </motion.p>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-display font-medium tracking-tight text-neutral-900"
            >
              Built for portfolio-level intelligence
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {incubatorFeatures.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i * 0.5}
                className={`border rounded-2xl p-6 hover:shadow-md transition-all group ${f.dark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200 hover:border-neutral-300"}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className={`font-medium text-lg mb-2 ${f.dark ? "text-white" : "text-neutral-900"}`}>
                  {f.title}
                </h3>
                <p className={`text-sm leading-relaxed ${f.dark ? "text-neutral-400" : "text-neutral-500"}`}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scheme + Startup Matching */}
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
                Matching Engine
              </motion.p>
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="text-4xl font-display font-medium tracking-tight text-neutral-900 mb-5"
              >
                Match schemes to startups automatically
              </motion.h2>
              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={1}
                className="text-neutral-500 leading-relaxed mb-8"
              >
                Every startup in your portfolio gets a personalised scheme shortlist.
                Our AI matches each startup's DPIIT profile to the right central,
                state, and sector-specific schemes — so nothing slips through.
              </motion.p>
              <motion.ul
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={2}
                className="space-y-3"
              >
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-600">{b}</span>
                  </li>
                ))}
              </motion.ul>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={3}
                className="mt-8"
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium transition-colors"
                >
                  Book a Demo <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Incubator match cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-3"
            >
              {incubators.map((inc, i) => (
                <div
                  key={i}
                  className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-violet-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-1">{inc.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <MapPin className="w-3 h-3" />
                        {inc.location}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-emerald-600 font-semibold text-sm">
                        <Star className="w-3 h-3 fill-emerald-500" />
                        {inc.match} match
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">{inc.portfolio} startups</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {inc.sectors.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs font-medium rounded-md">
                        {s}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-md">
                      {inc.stage}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
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
              <Building2 className="w-4 h-4" />
              Incubator plan available
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-white mb-5">
              Supercharge your incubator's impact
            </h2>
            <p className="text-neutral-400 text-lg mb-10">
              Give every startup in your cohort an unfair advantage. Get in touch to
              learn about our incubator &amp; accelerator partnership plans.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-neutral-900 hover:bg-neutral-100 rounded-2xl font-medium transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
              >
                Book a Demo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/startups"
                className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                For Startups instead →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
