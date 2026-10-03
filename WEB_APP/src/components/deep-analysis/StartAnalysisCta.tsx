"use client";

import { ArrowRight, Bookmark, CheckCircle2, ShieldCheck, Sparkles, Scale, FileText } from "lucide-react";

interface StartAnalysisCtaProps {
  onRunAnalysis: () => void;
  onSaveDraft: () => void;
  isLoading?: boolean;
}

export function StartAnalysisCta({
  onRunAnalysis,
  onSaveDraft,
  isLoading = false,
}: StartAnalysisCtaProps) {
  const metrics = [
    { label: "Schemes in Scope", value: "12 Schemes", icon: Scale },
    { label: "Available Evidence", value: "5 Documents (31 pgs)", icon: FileText },
    { label: "Geographic Regions", value: "Central & UP State", icon: ShieldCheck },
    { label: "Eligibility Dimensions", value: "6 Statutory Rules", icon: CheckCircle2 },
  ];

  return (
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white border border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden">
      
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        
        {/* Top Scope Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 pb-5 border-b border-neutral-800">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1">
                  <Icon className="w-3.5 h-3.5 text-violet-400" />
                  <span>{m.label}</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-neutral-100">
                  {m.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Ready for Evidence-Backed AI Investigation</span>
            </h4>
            <p className="text-xs text-neutral-400">
              SchemeSense will execute a clause-by-clause audit across verified legal documents, 
              gazette notifications, and state portal requirements.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto shrink-0">
            <button
              onClick={onSaveDraft}
              type="button"
              className="flex-1 sm:flex-initial px-4 py-2.5 text-xs sm:text-sm font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Bookmark className="w-4 h-4 text-neutral-400" />
              <span>Save as Draft</span>
            </button>

            <button
              onClick={onRunAnalysis}
              disabled={isLoading}
              type="button"
              className="flex-1 sm:flex-initial px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-violet-900/40 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{isLoading ? "Investigating..." : "Run Deep Analysis"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
