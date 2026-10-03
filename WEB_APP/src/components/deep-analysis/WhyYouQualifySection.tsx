"use client";

import { CheckCircle2, FileText, Sparkles } from "lucide-react";
import { EligibilityCriterion } from "@/types/deep-analysis";

interface WhyYouQualifySectionProps {
  schemeName: string;
  factors: string[];
  criteria: EligibilityCriterion[];
  onViewEvidence: (criterion: EligibilityCriterion) => void;
}

export function WhyYouQualifySection({
  schemeName,
  factors,
  criteria,
  onViewEvidence,
}: WhyYouQualifySectionProps) {
  return (
    <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <h4 className="font-bold text-neutral-900 text-sm sm:text-base">
          Why SchemeSense thinks you qualify for {schemeName}
        </h4>
      </div>

      {/* Structured Reasoning Blocks */}
      <div className="space-y-3 mb-4">
        {factors.map((factor, idx) => {
          const matchedCriterion = criteria[idx] || criteria[0];

          return (
            <div 
              key={idx}
              className="bg-white border border-emerald-100 rounded-xl p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-neutral-900 leading-snug">
                    {factor}
                  </p>
                  {matchedCriterion?.evidence && (
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1">
                      <FileText className="w-3 h-3 text-neutral-400" />
                      <span>Evidence: {matchedCriterion.evidence.documentName} — Page {matchedCriterion.evidence.pageNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {matchedCriterion && (
                <button
                  type="button"
                  onClick={() => onViewEvidence(matchedCriterion)}
                  className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors shrink-0 self-end sm:self-auto border border-emerald-200/60"
                >
                  View Evidence
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Grounding Disclaimer */}
      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 italic pt-1">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>AI interpretation based strictly on verified statutory and corporate evidence listed above.</span>
      </div>

    </div>
  );
}
