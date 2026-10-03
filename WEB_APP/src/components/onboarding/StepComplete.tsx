"use client";

import React from "react";
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface StepCompleteProps {
  startupName?: string;
  onGoToDashboard: () => void;
}

export function StepComplete({ startupName = "Your Startup", onGoToDashboard }: StepCompleteProps) {
  return (
    <div className="text-center py-6 sm:py-8 space-y-6">
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
          You're all set.
        </h2>
        <p className="text-base font-semibold text-violet-700">
          {startupName} profile is ready.
        </p>
        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed pt-1">
          SchemeSense will now use your startup profile and indexed legal documents to identify relevant government schemes, evaluate DPIIT criteria, and explain your eligibility with supporting evidence.
        </p>
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto pt-2">
        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-left">
          <div className="text-xs font-bold text-neutral-800">500+ Schemes</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Central & State gazettes</div>
        </div>
        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-left">
          <div className="text-xs font-bold text-neutral-800">RAG Citations</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Page-verified evidence</div>
        </div>
        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-left">
          <div className="text-xs font-bold text-neutral-800">Action Plans</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Step-by-step unlock</div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-4">
        <button
          type="button"
          onClick={onGoToDashboard}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
        >
          <span>Go to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
