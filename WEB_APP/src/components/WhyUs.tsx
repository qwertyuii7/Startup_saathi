"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Layers, GitCompare, Wand2 } from "lucide-react";

const differentiators = [
  {
    icon: Brain,
    title: "Hybrid RAG + Rule Engine",
    description:
      "Unlike generic chatbots, we combine AI's contextual understanding with deterministic rule-based eligibility checks — giving you answers you can trust.",
    highlight: "No hallucinations. Ever.",
    iconBg: "bg-gradient-to-br from-brand-500 to-brand-700",
  },
  {
    icon: GitCompare,
    title: "Policy Change Detection",
    description:
      "We actively monitor scheme guidelines for changes and instantly alert startups that may be affected. Stay compliant without constant manual checking.",
    highlight: "Real-time policy tracking.",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  {
    icon: Layers,
    title: "Multi-Agent Architecture",
    description:
      "Separate specialized AI agents handle scheme search, document analysis, eligibility checks, and applications — working together for accuracy.",
    highlight: "Purpose-built AI agents.",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
  {
    icon: Wand2,
    title: "Eligibility Simulator",
    description:
      "Tweak your startup details in real-time and instantly see how changes affect your eligibility across all schemes. Plan your path to qualification.",
    highlight: "What-if scenario planning.",
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
  },
];

export default function WhyUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="why-us" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface-secondary to-white" />

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
              Why Startup Saathi
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-content-primary">
            Not just another{" "}
            <span className="gradient-text">AI chatbot</span>
          </h2>
          <p className="mt-5 text-lg text-content-secondary max-w-2xl mx-auto">
            We built something fundamentally different — an evidence-first
            intelligence system that treats government policy as structured data,
            not just text to summarize.
          </p>
        </motion.div>

        {/* Differentiator cards */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {differentiators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative rounded-2xl border border-border-default bg-white p-7 sm:p-8 transition-all duration-300 hover:shadow-xl hover:border-brand-200/60 hover:-translate-y-0.5"
            >
              {/* Gradient glow on hover */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-brand-100/0 to-brand-200/0 group-hover:from-brand-100/40 group-hover:to-brand-200/20 transition-all duration-500" />

              <div className="relative">
                <div className="flex items-start gap-5">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-110`}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-display font-semibold text-content-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-content-secondary mb-3">
                      {item.description}
                    </p>
                    <p className="text-sm font-semibold text-brand-600">
                      {item.highlight}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
