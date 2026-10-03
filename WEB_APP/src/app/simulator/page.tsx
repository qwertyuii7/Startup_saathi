"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sliders,
  Building2,
  Calendar,
  IndianRupee,
  Shield,
  Layers,
  MapPin,
  Users,
  Award,
  Zap,
  ChevronRight,
  Info,
  Check,
  Filter,
  FileCheck2,
} from "lucide-react";
import CardNav from "@/components/landing/CardNav";
import Footer from "@/components/Footer";

type EaseTuple = [number, number, number, number];
const EASE: EaseTuple = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: EASE },
  }),
};

// --- DATA STRUCTURES & SCHEMES DATABASE ---
interface SchemeDefinition {
  id: string;
  name: string;
  agency: string;
  type: "Central" | "State" | "Debt/Guarantee";
  maxGrantLakhs: number;
  fundingType: "Grant" | "Convertible / Debt" | "Subsidy" | "Equity Co-Investment";
  summary: string;
  check: (s: StartupProfile) => {
    isEligible: boolean;
    isNearFit: boolean;
    score: number; // 0 - 100
    clauseChecks: { label: string; passed: boolean; reason: string }[];
    whatIfFix?: string;
  };
}

interface StartupProfile {
  dpiitStatus: "recognized" | "applied" | "none";
  ageMonths: number;
  turnoverLakhs: number;
  sector: string;
  entityType: "pvt_ltd" | "llp" | "partnership" | "proprietorship";
  state: string;
  isWomenLed: boolean;
  isScStLed: boolean;
  hasPatentOrIP: boolean;
  isTier2or3: boolean;
  priorFundingLakhs: number;
}

const DEFAULT_PROFILE: StartupProfile = {
  dpiitStatus: "recognized",
  ageMonths: 14,
  turnoverLakhs: 20,
  sector: "DeepTech & AI",
  entityType: "pvt_ltd",
  state: "Karnataka",
  isWomenLed: false,
  isScStLed: false,
  hasPatentOrIP: true,
  isTier2or3: false,
  priorFundingLakhs: 0,
};

