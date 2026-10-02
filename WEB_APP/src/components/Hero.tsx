"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, FileSearch } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-200/30 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-400/15 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-100/20 blur-[140px]" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-40" />
        
        {/* Radial fade */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,white_70%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-200/60 bg-brand-50/50 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-medium text-brand-700">
                AI-Powered Scheme Intelligence
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]"
          >
            <span className="text-content-primary">Know exactly </span>
            <span className="gradient-text">why you qualify</span>
            <br />
            <span className="text-content-primary">not just what exists</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 text-lg sm:text-xl leading-relaxed text-content-secondary max-w-2xl mx-auto"
          >
            Startup Saathi is your AI co-pilot that discovers government schemes, 
            verifies your eligibility with{" "}
            <span className="text-brand-600 font-medium">official source evidence</span>, 
            and builds your application — so you can focus on building your product.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="#"
              className="group relative inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 transition-all duration-300 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
            >
              Check Your Eligibility
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-content-primary rounded-xl border border-border-default bg-white/80 backdrop-blur-sm hover:bg-surface-secondary transition-all duration-200 shadow-sm hover:shadow-md"
            >
              See How It Works
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
          >
            {[
              { icon: Shield, text: "Evidence-backed decisions" },
              { icon: FileSearch, text: "500+ schemes covered" },
              { icon: Sparkles, text: "Hindi & Hinglish support" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-content-tertiary">
                <item.icon className="w-4 h-4 text-brand-400" />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero visual — Floating dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative mx-auto max-w-5xl"
        >
          {/* Glow behind card */}
          <div className="absolute -inset-4 bg-gradient-to-r from-brand-300/20 via-brand-500/10 to-accent-400/20 rounded-3xl blur-2xl" />
          
          <div className="relative rounded-2xl border border-border-default bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-surface-secondary/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-300/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-300/80" />
                <div className="w-3 h-3 rounded-full bg-green-300/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-surface-tertiary border border-border-subtle text-xs text-content-tertiary font-mono">
                  app.startupsaathi.in/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard mockup content */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Scheme match card */}
                <div className="md:col-span-2 rounded-xl border border-border-default p-5 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-content-primary">Startup India Seed Fund</h4>
                      <p className="text-xs text-content-tertiary">Ministry of Commerce & Industry</p>
                    </div>
                    <div className="ml-auto px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-xs font-medium text-green-700">
                      92% Match
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: "DPIIT Recognition", status: true },
                      { label: "Incorporation < 2 years", status: true },
                      { label: "Revenue < ₹25 Cr", status: true },
                      { label: "Incubator Support Letter", status: false },
                    ].map((req) => (
                      <div key={req.label} className="flex items-center gap-2.5 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          req.status 
                            ? "bg-green-100 text-green-600" 
                            : "bg-amber-100 text-amber-600"
                        }`}>
                          {req.status ? "✓" : "!"}
                        </div>
                        <span className={req.status ? "text-content-secondary" : "text-amber-700 font-medium"}>
                          {req.label}
                        </span>
                        {!req.status && (
                          <span className="ml-auto text-xs text-brand-500 font-medium cursor-pointer hover:underline">
                            Fix this →
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats sidebar */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-border-default p-5 bg-white">
                    <p className="text-xs font-medium text-content-tertiary uppercase tracking-wider">Schemes Found</p>
                    <p className="mt-1 text-3xl font-display font-bold text-brand-600">24</p>
                    <p className="text-xs text-content-tertiary mt-1">across 8 ministries</p>
                  </div>
                  <div className="rounded-xl border border-border-default p-5 bg-white">
                    <p className="text-xs font-medium text-content-tertiary uppercase tracking-wider">Eligible For</p>
                    <p className="mt-1 text-3xl font-display font-bold text-success-500">17</p>
                    <p className="text-xs text-content-tertiary mt-1">application-ready</p>
                  </div>
                  <div className="rounded-xl border border-border-default p-5 bg-gradient-to-br from-brand-50 to-brand-100/50">
                    <p className="text-xs font-medium text-brand-700 uppercase tracking-wider">Potential Funding</p>
                    <p className="mt-1 text-2xl font-display font-bold text-brand-700">₹2.4 Cr</p>
                    <p className="text-xs text-brand-500 mt-1">combined value</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
