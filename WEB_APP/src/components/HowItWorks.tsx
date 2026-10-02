"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Upload, Search, CheckCircle, FileOutput } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Profile",
    description:
      "Share your DPIIT certificate, incorporation docs, or simply answer a few questions. Our AI builds your startup profile automatically.",
    color: "from-violet-500 to-brand-600",
    lightColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  {
    number: "02",
    icon: Search,
    title: "Discover Schemes",
    description:
      "Our multi-agent AI scans 500+ Central and State government schemes and finds every opportunity you're eligible for.",
    color: "from-brand-500 to-blue-600",
    lightColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Verify Eligibility",
    description:
      "Get a detailed eligibility breakdown — every qualification backed by the exact official clause number from government documents.",
    color: "from-emerald-500 to-green-600",
    lightColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    number: "04",
    icon: FileOutput,
    title: "Apply With Confidence",
    description:
      "Generate checklists, draft applications, and get matched with incubators. Go from discovery to submission in minutes.",
    color: "from-amber-500 to-orange-600",
    lightColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-white" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-200/60 bg-brand-50/50 mb-6">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
              How It Works
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-content-primary">
            From confusion to{" "}
            <span className="gradient-text">clarity in 4 steps</span>
          </h2>
          <p className="mt-5 text-lg text-content-secondary max-w-2xl mx-auto">
            Stop wasting hours searching across scattered portals. Let our AI
            agent do the heavy lifting while you focus on building.
          </p>
        </motion.div>

        {/* Steps */}
        <div ref={ref} className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-default to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative"
              >
                <div
                  className={`relative rounded-2xl border ${step.borderColor} bg-white p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                >
                  {/* Step number */}
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} text-white text-sm font-display font-bold mb-5 shadow-md transition-transform duration-200 group-hover:scale-110`}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg ${step.lightColor} flex items-center justify-center mb-4`}
                  >
                    <step.icon className="w-5 h-5 text-content-secondary" />
                  </div>

                  <h3 className="text-lg font-display font-semibold text-content-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-content-secondary">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 items-center justify-center">
                    <div className="w-2 h-2 rotate-45 border-t-2 border-r-2 border-brand-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