const SCHEMES_DATABASE: SchemeDefinition[] = [
  {
    id: "sisfs",
    name: "Startup India Seed Fund Scheme (SISFS)",
    agency: "DPIIT, Ministry of Commerce",
    type: "Central",
    maxGrantLakhs: 50,
    fundingType: "Grant",
    summary: "Financial assistance for proof of concept, prototype development, market trials, and commercialization through registered incubators.",
    check: (p) => {
      const c1 = p.dpiitStatus === "recognized";
      const c2 = p.ageMonths <= 24;
      const c3 = p.turnoverLakhs <= 50;
      const c4 = p.entityType === "pvt_ltd" || p.entityType === "llp";
      const c5 = p.priorFundingLakhs <= 50;

      const clauses = [
        {
          label: "DPIIT Recognition",
          passed: c1,
          reason: c1 ? "Valid recognition active" : "DPIIT recognition is mandatory",
        },
        {
          label: "Age <= 24 Months",
          passed: c2,
          reason: c2 ? `Age is ${p.ageMonths} mo (within limit)` : `Age ${p.ageMonths} mo exceeds 24 mo ceiling`,
        },
        {
          label: "Turnover <= ₹50 Lakhs",
          passed: c3,
          reason: c3 ? `Turnover ₹${p.turnoverLakhs}L is within ceiling` : `Turnover ₹${p.turnoverLakhs}L exceeds ₹50L cap`,
        },
        {
          label: "Entity Type (Pvt Ltd / LLP)",
          passed: c4,
          reason: c4 ? "Eligible incorporated entity" : "Sole prop / unregistered partnerships ineligible",
        },
        {
          label: "Prior Funding <= ₹50 Lakhs",
          passed: c5,
          reason: c5 ? "Within funding ceiling" : "Prior funding > ₹50L disqualifies seed grant",
        },
      ];

      const passCount = clauses.filter((c) => c.passed).length;
      const isEligible = passCount === clauses.length;
      const isNearFit = !isEligible && passCount >= 3;
      const score = Math.round((passCount / clauses.length) * 100);

      let whatIfFix = "";
      if (!c1) whatIfFix = "Obtain DPIIT recognition to unlock up to ₹50L grant.";
      else if (!c2) whatIfFix = "Age exceeds 2 years; consider SIDBI Fund of Funds instead.";
      else if (!c3) whatIfFix = "Turnover exceeds ₹50L; explore commercial scale grants.";

      return { isEligible, isNearFit, score, clauseChecks: clauses, whatIfFix };
    },
  },
  {
    id: "birac-big",
    name: "BIRAC Biotechnology Ignition Grant (BIG)",
    agency: "Department of Biotechnology (DBT)",
    type: "Central",
    maxGrantLakhs: 50,
    fundingType: "Grant",
    summary: "Up to ₹50 Lakhs ignition grant to establish proof-of-concept for innovative ideas in Biotech, HealthTech, AgriTech, and Bio-IT.",
    check: (p) => {
      const isBioSector = ["HealthTech & BioTech", "AgriTech & Rural Tech", "CleanTech & EV"].includes(p.sector);
      const c1 = isBioSector;
      const c2 = p.ageMonths <= 60;
      const c3 = p.hasPatentOrIP;
      const c4 = p.entityType === "pvt_ltd" || p.entityType === "llp";

      const clauses = [
        {
          label: "Sector Alignment (Bio / Health / Agri / Clean)",
          passed: c1,
          reason: c1 ? `${p.sector} aligns with biotechnology domain` : "Non-biotech/health domains not covered",
        },
        {
          label: "Age <= 5 Years (60 Months)",
          passed: c2,
          reason: c2 ? `Age ${p.ageMonths} mo is eligible` : "Incorporation > 5 years ineligible",
        },
        {
          label: "Proprietary IP or Patent Asset",
          passed: c3,
          reason: c3 ? "Proprietary IP/Patent confirmed" : "Requires demonstrable novel intellectual property",
        },
        {
          label: "Registered Entity Structure",
          passed: c4,
          reason: c4 ? "Entity structure verified" : "Requires registered corporate entity",
        },
      ];

      const passCount = clauses.filter((c) => c.passed).length;
      const isEligible = passCount === clauses.length;
      const isNearFit = !isEligible && passCount >= 2;
      const score = Math.round((passCount / clauses.length) * 100);

      let whatIfFix = "";
      if (!c1) whatIfFix = "Focus proposal on Bio-AI or healthcare crossover applications.";
      else if (!c3) whatIfFix = "File a provisional patent or software copyright to qualify.";

      return { isEligible, isNearFit, score, clauseChecks: clauses, whatIfFix };
    },
  },
  {
    id: "meity-tide",
    name: "MeitY TIDE 2.0 (Electronics & IT)",
    agency: "Ministry of Electronics & IT (MeitY)",
    type: "Central",
    maxGrantLakhs: 30,
    fundingType: "Grant",
    summary: "Grant support up to ₹30 Lakhs for tech entrepreneurs using emerging technologies (IoT, AI, Blockchain, Robotics) to solve national challenges.",
    check: (p) => {
      const isTech = ["DeepTech & AI", "Enterprise SaaS", "CleanTech & EV", "FinTech & Payments"].includes(p.sector);
      const c1 = isTech;
      const c2 = p.dpiitStatus !== "none";
      const c3 = p.ageMonths <= 84;
      const c4 = p.turnoverLakhs <= 2500;

      const clauses = [
        {
          label: "Emerging Tech Focus (AI/IoT/SaaS)",
          passed: c1,
          reason: c1 ? `${p.sector} qualifies under MeitY technology verticals` : "Requires electronics, software or AI focus",
        },
        {
          label: "DPIIT Registration Active/Applied",
          passed: c2,
          reason: c2 ? "DPIIT requirement met" : "Requires DPIIT recognition",
        },
        {
          label: "Age <= 7 Years",
          passed: c3,
          reason: c3 ? `Age ${p.ageMonths} mo is well within 7-year bracket` : "Age exceeds 7 years",
        },
        {
          label: "Turnover <= ₹25 Crores",
          passed: c4,
          reason: c4 ? `Turnover ₹${p.turnoverLakhs}L complies` : "Exceeds SME turnover threshold",
        },
      ];

      const passCount = clauses.filter((c) => c.passed).length;
      const isEligible = passCount === clauses.length;
      const isNearFit = !isEligible && passCount >= 2;
      const score = Math.round((passCount / clauses.length) * 100);

      let whatIfFix = "";
      if (!c1) whatIfFix = "Demonstrate AI/ML component in your product roadmap.";

      return { isEligible, isNearFit, score, clauseChecks: clauses, whatIfFix };
    },
  },
  {
    id: "up-policy",
    name: "UP Startup Policy 2020 (Sustenance & Seed)",
    agency: "Government of Uttar Pradesh",
    type: "State",
    maxGrantLakhs: 20,
    fundingType: "Grant",
    summary: "₹17,500/mo sustenance allowance (₹20,000/mo for women/SC/ST) for 1 year + up to ₹7.5 Lakhs seed capital & marketing aid.",
    check: (p) => {
      const isUP = p.state === "Uttar Pradesh";
      const c1 = isUP;
      const c2 = p.ageMonths <= 60;
      const c3 = p.dpiitStatus !== "none";

      const clauses = [
        {
          label: "Registered HQ in Uttar Pradesh",
          passed: c1,
          reason: c1 ? "Registered in UP" : `Currently set to ${p.state}; requires registered office in UP`,
        },
        {
          label: "Age <= 5 Years",
          passed: c2,
          reason: c2 ? `Age ${p.ageMonths} mo eligible` : "Company older than 5 years",
        },
        {
          label: "DPIIT or Startup UP Recognition",
          passed: c3,
          reason: c3 ? "Recognition verified" : "Requires DPIIT recognition",
        },
      ];

      const passCount = clauses.filter((c) => c.passed).length;
      const isEligible = passCount === clauses.length;
      const isNearFit = !isEligible && (c2 && c3);
      const score = Math.round((passCount / clauses.length) * 100);

      let whatIfFix = "";
      if (!c1) whatIfFix = "Register a branch or operating office in UP to unlock state sustenance allowance.";

      return { isEligible, isNearFit, score, clauseChecks: clauses, whatIfFix };
    },
  },
  {
    id: "karnataka-elevate",
    name: "Karnataka ELEVATE 100 Innovation Grant",
    agency: "Department of IT & BT, Karnataka",
    type: "State",
    maxGrantLakhs: 50,
    fundingType: "Grant",
    summary: "Flagship grant scheme providing up to ₹50 Lakhs equity-free grant to top 100 innovative tech startups in Karnataka.",
    check: (p) => {
      const isKA = p.state === "Karnataka";
      const c1 = isKA;
      const c2 = p.ageMonths <= 120;
      const c3 = p.hasPatentOrIP;

      const clauses = [
        {
          label: "Registered HQ in Karnataka",
          passed: c1,
          reason: c1 ? "HQ in Karnataka verified" : `Currently set to ${p.state}; requires Karnataka registration`,
        },
        {
          label: "Age <= 10 Years",
          passed: c2,
          reason: c2 ? "Age verified" : "Age exceeds 10 years",
        },
        {
          label: "Novel IP / Technical Innovation",
          passed: c3,
          reason: c3 ? "Proprietary innovation present" : "Requires demonstrable IP/proprietary tech",
        },
      ];

      const passCount = clauses.filter((c) => c.passed).length;
      const isEligible = passCount === clauses.length;
      const isNearFit = !isEligible && (c2 && c3);
      const score = Math.round((passCount / clauses.length) * 100);

      let whatIfFix = "";
      if (!c1) whatIfFix = "Set up your registered tech office in Bengaluru or Karnataka.";

      return { isEligible, isNearFit, score, clauseChecks: clauses, whatIfFix };
    },
  },
  {
    id: "standup-india",
    name: "Stand-Up India Scheme",
    agency: "Department of Financial Services",
    type: "Debt/Guarantee",
    maxGrantLakhs: 100,
    fundingType: "Convertible / Debt",
    summary: "Loans from ₹10 Lakhs up to ₹1 Crore for greenfield enterprises led by at least one woman or SC/ST entrepreneur.",
    check: (p) => {
      const isBeneficiary = p.isWomenLed || p.isScStLed;
      const c1 = isBeneficiary;
      const c2 = p.turnoverLakhs <= 5000;
      const c3 = p.entityType !== "proprietorship";

      const clauses = [
        {
          label: ">= 51% Women or SC/ST Equity Ownership",
          passed: c1,
          reason: c1 ? "Eligible majority shareholding verified" : "Requires >= 51% equity held by Woman or SC/ST founder",
        },
        {
          label: "Turnover <= ₹50 Crores",
          passed: c2,
          reason: c2 ? "Turnover verified" : "Exceeds upper limit",
        },
        {
          label: "Corporate / Formal Partnership Entity",
          passed: c3,
          reason: c3 ? "Entity structure verified" : "Requires registered Pvt Ltd, LLP, or partnership",
        },
      ];

      const passCount = clauses.filter((c) => c.passed).length;
      const isEligible = passCount === clauses.length;
      const isNearFit = !isEligible && (c2 && c3);
      const score = Math.round((passCount / clauses.length) * 100);

      let whatIfFix = "";
      if (!c1) whatIfFix = "Co-found with >= 51% women or SC/ST equity share to unlock up to ₹1 Cr loan guarantee.";

      return { isEligible, isNearFit, score, clauseChecks: clauses, whatIfFix };
    },
  },
  {
    id: "sidbi-ffs",
    name: "SIDBI Fund of Funds for Startups (FFS)",
    agency: "Small Industries Development Bank of India",
    type: "Central",
    maxGrantLakhs: 200,
    fundingType: "Equity Co-Investment",
    summary: "Venture capital backing through SEBI-registered Alternative Investment Funds (AIFs) catalyzed by SIDBI for high-growth startups.",
    check: (p) => {
      const c1 = p.dpiitStatus === "recognized";
      const c2 = p.ageMonths <= 120;
      const c3 = p.turnoverLakhs <= 10000;
      const c4 = p.entityType === "pvt_ltd";

      const clauses = [
        {
          label: "DPIIT Recognition Certificate",
          passed: c1,
          reason: c1 ? "DPIIT recognition active" : "Mandatory DPIIT recognition required",
        },
        {
          label: "Age <= 10 Years",
          passed: c2,
          reason: c2 ? "Age verified" : "Exceeds DPIIT definition of startup",
        },
        {
          label: "Turnover <= ₹100 Crores",
          passed: c3,
          reason: c3 ? "Turnover verified" : "Exceeds ₹100 Cr cap",
        },
        {
          label: "Private Limited Entity Structure",
          passed: c4,
          reason: c4 ? "Private limited structure verified" : "Equity VC investments require Pvt Ltd structure",
        },
      ];

      const passCount = clauses.filter((c) => c.passed).length;
      const isEligible = passCount === clauses.length;
      const isNearFit = !isEligible && passCount >= 2;
      const score = Math.round((passCount / clauses.length) * 100);

      let whatIfFix = "";
      if (!c4) whatIfFix = "Convert your LLP to a Private Limited Company for institutional VC co-investment.";

      return { isEligible, isNearFit, score, clauseChecks: clauses, whatIfFix };
    },
  },
  {
    id: "cgss-guarantee",
    name: "Credit Guarantee Scheme for Startups (CGSS)",
    agency: "NCGTC / DPIIT",
    type: "Debt/Guarantee",
    maxGrantLakhs: 500,
    fundingType: "Convertible / Debt",
    summary: "Collateral-free debt and venture debt guarantees up to ₹10 Crores for DPIIT-recognized startups with verifiable traction.",
    check: (p) => {
      const c1 = p.dpiitStatus === "recognized";
      const c2 = p.ageMonths >= 12 && p.ageMonths <= 120;
      const c3 = p.turnoverLakhs >= 10;

      const clauses = [
        {
          label: "DPIIT Recognition Certificate",
          passed: c1,
          reason: c1 ? "DPIIT recognized" : "Requires DPIIT certificate",
        },
        {
          label: "Operating Track Record (12+ Months)",
          passed: c2,
          reason: c2 ? `Age ${p.ageMonths} mo meets minimum operating criteria` : "Requires minimum 12 months active operations",
        },
        {
          label: "Demonstrated Commercial Revenue",
          passed: c3,
          reason: c3 ? `Annual turnover ₹${p.turnoverLakhs}L demonstrates commercial viability` : "Banks require minimum operational revenue for guarantee",
        },
      ];

      const passCount = clauses.filter((c) => c.passed).length;
      const isEligible = passCount === clauses.length;
      const isNearFit = !isEligible && passCount >= 1;
      const score = Math.round((passCount / clauses.length) * 100);

      let whatIfFix = "";
      if (!c3) whatIfFix = "Log initial client revenue to meet banking collateral-free guarantee limits.";

      return { isEligible, isNearFit, score, clauseChecks: clauses, whatIfFix };
    },
  },
];

