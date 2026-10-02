"use client";

import { motion } from "framer-motion";
import Stepper, { Step } from "./Stepper";

export function HowItWorks() {
  return (
    <div className="pt-32 pb-32 bg-neutral-50 relative overflow-hidden border-b border-neutral-200">
      
      {/* Structural layout lines */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-0 bottom-0 left-1/2 md:left-24 lg:left-32 w-px bg-neutral-200" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Text */}
          <div className="max-w-md">
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-4xl md:text-5xl font-medium tracking-tight text-neutral-900 font-display leading-[1.1] mb-6"
             >
               How the process works
             </motion.h2>
             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="text-lg text-neutral-600 leading-relaxed"
             >
               From document upload to application submission in four simple steps. Our orchestration layer handles the bureaucracy so you can focus on building your product.
             </motion.p>
          </div>

          {/* Right Column: Stepper */}
          <div className="w-full">
            <Stepper
              initialStep={1}
              onFinalStepCompleted={() => console.log("All steps completed!")}
              backButtonText="Previous"
              nextButtonText="Next"
              disableStepIndicators={false}
            >
              <Step>
                 <span className="text-violet-600 font-bold mb-3 uppercase tracking-wider text-xs">Step 1</span>
                 <h3 className="text-2xl font-medium text-neutral-900 mb-3">Build Your Profile</h3>
                 <p className="text-neutral-500 leading-relaxed">
                   Upload your DPIIT certificate or Pitch Deck. Our Document Intelligence extracts your exact startup stage, sector, and financials automatically.
                 </p>
              </Step>
              <Step>
                 <span className="text-fuchsia-600 font-bold mb-3 uppercase tracking-wider text-xs">Step 2</span>
                 <h3 className="text-2xl font-medium text-neutral-900 mb-3">Intelligent Matchmaking</h3>
                 <p className="text-neutral-500 leading-relaxed">
                   Our Hybrid RAG engine instantly maps your profile against 500+ Central and State government schemes to find the perfect fit.
                 </p>
              </Step>
              <Step>
                 <span className="text-orange-600 font-bold mb-3 uppercase tracking-wider text-xs">Step 3</span>
                 <h3 className="text-2xl font-medium text-neutral-900 mb-3">Evidence-First Verification</h3>
                 <p className="text-neutral-500 leading-relaxed">
                   We don't hallucinate. Every eligibility decision is strictly linked to an official government clause, showing you exactly why you qualify.
                 </p>
              </Step>
              <Step>
                 <span className="text-amber-600 font-bold mb-3 uppercase tracking-wider text-xs">Step 4</span>
                 <h3 className="text-2xl font-medium text-neutral-900 mb-3">Application Copilot</h3>
                 <p className="text-neutral-500 leading-relaxed">
                   Generate complete application drafts, cover letters, and required checklists. Move seamlessly from discovery to actual submission.
                 </p>
              </Step>
            </Stepper>
          </div>

        </div>
      </div>
    </div>
  );
}
