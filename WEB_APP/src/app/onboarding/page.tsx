"use client";
import { useState } from "react";
import { UploadCloud, CheckCircle2, ArrowRight, FileText, Loader2, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleUpload = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      setStep(2);
    }, 2000); // simulate extraction
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-neutral-900 selection:bg-violet-200">
      <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-[2rem] p-8 md:p-12 shadow-xl relative overflow-hidden min-h-[500px] flex flex-col">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-neutral-100">
          <div 
            className="h-full bg-violet-600 transition-all duration-700" 
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        <div className="text-center mb-10 mt-4 shrink-0">
          <span className="font-serif italic font-light text-3xl text-violet-600 mb-4 block">SS</span>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-neutral-900 mb-2">
            {step === 1 ? "Build your Startup Profile" : "Verify Extracted Data"}
          </h2>
          <p className="text-neutral-500">
            {step === 1 ? "Upload your DPIIT certificate or Pitch Deck." : "Here is what we found. Make corrections if needed."}
          </p>
        </div>

        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4 absolute inset-0"
              >
                {!isExtracting ? (
                  <>
                    <button 
                      onClick={handleUpload}
                      className="w-full group bg-white border-2 border-dashed border-violet-200 hover:border-violet-600 rounded-2xl p-8 flex flex-col items-center gap-4 transition-all hover:bg-violet-50"
                    >
                      <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium text-neutral-900 text-lg group-hover:text-violet-700 transition-colors">Click to upload or drag & drop</h3>
                        <p className="text-sm text-neutral-500 mt-1">PDF, DOCX up to 10MB</p>
                      </div>
                    </button>

                    <div className="flex items-center gap-4 my-6 opacity-60">
                      <div className="flex-1 h-px bg-neutral-300" />
                      <span className="text-xs uppercase font-semibold text-neutral-500">OR</span>
                      <div className="flex-1 h-px bg-neutral-300" />
                    </div>

                    <button 
                      onClick={() => setStep(2)}
                      className="w-full bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-sm text-left"
                    >
                      <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-900 text-lg">Use a Sample Startup</h3>
                        <p className="text-sm text-neutral-500">Explore the dashboard with dummy data.</p>
                      </div>
                    </button>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
                    <p className="font-medium text-neutral-900 animate-pulse">Extracting DPIIT Data...</p>
                    <p className="text-sm text-neutral-500">Scanning for sector, stage, and financials.</p>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute inset-0 flex flex-col"
              >
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-6">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Company Name</label>
                      <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-neutral-400" />
                        <span className="font-medium">TechNova AI Pvt Ltd</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Incorporation Age</label>
                      <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 font-medium">
                        14 Months
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Primary Sector</label>
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 font-medium">
                      Artificial Intelligence / DeepTech
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Revenue / Turnover</label>
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 font-medium flex justify-between">
                      <span>₹50 Lakhs</span>
                      <button className="text-xs text-violet-600 font-medium">Edit</button>
                    </div>
                  </div>

                </div>
                
                <button 
                  onClick={handleFinish}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shrink-0 shadow-md"
                >
                  Confirm & Generate Dashboard <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
