"use client";

import { CheckCircle2, AlertTriangle, Sparkles, ArrowRight, FileCheck, Layers } from "lucide-react";

interface ApplicationReadinessCardProps {
  onDraftApplication: () => void;
  onCompletePack: () => void;
}

export function ApplicationReadinessCard({
  onDraftApplication,
  onCompletePack,
}: ApplicationReadinessCardProps) {
  const readinessPercent = 72;

  const checklistItems = [
    { label: "Company MCA Profile", ready: true },
    { label: "DPIIT Certificate of Recognition", ready: true },
    { label: "Certificate of Incorporation", ready: true },
    { label: "Founder Identification & Shareholding", ready: true },
    { label: "Audited Financial Statements (FY25)", ready: false, warning: "Draft uploaded" },
    { label: "Investor / Scheme Pitch Deck", ready: false, warning: "Required for IMB" },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-7 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-neutral-900 text-lg tracking-tight">
              Application Readiness Score
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Dossier completeness across all central & state portal submission requirements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-neutral-900 font-mono">
            {readinessPercent}%
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
            High Readiness
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          style={{ width: `${readinessPercent}%` }}
        />
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {checklistItems.map((item, idx) => (
          <div 
            key={idx}
            className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs ${
              item.ready 
                ? "bg-neutral-50/70 border-neutral-200/80 text-neutral-800" 
                : "bg-amber-50/50 border-amber-200/80 text-amber-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {item.ready ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="font-medium">{item.label}</span>
            </div>

            {item.warning && (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded shrink-0">
                {item.warning}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-neutral-100">
        <button
          onClick={onCompletePack}
          className="text-xs sm:text-sm font-semibold text-neutral-800 hover:text-neutral-950 flex items-center gap-1.5 transition-colors"
        >
          <span>Complete Application Pack</span>
          <ArrowRight className="w-4 h-4 text-neutral-400" />
        </button>

        <button
          onClick={onDraftApplication}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm shadow-violet-200 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Draft Application with AI</span>
        </button>
      </div>

    </div>
  );
}
