"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight, FileText, CheckCircle2, IndianRupee } from "lucide-react";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-[#0A0A0A] min-h-[100vh] flex flex-col items-center justify-center pt-24 pb-32">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-violet-600/30 via-fuchsia-600/30 to-orange-600/30 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute inset-0 bg-[url('https://assets.dub.co/misc/grid.svg')] opacity-[0.03] invert" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center">


        <motion.h1 
          className="mt-8 text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white max-w-4xl font-display"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          Government funding, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400">
            demystified.
          </span>
        </motion.h1>

        <motion.p 
          className="mt-6 text-base md:text-lg text-neutral-400 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          Stop navigating labyrinthine PDFs. Our AI agents instantly match your startup profile against 500+ government schemes, verify eligibility, and help you apply.
        </motion.p>

        <motion.div 
          className="mt-10 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <Link href="/dashboard" className="h-12 px-8 rounded-xl bg-white text-black flex items-center justify-center font-medium hover:scale-105 transition-transform duration-200">
            Start finding schemes
          </Link>
          <Link href="/demo" className="h-12 px-8 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center font-medium hover:bg-white/20 transition-colors">
            Book a demo
          </Link>
        </motion.div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          className="mt-20 w-full max-w-5xl relative"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
          <div className="relative rounded-2xl border border-white/10 bg-[#111] overflow-hidden shadow-2xl z-10 p-2">
            <div className="rounded-xl border border-white/5 bg-[#1A1A1A] overflow-hidden flex">
              {/* Sidebar Mock */}
              <div className="w-64 border-r border-white/5 p-4 hidden md:block">
                <div className="flex items-center gap-2 mb-8">
                  <span className="font-serif italic font-light text-2xl text-white pr-0.5">SS</span>
                  <span className="text-white font-medium text-sm">Startup Saathi</span>
                </div>
                <div className="space-y-2">
                  <div className="h-8 rounded bg-white/10 w-full" />
                  <div className="h-8 rounded bg-white/5 w-4/5" />
                  <div className="h-8 rounded bg-white/5 w-5/6" />
                </div>
              </div>
              {/* Main Content Mock */}
              <div className="flex-1 p-6 lg:p-10">
                <div className="h-6 w-48 bg-white/20 rounded mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                   <div className="h-32 rounded-xl border border-white/5 bg-white/5 p-4 flex flex-col justify-between">
                     <FileText className="w-5 h-5 text-violet-400" />
                     <div>
                       <div className="text-2xl font-medium text-white mb-1">14</div>
                       <div className="text-xs text-neutral-400">Eligible Schemes</div>
                     </div>
                   </div>
                   <div className="h-32 rounded-xl border border-white/5 bg-white/5 p-4 flex flex-col justify-between">
                     <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                     <div>
                       <div className="text-2xl font-medium text-white mb-1">3</div>
                       <div className="text-xs text-neutral-400">Applications Ready</div>
                     </div>
                   </div>
                   <div className="h-32 rounded-xl border border-white/5 bg-white/5 p-4 flex flex-col justify-between">
                     <IndianRupee className="w-5 h-5 text-orange-400" />
                     <div>
                       <div className="text-2xl font-medium text-white mb-1">₹50L</div>
                       <div className="text-xs text-neutral-400">Potential Funding</div>
                     </div>
                   </div>
                </div>
                <div className="h-64 rounded-xl border border-white/5 bg-white/5" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
