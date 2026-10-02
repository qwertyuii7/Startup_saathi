"use client";

import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, PenLine, Building2, ChevronRight, Check } from "lucide-react";
import { useState } from "react";
import { AISearchBar } from "./AISearchBar";

const features = [
  {
    icon: Sparkles,
    title: "AI Scheme Discovery",
    description: "Our proprietary AI engine scans 500+ government databases to instantly identify schemes you qualify for.",
    iconClassName: "text-violet-600 bg-white border border-neutral-200 shadow-sm",
  },
  {
    icon: CheckCircle2,
    title: "Verified Eligibility",
    description: "Rule-based engine checks your DPIIT profile against strict guidelines.",
    iconClassName: "text-emerald-600 bg-white border border-neutral-200 shadow-sm",
  },
  {
    icon: PenLine,
    title: "Application Copilot",
    description: "Generate complete application drafts, cover letters, and required checklists.",
    iconClassName: "text-fuchsia-600 bg-white border border-neutral-200 shadow-sm",
  },
  {
    icon: Building2,
    title: "Incubator Matching",
    description: "Find the perfect incubator or accelerator based on your sector, stage, and geography.",
    iconClassName: "text-neutral-300 bg-neutral-900 border border-neutral-800 shadow-sm",
    dark: true,
  },
];

