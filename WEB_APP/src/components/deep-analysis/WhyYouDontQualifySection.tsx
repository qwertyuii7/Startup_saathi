"use client";

import { AlertTriangle, ArrowRight, Upload, PlusCircle } from "lucide-react";

interface BlockingFactor {
  issue: string;
  required: string;
  current: string;
  impact: string;
  resolutionAction: string;
}

interface WhyYouDontQualifySectionProps {
  blockingFactors: BlockingFactor[];
  onResolveAction: (action: string) => void;
}

export function WhyYouDontQualifySection({
  blockingFactors,
  onResolveAction,
}: WhyYouDontQualifySectionProps) {
  return (
    <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
        </div>
        <div>
          <h4 className="font-bold text-neutral-900 text-sm sm:text-base">
            What&apos;s blocking eligibility?
          </h4>
          <p className="text-xs text-neutral-500">
            Address these specific conditions to convert this scheme into a qualified match.
          </p>
        </div>
      </div>

      {/* Blocking Cards */}
      <div className="space-y-3">
        {blockingFactors.map((factor, idx) => (
          <div 
            key={idx}
            className="bg-white border border-amber-200/80 rounded-xl p-4 shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <h5 className="font-bold text-neutral-900 text-xs sm:text-sm">
                    {factor.issue}
                  </h5>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2.5">
                  <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                      Statutory Requirement
                    </span>
                    <span className="text-neutral-800 font-medium">{factor.required}</span>
                  </div>
                  <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/50">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block mb-0.5">
                      Current Entity State
                    </span>
                    <span className="text-amber-900 font-medium">{factor.current}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 bg-neutral-50/70 p-2.5 rounded-lg border border-neutral-100">
                  <strong className="text-neutral-800">Impact: </strong>
                  {factor.impact}
                </p>
              </div>

              {/* Action Button */}
              <div className="shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onResolveAction(factor.resolutionAction)}
                  className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Resolve Requirement</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