// Presets for instant exploration
const PRESETS = [
  {
    name: "Early AI Prototype",
    desc: "14 mo, DeepTech, Bootstrapped",
    profile: {
      dpiitStatus: "recognized" as const,
      ageMonths: 14,
      turnoverLakhs: 15,
      sector: "DeepTech & AI",
      entityType: "pvt_ltd" as const,
      state: "Karnataka",
      isWomenLed: false,
      isScStLed: false,
      hasPatentOrIP: true,
      isTier2or3: false,
      priorFundingLakhs: 0,
    },
  },
  {
    name: "AgriTech in Tier-2 UP",
    desc: "24 mo, AgriTech, State grant eligible",
    profile: {
      dpiitStatus: "recognized" as const,
      ageMonths: 24,
      turnoverLakhs: 40,
      sector: "AgriTech & Rural Tech",
      entityType: "pvt_ltd" as const,
      state: "Uttar Pradesh",
      isWomenLed: false,
      isScStLed: false,
      hasPatentOrIP: false,
      isTier2or3: true,
      priorFundingLakhs: 10,
    },
  },
  {
    name: "Women-Led BioTech",
    desc: "36 mo, Patent filed, 51%+ Equity",
    profile: {
      dpiitStatus: "recognized" as const,
      ageMonths: 36,
      turnoverLakhs: 65,
      sector: "HealthTech & BioTech",
      entityType: "pvt_ltd" as const,
      state: "Maharashtra",
      isWomenLed: true,
      isScStLed: false,
      hasPatentOrIP: true,
      isTier2or3: false,
      priorFundingLakhs: 25,
    },
  },
  {
    name: "Scaling Enterprise SaaS",
    desc: "48 mo, ₹8 Cr Turnover, VC scale",
    profile: {
      dpiitStatus: "recognized" as const,
      ageMonths: 48,
      turnoverLakhs: 800,
      sector: "Enterprise SaaS",
      entityType: "pvt_ltd" as const,
      state: "Delhi NCR",
      isWomenLed: false,
      isScStLed: false,
      hasPatentOrIP: true,
      isTier2or3: false,
      priorFundingLakhs: 150,
    },
  },
];

