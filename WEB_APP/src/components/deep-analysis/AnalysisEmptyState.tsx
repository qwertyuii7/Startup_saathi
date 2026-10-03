"use client";

import { Sparkles, Plus, Upload, Building2, FileQuestion } from "lucide-react";

interface AnalysisEmptyStateProps {
  type?: "no_analysis" | "no_documents" | "no_incubators";
  onAction: () => void;
}

export function AnalysisEmptyState({
  type = "no_analysis",
  onAction,
}: AnalysisEmptyStateProps) {
  if (type === "no_documents") {
    return (
      <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-neutral-900 mb-1">
          No evidence uploaded
        </h3>
        <p className="text-xs text-neutral-500 mb-5 leading-relaxed">
          Upload your startup documents (DPIIT certificate, MCA incorporation, GST returns) to improve analysis accuracy and unlock high-value schemes.
        </p>
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Documents</span>
        </button>
      </div>
    );
  }

  if (type === "no_incubators") {
    return (
      <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-neutral-900 mb-1">
          No matching incubators found
        </h3>
        <p className="text-xs text-neutral-500 mb-4">
          Try expanding your geographic parameters or sector classification in the configuration card.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 shadow-2xs">
      <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto mb-3">
        <Sparkles className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-neutral-900 mb-1">
        Start your first Deep Analysis
      </h3>
      <p className="text-xs text-neutral-500 mb-5 leading-relaxed">
        No analysis has been run yet. Run a clause-by-clause audit across central and state government schemes to uncover funding opportunities backed by proof.
      </p>
      <button
        onClick={onAction}
        className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>+ New Analysis</span>
      </button>
    </div>
  );
}
