"use client";

import { motion } from "framer-motion";
import { Server, Network, ShieldCheck, Database, BrainCircuit, ArrowRight } from "lucide-react";
import InteractiveGridBackground from "@/components/lightswind/interactive-grid-background";

export function MCPFeature() {
  return (
    <div className="bg-[#0A0A0A] relative z-20">
      <div className="pt-32 pb-24 bg-white relative overflow-hidden rounded-b-[3rem] lg:rounded-b-[5rem]">
      
      {/* Extremely subtle structural layout lines for the whole section */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-0 bottom-0 left-1/2 md:left-24 lg:left-32 w-px bg-neutral-100" />
         <div className="absolute top-32 left-0 right-0 h-px bg-neutral-100" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Main Blog-style Panel Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-white rounded-[2rem] border border-neutral-200 shadow-xl overflow-hidden group"
        >
          {/* Interactive Lightswind Grid inside the panel */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[2rem]">
            <InteractiveGridBackground 
               className="w-full h-full"
               gridColor="#f1f5f9"
               darkGridColor="#f1f5f9"
               effectColor="rgba(0, 0, 0, 0.04)"
               darkEffectColor="rgba(0, 0, 0, 0.04)"
               glow={false}
               showFade={false}
            />
          </div>

          {/* Subtle Hover Gradient */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/20 via-transparent to-orange-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />

          <div className="p-8 lg:p-16 relative z-10">
            {/* Editorial Header */}
            <div className="mb-16 max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-violet-600" />
                <span className="text-sm font-semibold tracking-wide uppercase text-violet-600">Architecture Spotlight</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-neutral-900 font-display leading-[1.1]">
                Powered by the Model Context Protocol.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start relative z-10">
              
              {/* Left Column: Blog-style Article */}
              <div className="prose prose-lg prose-neutral">
                <p className="text-xl text-neutral-600 leading-relaxed font-medium mb-6">
                  Generic AI models hallucinate. Startup Saathi is built on the <strong className="text-neutral-900 font-semibold">Model Context Protocol (MCP)</strong>—plugging directly into live, deterministic government databases instead of stale training data.
                </p>
                <p className="text-neutral-500 leading-relaxed mb-8">
                  We deploy a highly-specialized <strong className="text-neutral-900 font-semibold">Multi-Agent Workflow</strong>: one agent securely extracts your DPIIT profile, another queries a live Qdrant Vector DB of 500+ schemes, and a deterministic rule-engine validates your eligibility line-by-line.
                </p>
                
                <div className="mt-8 p-6 bg-neutral-50/80 backdrop-blur-sm border border-neutral-200/60 rounded-2xl relative shadow-sm group-hover:border-violet-200 transition-colors duration-500">
                  <div className="absolute -left-3 top-6 w-1 h-12 bg-violet-500 rounded-r-lg group-hover:shadow-[0_0_12px_rgba(139,92,246,0.5)] transition-shadow duration-500" />
                  <p className="text-neutral-800 font-medium italic mb-0">
                    "It’s not just a chatbot. It’s a secure orchestration layer that guarantees evidence-first verification."
                  </p>
                </div>
              </div>

              {/* Right Column: Technical Diagram / Visual */}
              <div className="relative h-full flex flex-col justify-center">
                <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50 p-8 shadow-lg relative overflow-hidden group-hover:shadow-2xl transition-shadow duration-700">
                   {/* Background Grid inside diagram */}
                   <div className="absolute inset-0 bg-[url('https://assets.dub.co/misc/grid.svg')] opacity-[0.03] pointer-events-none" />
                   
                   <div className="relative z-10 flex flex-col gap-6">
                      
                      {/* The Orchestrator */}
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center justify-between cursor-default"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shadow-inner">
                               <BrainCircuit className="w-6 h-6" />
                            </div>
                            <div>
                               <h4 className="font-semibold text-neutral-900">LLM Orchestrator</h4>
                               <p className="text-sm text-neutral-500">Reasoning & Delegation</p>
                            </div>
                         </div>
                      </motion.div>

                      {/* Connecting Lines (Simulated via borders) */}
                      <div className="flex justify-center -my-3 relative z-0">
                         <div className="w-px h-8 bg-neutral-300" />
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-neutral-100 uppercase shadow-md">
                            MCP Layer
                         </div>
                      </div>

                      {/* The Servers / Tools */}
                      <div className="grid grid-cols-2 gap-4">
                         <motion.div whileHover={{ y: -2 }} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-default">
                            <Database className="w-5 h-5 text-emerald-500 mb-3" />
                            <h4 className="font-semibold text-sm text-neutral-900 mb-1">Live Qdrant DB</h4>
                            <p className="text-xs text-neutral-500">500+ Vectorized Schemes</p>
                         </motion.div>
                         <motion.div whileHover={{ y: -2 }} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-default">
                            <ShieldCheck className="w-5 h-5 text-fuchsia-500 mb-3" />
                            <h4 className="font-semibold text-sm text-neutral-900 mb-1">Rule Engine</h4>
                            <p className="text-xs text-neutral-500">Deterministic Verification</p>
                         </motion.div>
                         <motion.div whileHover={{ y: -2 }} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-default">
                            <Network className="w-5 h-5 text-orange-500 mb-3" />
                            <h4 className="font-semibold text-sm text-neutral-900 mb-1">State APIs</h4>
                            <p className="text-xs text-neutral-500">Real-time Policy Fetch</p>
                         </motion.div>
                         <motion.div whileHover={{ scale: 1.05 }} className="bg-neutral-900 text-white border border-neutral-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-center items-center group/btn cursor-pointer">
                            <span className="text-xs font-semibold text-neutral-300 mb-1 group-hover/btn:text-white transition-colors">View Architecture</span>
                            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover/btn:text-white transition-all group-hover/btn:translate-x-1" />
                         </motion.div>
                      </div>

                   </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