const SECTORS = [
  "DeepTech & AI",
  "HealthTech & BioTech",
  "AgriTech & Rural Tech",
  "CleanTech & EV",
  "Enterprise SaaS",
  "FinTech & Payments",
  "EdTech & Upskilling",
  "Manufacturing & Hardware",
];

const STATES = [
  "Karnataka",
  "Uttar Pradesh",
  "Maharashtra",
  "Delhi NCR",
  "Tamil Nadu",
  "Telangana",
  "Gujarat",
  "Kerala",
  "Rajasthan",
  "Other Indian State",
];

export default function SimulatorPage() {
  const shouldReduceMotion = useReducedMotion();
  const [profile, setProfile] = useState<StartupProfile>(DEFAULT_PROFILE);
  const [activeTab, setActiveTab] = useState<"all" | "eligible" | "near" | "ineligible">("all");
  const [expandedScheme, setExpandedScheme] = useState<string | null>("sisfs");

  // Run real-time simulation on current profile
  const simulationResults = useMemo(() => {
    return SCHEMES_DATABASE.map((scheme) => {
      const evaluation = scheme.check(profile);
      return {
        ...scheme,
        evaluation,
      };
    });
  }, [profile]);

  const eligibleSchemes = simulationResults.filter((s) => s.evaluation.isEligible);
  const nearFitSchemes = simulationResults.filter((s) => s.evaluation.isNearFit);
  const ineligibleSchemes = simulationResults.filter((s) => !s.evaluation.isEligible && !s.evaluation.isNearFit);

  const displayedSchemes = useMemo(() => {
    switch (activeTab) {
      case "eligible":
        return eligibleSchemes;
      case "near":
        return nearFitSchemes;
      case "ineligible":
        return ineligibleSchemes;
      default:
        return simulationResults;
    }
  }, [activeTab, simulationResults, eligibleSchemes, nearFitSchemes, ineligibleSchemes]);

  // Overall match metrics
  const totalPotentialGrant = eligibleSchemes.reduce((acc, curr) => acc + curr.maxGrantLakhs, 0);
  const matchPercentage = Math.round((eligibleSchemes.length / simulationResults.length) * 100);

  const handlePresetSelect = (p: typeof PRESETS[0]) => {
    setProfile(p.profile);
    setActiveTab("all");
  };

  const handleReset = () => {
    setProfile(DEFAULT_PROFILE);
    setActiveTab("all");
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white font-default selection:bg-violet-500 selection:text-white flex flex-col justify-between relative overflow-x-hidden">
      {/* CardNav Header */}
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

      {/* Hero Section */}
      <section className="relative pt-36 pb-16 overflow-hidden">
        {/* Background glow and purple grid matching landing page */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-r from-violet-600/25 via-fuchsia-600/20 to-orange-600/20 blur-[130px] rounded-full mix-blend-screen" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(139,92,246,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.12) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/40 to-[#0A0A0A]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6"
          >
            <Sliders className="w-3.5 h-3.5 text-violet-400" />
            <span>Interactive What-If Simulation Engine</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial={shouldReduceMotion ? "show" : "hidden"}
            animate="show"
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight text-white mb-6 leading-tight"
          >
            Simulate Your Eligibility in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400">
              Real-Time.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial={shouldReduceMotion ? "show" : "hidden"}
            animate="show"
            custom={1}
            className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed mb-8"
          >
            Adjust your startup age, turnover, sector, and DPIIT credentials to see clause-by-clause evaluation and learn what variables unlock more government funding.
          </motion.p>

          {/* Preset Buttons */}
          <motion.div
            variants={fadeUp}
            initial={shouldReduceMotion ? "show" : "hidden"}
            animate="show"
            custom={2}
            className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto"
          >
            <span className="text-xs uppercase tracking-wider text-neutral-500 mr-1 flex items-center gap-1 font-semibold">
              <Zap className="w-3.5 h-3.5 text-violet-400" /> Presets:
            </span>
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-violet-500/30 text-xs font-medium text-neutral-300 hover:text-white transition-all shadow-sm"
              >
                {preset.name}
              </button>
            ))}
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
              title="Reset to default baseline"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </motion.div>
        </div>
      </section>

      {/* Main Interactive Simulator Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Interactive Parameter Controls (5 cols) */}
          <div className="lg:col-span-5 bg-[#121118]/85 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                <h2 className="text-lg font-display font-medium text-white">Startup Profile Variables</h2>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">Live Sync</span>
            </div>

            {/* 1. DPIIT Status */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2.5">
                DPIIT Recognition Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "recognized", label: "Recognized", icon: CheckCircle2 },
                  { value: "applied", label: "In Process", icon: FileCheck2 },
                  { value: "none", label: "Not Yet", icon: XCircle },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setProfile((prev) => ({ ...prev, dpiitStatus: item.value as any }))}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                      profile.dpiitStatus === item.value
                        ? "bg-violet-600/20 border-violet-500 text-white shadow-sm shadow-violet-500/20"
                        : "bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Company Age Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Company Age
                </label>
                <span className="text-sm font-semibold font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                  {profile.ageMonths} Months ({(profile.ageMonths / 12).toFixed(1)} yrs)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="120"
                value={profile.ageMonths}
                onChange={(e) => setProfile((prev) => ({ ...prev, ageMonths: parseInt(e.target.value) }))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                <span>1 mo</span>
                <span className="text-emerald-400 font-medium">24 mo (Seed Fund limit)</span>
                <span>60 mo (5 yrs)</span>
                <span>120 mo (DPIIT cap)</span>
              </div>
            </div>

            {/* 3. Annual Turnover */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-neutral-400" /> Annual Turnover
                </label>
                <span className="text-sm font-semibold font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                  {profile.turnoverLakhs >= 100
                    ? `₹${(profile.turnoverLakhs / 100).toFixed(1)} Cr`
                    : `₹${profile.turnoverLakhs} Lakhs`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={profile.turnoverLakhs}
                onChange={(e) => setProfile((prev) => ({ ...prev, turnoverLakhs: parseInt(e.target.value) }))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                <span>₹0</span>
                <span className="text-emerald-400 font-medium">₹50L (SISFS Cap)</span>
                <span>₹2 Cr</span>
                <span>₹10 Cr+</span>
              </div>
            </div>

            {/* 4. Sector Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Industry / Tech Vertical
              </label>
              <select
                value={profile.sector}
                onChange={(e) => setProfile((prev) => ({ ...prev, sector: e.target.value }))}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/25 transition-all cursor-pointer"
              >
                {SECTORS.map((sec) => (
                  <option key={sec} value={sec} className="bg-neutral-900 text-white">
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Entity Type */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Incorporation Structure
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "pvt_ltd", label: "Private Limited" },
                  { value: "llp", label: "LLP" },
                  { value: "partnership", label: "Reg. Partnership" },
                  { value: "proprietorship", label: "Proprietorship" },
                ].map((entity) => (
                  <button
                    key={entity.value}
                    type="button"
                    onClick={() => setProfile((prev) => ({ ...prev, entityType: entity.value as any }))}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      profile.entityType === entity.value
                        ? "bg-violet-600/20 border-violet-500 text-white shadow-sm shadow-violet-500/20"
                        : "bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    {entity.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. State Location */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Registered State HQ
              </label>
              <select
                value={profile.state}
                onChange={(e) => setProfile((prev) => ({ ...prev, state: e.target.value }))}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/25 transition-all cursor-pointer"
              >
                {STATES.map((st) => (
                  <option key={st} value={st} className="bg-neutral-900 text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Special Multiplier Toggles */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Founder Attributes & IP
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                <span className="text-xs text-neutral-300 font-medium">Women-Led (&gt;= 51% equity)</span>
                <input
                  type="checkbox"
                  checked={profile.isWomenLed}
                  onChange={(e) => setProfile((prev) => ({ ...prev, isWomenLed: e.target.checked }))}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-neutral-900 border-neutral-700 cursor-pointer accent-violet-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                <span className="text-xs text-neutral-300 font-medium">Patent / Proprietary IP Filed</span>
                <input
                  type="checkbox"
                  checked={profile.hasPatentOrIP}
                  onChange={(e) => setProfile((prev) => ({ ...prev, hasPatentOrIP: e.target.checked }))}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-neutral-900 border-neutral-700 cursor-pointer accent-violet-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                <span className="text-xs text-neutral-300 font-medium">SC / ST / OBC Leadership</span>
                <input
                  type="checkbox"
                  checked={profile.isScStLed}
                  onChange={(e) => setProfile((prev) => ({ ...prev, isScStLed: e.target.checked }))}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-neutral-900 border-neutral-700 cursor-pointer accent-violet-600"
                />
              </label>
            </div>
          </div>

          {/* RIGHT COLUMN: Real-Time Live Results & Schemes (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Score & Funding Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Score */}
              <div className="p-5 rounded-2xl bg-[#121118]/85 border border-white/10 backdrop-blur-md relative overflow-hidden">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                  Eligibility Match
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-bold text-white tracking-tight">
                    {matchPercentage}%
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">
                    {eligibleSchemes.length} of {simulationResults.length} Qualified
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${matchPercentage}%` }}
                  />
                </div>
              </div>

              {/* Card 2: Potential Grant Value */}
              <div className="p-5 rounded-2xl bg-[#121118]/85 border border-white/10 backdrop-blur-md relative overflow-hidden sm:col-span-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                  Total Grant & Funding Ceiling
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 tracking-tight">
                    {totalPotentialGrant >= 100
                      ? `₹${(totalPotentialGrant / 100).toFixed(2)} Crores`
                      : `₹${totalPotentialGrant} Lakhs`}
                  </span>
                  <span className="text-xs text-neutral-400">Non-dilutive / Subsidized</span>
                </div>
                <p className="text-xs text-neutral-400 mt-2 font-light">
                  Direct capital unlocked by your current parameter simulation.
                </p>
              </div>
            </div>

            {/* Smart "What-If" AI Insight Banner */}
            <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-500/25 flex items-start gap-3.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-xs leading-relaxed text-neutral-300">
                <span className="font-semibold text-white block mb-0.5">Simulation AI Intelligence:</span>
                {profile.dpiitStatus !== "recognized" ? (
                  <span>
                    Obtaining your official <strong>DPIIT Recognition certificate</strong> is the single highest-leverage move. It immediately unlocks ₹50 Lakhs in the Startup India Seed Fund.
                  </span>
                ) : profile.ageMonths > 24 ? (
                  <span>
                    Your incorporation age ({profile.ageMonths} mo) is beyond the 24-month SISFS cutoff. Shift focus toward <strong>MeitY TIDE 2.0 (up to ₹30L)</strong> and <strong>SIDBI Fund of Funds</strong> which support up to 7-10 years.
                  </span>
                ) : profile.isWomenLed ? (
                  <span>
                    With <strong>&gt;= 51% women ownership</strong> active, you qualify for enhanced sustenance allowances in state policies and exclusive <strong>Stand-Up India loan guarantees</strong> up to ₹1 Crore.
                  </span>
                ) : (
                  <span>
                    Optimal configuration detected for early-stage grants. You have passed all 5 strict criteria for the <strong>Startup India Seed Fund</strong>.
                  </span>
                )}
              </div>
            </div>

            {/* Tab Filter Navigation */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              {[
                { id: "all", label: "All Schemes", count: simulationResults.length },
                { id: "eligible", label: "Strong Fit", count: eligibleSchemes.length, badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                { id: "near", label: "Near Fit", count: nearFitSchemes.length, badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                { id: "ineligible", label: "Ineligible", count: ineligibleSchemes.length, badgeColor: "bg-neutral-800 text-neutral-400 border-white/10" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full border ${tab.badgeColor || "bg-white/10 text-white border-white/10"}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Scheme Cards Evaluation List */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {displayedSchemes.map((scheme) => {
                  const evalRes = scheme.evaluation;
                  const isExpanded = expandedScheme === scheme.id;

                  return (
                    <motion.div
                      key={scheme.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        evalRes.isEligible
                          ? "bg-[#14121a]/90 border-emerald-500/30 hover:border-emerald-500/50"
                          : evalRes.isNearFit
                          ? "bg-[#14121a]/90 border-amber-500/30 hover:border-amber-500/50"
                          : "bg-[#14121a]/50 border-white/5 opacity-75 hover:opacity-100"
                      }`}
                    >
                      {/* Card Header Header Bar */}
                      <div
                        onClick={() => setExpandedScheme(isExpanded ? null : scheme.id)}
                        className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                              {scheme.type}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] font-medium text-violet-300">
                              {scheme.fundingType}
                            </span>
                            {evalRes.isEligible ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Fully Eligible
                              </span>
                            ) : evalRes.isNearFit ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> 1 Condition Away
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Not Eligible
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-display font-medium text-white">
                            {scheme.name}
                          </h3>
                          <p className="text-xs text-neutral-400 line-clamp-1">{scheme.summary}</p>
                        </div>

                        {/* Grant Amount & Toggle Button */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          <div className="text-left sm:text-right">
                            <span className="text-lg font-display font-bold text-white tracking-tight">
                              Up to ₹{scheme.maxGrantLakhs}L
                            </span>
                            <span className="block text-[10px] text-neutral-500 uppercase tracking-wider">
                              Max Allocation
                            </span>
                          </div>
                          <span className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1">
                            {isExpanded ? "Hide Details" : "View Clauses"}
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                          </span>
                        </div>
                      </div>

                      {/* Expanded Clause Details */}
                      {isExpanded && (
                        <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-white/5 bg-black/30 space-y-4">
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
                              Clause-By-Clause Eligibility Verification
                            </span>
                            <div className="space-y-2">
                              {evalRes.clauseChecks.map((clause, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                                    clause.passed
                                      ? "bg-emerald-950/15 border-emerald-500/20 text-emerald-200"
                                      : "bg-red-950/15 border-red-500/20 text-red-200"
                                  }`}
                                >
                                  {clause.passed ? (
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                  )}
                                  <div className="flex-1 text-xs">
                                    <div className="font-medium text-white">{clause.label}</div>
                                    <p className="text-[11px] text-neutral-400 mt-0.5">{clause.reason}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* "What-If" Fix Recommendation */}
                          {evalRes.whatIfFix && (
                            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div className="text-xs">
                                <span className="font-semibold text-amber-300 block mb-0.5">What-If Recommendation:</span>
                                <span className="text-neutral-300">{evalRes.whatIfFix}</span>
                              </div>
                            </div>
                          )}

                          {/* Action Links */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <span className="text-xs text-neutral-500 font-mono">
                              Administered by: {scheme.agency}
                            </span>
                            <div className="flex items-center gap-2">
                              <Link
                                href="/dashboard"
                                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                              >
                                <span>Apply via Copilot</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Bottom Callout to Dashboard */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-display font-medium text-white mb-1">
                  Ready to draft your application?
                </h4>
                <p className="text-xs text-neutral-400">
                  Our AI Copilot generates your cover letters and verifies required DPIIT documents in minutes.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-white text-black hover:bg-neutral-100 rounded-xl text-sm font-medium transition-all shadow-lg hover:scale-105 active:scale-95 shrink-0 flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* Footer matching landing page */}
      <Footer />
    </div>
  );
}
