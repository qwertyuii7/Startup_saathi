"use client";

import { AlertOctagon, RefreshCw, Eye } from "lucide-react";

interface AnalysisErrorStateProps {
  onRetry: () => void;
  onViewPartial: () => void;
}

export function AnalysisErrorState({
  onRetry,
  onViewPartial,
}: AnalysisErrorStateProps) {
  return (
    <div className="bg-white border border-rose-200 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-200">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-1">
        Analysis couldn&apos;t be completed
      </h3>
      <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
        Some government portal sources could not be verified due to temporary state server downtime. You can retry the full scan or inspect the verified central schemes.
      </p>
      
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Analysis</span>
        </button>

        <button
          onClick={onViewPartial}
          className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Partial Results</span>
        </button>
      </div>
    </div>
  );
}
