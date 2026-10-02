"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { label: "Hours of manual research saved per startup", value: "40+" },
  { label: "Increase in successful applications", value: "3x" },
  { label: "Government schemes covered", value: "500+" },
  { label: "Accuracy in eligibility verification", value: "100%" },
];

export default function Impact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="impact" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-brand-950" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(108,79,255,0.15)_0%,transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6">
              Empowering founders to build, not paperwork.
            </h2>
            <p className="text-lg text-brand-100/80 mb-8 max-w-xl">
              Our mission is to democratize access to government support for 
              Indian startups. Whether you are in Tier 1 or Tier 3 cities, 
              Startup Saathi levels the playing field.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3 bg-brand-900/50 rounded-xl p-4 border border-brand-700/50">
                <div className="w-10 h-10 rounded-full bg-brand-600/30 flex items-center justify-center text-xl">🇮🇳</div>
                <div>
                  <p className="text-sm font-semibold text-white">Central & State</p>
                  <p className="text-xs text-brand-200/60">Pan-India coverage</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-brand-900/50 rounded-xl p-4 border border-brand-700/50">
                <div className="w-10 h-10 rounded-full bg-emerald-600/30 flex items-center justify-center text-xl">🌱</div>
                <div>
                  <p className="text-sm font-semibold text-white">All Stages</p>
                  <p className="text-xs text-brand-200/60">Idea to Growth phase</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="bg-brand-900/40 backdrop-blur-sm border border-brand-700/30 rounded-2xl p-6 hover:bg-brand-800/40 transition-colors"
              >
                <div className="text-4xl font-display font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-brand-200/70">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
