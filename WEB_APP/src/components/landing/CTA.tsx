"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PixelCard from "./PixelCard";

export function CTA() {
  return (
    <div className="relative w-full overflow-hidden">
      <PixelCard
        variant="default"
        className="w-full flex flex-col justify-between bg-[#0A0A0A]"
        gap={12}
        speed={45}
        colors="#a78bfa,#e879f9,#fb923c,#c084fc,#f472b6"
      >
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-6 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-white font-display mb-6 leading-tight"
          >
            Ready to claim your unfair advantage?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-neutral-300 mb-8 max-w-2xl font-light leading-relaxed"
          >
            Join hundreds of Indian startups successfully navigating government grants, schemes, and incubator matching with AI precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-medium text-lg hover:bg-neutral-100 transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              Get Started for Free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-sm text-neutral-400 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            No credit card required. Free forever for basic use.
          </motion.p>
        </div>

        {/* Integrated Footer */}
        <div className="relative z-20 w-full border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4 md:py-5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
              <div className="flex items-center gap-2 tracking-tight text-white">
                <span className="font-serif italic font-light text-2xl pr-0.5">SS</span>
                <span className="font-medium text-lg">Startup Saathi</span>
              </div>
              <p className="text-sm text-neutral-500 font-light">
                &copy; 2026 Codeblitz 2.0 (IceCube Team). All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </PixelCard>
    </div>
  );
}