export function Features() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="pt-28 pb-16 bg-neutral-50 relative overflow-hidden border-b border-neutral-200">
      
      {/* Structural layout lines */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-0 bottom-0 left-1/2 md:left-24 lg:left-32 w-px bg-neutral-200/60" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">

        {/* Top Centered Content */}
        <div className="text-center max-w-4xl mx-auto w-full mb-16 lg:mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-medium tracking-tight text-neutral-900 font-display mb-6"
            >
              An unfair advantage for your startup
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-neutral-600 mb-12 max-w-2xl mx-auto"
            >
              We've automated the entire government funding lifecycle so you can focus on building your product.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl mx-auto"
            >
              <AISearchBar />
            </motion.div>
        </div>

        {/* Bottom Split Layout: Features + Phone */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
          
          {/* Left Column: Clean Vertical Feature List */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="space-y-3">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  onHoverStart={() => setActiveFeature(idx)}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * idx }}
                  className={`flex items-start gap-5 p-5 rounded-2xl cursor-default transition-all duration-300
                    ${activeFeature === idx ? 'bg-white shadow-sm ring-1 ring-neutral-200/60 scale-[1.02]' : 'hover:bg-neutral-100/50 scale-100'}`}
                >
                  <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-300 ${feature.iconClassName} ${activeFeature === idx ? 'scale-110 shadow-md' : ''}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-neutral-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Standalone Interactive Phone Mockup */}
          <div className="lg:col-span-5 hidden lg:flex justify-end pr-4">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative w-[280px] h-[520px] bg-black rounded-[3rem] border-[10px] border-neutral-900 shadow-2xl overflow-hidden flex flex-col shrink-0"
            >
               {/* Phone Notch */}
               <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
                  <div className="w-28 h-6 bg-neutral-900 rounded-b-2xl" />
               </div>

               {/* Phone Screen Background */}
               <div className="flex-1 bg-neutral-50 pt-12 pb-16 overflow-hidden relative flex flex-col">
                  
                  {/* Dynamic Header based on active feature */}
                  <div className="px-6 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="font-serif italic font-light text-2xl text-neutral-900 pr-0.5">SS</span>
                       <div className="font-semibold text-neutral-800 text-sm">
                          {activeFeature === 0 ? "Discover Schemes" : 
                           activeFeature === 1 ? "Eligibility Report" : 
                           activeFeature === 2 ? "Copilot Drafts" : "Incubators"}
                       </div>
                    </div>
                  </div>

                  {/* Dynamic Content Area based on Hovered Bento */}
                  <div className="flex-1 px-4 relative">
                     {/* Screen 1: Discovery */}
                     <motion.div 
                        initial={false}
                        animate={{ opacity: activeFeature === 0 ? 1 : 0, x: activeFeature === 0 ? 0 : -20 }}
                        className="absolute inset-0 px-4 space-y-4 pointer-events-none"
                     >
                        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
                           <div className="h-3 w-3/4 bg-violet-100 rounded-full mb-3" />
                           <div className="h-2 w-full bg-neutral-100 rounded-full mb-2" />
                           <div className="h-2 w-5/6 bg-neutral-100 rounded-full mb-4" />
                           <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
                             <div className="px-3 py-1 bg-emerald-100 rounded-full text-[10px] flex items-center text-emerald-700 font-medium">98% Match</div>
                             <div className="w-6 h-6 rounded-full bg-neutral-50 flex items-center justify-center"><ChevronRight className="w-3 h-3 text-neutral-400" /></div>
                           </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
                           <div className="h-3 w-1/2 bg-violet-100 rounded-full mb-3" />
                           <div className="h-2 w-full bg-neutral-100 rounded-full mb-2" />
                           <div className="h-2 w-4/6 bg-neutral-100 rounded-full mb-4" />
                           <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
                             <div className="px-3 py-1 bg-emerald-100 rounded-full text-[10px] flex items-center text-emerald-700 font-medium">85% Match</div>
                             <div className="w-6 h-6 rounded-full bg-neutral-50 flex items-center justify-center"><ChevronRight className="w-3 h-3 text-neutral-400" /></div>
                           </div>
                        </div>
                     </motion.div>

                     {/* Screen 2: Eligibility */}
                     <motion.div 
                        initial={false}
                        animate={{ opacity: activeFeature === 1 ? 1 : 0, x: activeFeature === 1 ? 0 : 20 }}
                        className="absolute inset-0 px-4 space-y-4 pointer-events-none"
                     >
                        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm text-center">
                           <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-500 mx-auto flex items-center justify-center mb-4">
                              <Check className="w-8 h-8" />
                           </div>
                           <div className="h-3 w-3/4 bg-neutral-200 rounded-full mx-auto mb-2" />
                           <div className="h-2 w-1/2 bg-neutral-100 rounded-full mx-auto" />
                        </div>
                        <div className="space-y-2">
                           <div className="h-10 w-full bg-emerald-50 rounded-lg border border-emerald-100 flex items-center px-3 gap-2">
                              <Check className="w-4 h-4 text-emerald-500" />
                              <div className="h-2 w-1/2 bg-emerald-200 rounded-full" />
                           </div>
                           <div className="h-10 w-full bg-emerald-50 rounded-lg border border-emerald-100 flex items-center px-3 gap-2">
                              <Check className="w-4 h-4 text-emerald-500" />
                              <div className="h-2 w-2/3 bg-emerald-200 rounded-full" />
                           </div>
                        </div>
                     </motion.div>
                     
                     {/* Screen 3 & 4 can be similarly styled placeholders */}
                     <motion.div 
                        initial={false}
                        animate={{ opacity: (activeFeature === 2 || activeFeature === 3) ? 1 : 0, x: (activeFeature >= 2) ? 0 : 20 }}
                        className="absolute inset-0 px-4 space-y-3 pointer-events-none"
                     >
                        <div className="bg-neutral-900 rounded-2xl p-4 shadow-xl">
                           <div className="h-2 w-1/3 bg-neutral-700 rounded-full mb-4" />
                           <div className="space-y-2">
                             <div className="h-2 w-full bg-neutral-800 rounded-full" />
                             <div className="h-2 w-full bg-neutral-800 rounded-full" />
                             <div className="h-2 w-4/5 bg-neutral-800 rounded-full" />
                             <div className="h-2 w-5/6 bg-neutral-800 rounded-full" />
                           </div>
                           <div className="mt-6 h-8 w-full bg-violet-600 rounded-lg" />
                        </div>
                     </motion.div>
                  </div>

                  {/* Floating Bottom Nav */}
                  <div className="absolute bottom-5 inset-x-5 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-200 flex items-center justify-around px-2 z-50">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeFeature === 0 ? 'bg-neutral-100 text-violet-600' : 'text-neutral-400'}`}>
                       <Sparkles className="w-5 h-5" />
                     </div>
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeFeature === 1 ? 'bg-neutral-100 text-emerald-600' : 'text-neutral-400'}`}>
                       <CheckCircle2 className="w-5 h-5" />
                     </div>
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeFeature === 2 ? 'bg-neutral-100 text-fuchsia-600' : 'text-neutral-400'}`}>
                       <PenLine className="w-5 h-5" />
                     </div>
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeFeature === 3 ? 'bg-neutral-900 text-white' : 'text-neutral-400'}`}>
                       <Building2 className="w-5 h-5" />
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
