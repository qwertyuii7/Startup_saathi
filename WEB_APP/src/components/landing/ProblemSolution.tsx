"use client";

import { motion } from "framer-motion";
import StatusMark from "./StatusMark";

const comparisonPoints = [
  {
    capability: "Scheme Discovery",
    oldWay: { status: "error" as const, label: "Manual search on 50+ portals" },
    saathi: { status: "done" as const, label: "Instant Hybrid RAG Matching" },
  },
  {
    capability: "Eligibility Verification",
    oldWay: { status: "error" as const, label: "Guesswork & confusing PDFs" },
    saathi: { status: "done" as const, label: "Deterministic Rule Engine" },
  },
  {
    capability: "Accuracy",
    oldWay: { status: "error" as const, label: "Generic AI Hallucinations" },
    saathi: { status: "done" as const, label: "100% Verified Citations" },
  },
  {
    capability: "Application Drafts",
    oldWay: { status: "error" as const, label: "Drafting manually (40+ hours)", strike: true },
    saathi: { status: "done" as const, label: "AI Copilot Generation" },
  },
  {
    capability: "Incubator Matching",
    oldWay: { status: "error" as const, label: "Cold emails & scattered lists" },
    saathi: { status: "done" as const, label: "Intelligent Sector Matching" },
  },
  {
    capability: "Updates & Tracking",
    oldWay: { status: "error" as const, label: "Missing crucial deadlines" },
    saathi: { status: "done" as const, label: "Automated Policy Alerts" },
  },
  {
    capability: "Compliance",
    oldWay: { status: "error" as const, label: "High risk of rejection" },
    saathi: { status: "done" as const, label: "Evidence-first validation" },
  }
];

export function ProblemSolution() {
  return (
    <div className="pt-32 pb-24 bg-white relative overflow-hidden border-b border-neutral-200">
      
      {/* Structural layout lines */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-0 bottom-0 left-1/2 md:left-24 lg:left-32 w-px bg-neutral-100" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-medium tracking-tight text-neutral-900 font-display sm:text-4xl"
          >
            Why generic AI isn't enough
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-base text-neutral-600"
          >
            When it comes to government funding, hallucinations cost you money. We built a system you can actually trust.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-neutral-100 bg-neutral-50 px-6 py-4 md:px-8 gap-4 md:gap-8">
            <div className="font-semibold text-neutral-500 uppercase tracking-wider text-xs md:text-sm hidden md:block mt-2">Capability</div>
            <div className="font-semibold text-neutral-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-neutral-200/60 flex items-center justify-center text-neutral-500 text-xs">1</span>
              The Old Way
            </div>
            <div className="font-semibold text-blue-600 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">2</span>
              Startup Saathi
            </div>
          </div>

          {/* Table Body */}
          {comparisonPoints.map((point, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + (idx * 0.15), duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 border-b last:border-b-0 border-neutral-100 px-6 py-3.5 md:px-8 gap-3 md:gap-8 items-center hover:bg-neutral-50/50 transition-colors"
            >
              <div className="text-neutral-500 font-medium text-sm md:text-base">{point.capability}</div>
              <div>
                <StatusMark 
                  status={point.oldWay.status} 
                  label={point.oldWay.label} 
                  strike={point.oldWay.strike}
                  strikeDelay={1000 + (idx * 150)}
                />
              </div>
              <div>
                <StatusMark 
                  status={point.saathi.status} 
                  label={point.saathi.label} 
                  delay={0.2 + (idx * 0.15)} // Stagger the checkmarks one by one!
                />
              </div>
            </motion.div>
          ))}

        </motion.div>

      </div>
    </div>
  );
}
