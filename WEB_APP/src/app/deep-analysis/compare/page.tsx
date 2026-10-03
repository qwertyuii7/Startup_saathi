"use client";

import React, { useState } from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, ArrowRightLeft, Target, FileSearch } from "lucide-react";

export default function ComparePage() {
  const { analysis, isLoading, error } = useWorkspaceAnalysis();
  const [compareType, setCompareType] = useState("startup_vs_scheme");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Comparison Workspace...</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Analysis Unavailable</h2>
        <p className="text-sm text-neutral-500">Please start a new Deep Analysis to compare schemas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <AnalysisPageHeader 
        title="Comparison Workspace" 
        description="Compare your startup's current state against scheme requirements, or compare two schemes side-by-side to determine best fit."
        status={analysis.status}
        updatedAt={analysis.updatedAt}
      />

      {/* Comparison Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-xl inline-flex overflow-x-auto max-w-full">
        {[
          { id: "startup_vs_scheme", label: "Startup vs Scheme", icon: Target },
          { id: "scheme_vs_scheme", label: "Scheme vs Scheme", icon: ArrowRightLeft },
          { id: "document_vs_req", label: "Document vs Requirement", icon: FileSearch }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setCompareType(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              compareType === t.id ? "bg-white text-violet-700 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Comparison Area */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Table Header */}
          <div className="grid grid-cols-12 border-b border-neutral-200 bg-neutral-50/50">
            <div className="col-span-3 p-4 border-r border-neutral-200">
               <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Dimension</div>
            </div>
            <div className="col-span-4 p-4 border-r border-neutral-200 bg-violet-50/30">
               <div className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Target Entity</div>
               <div className="text-sm font-bold text-neutral-900 truncate">
                 {analysis.findings[0]?.schemeName || "Select Scheme"}
               </div>
            </div>
            <div className="col-span-5 p-4 bg-emerald-50/30">
               <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Current State</div>
               <div className="text-sm font-bold text-neutral-900 truncate">Your Startup Profile & Evidence</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-neutral-100">
            {analysis.findings[0]?.criteriaBreakdown.map((req, i) => (
              <div key={i} className="grid grid-cols-12 group hover:bg-neutral-50 transition-colors cursor-pointer">
                {/* Dimension */}
                <div className="col-span-3 p-4 border-r border-neutral-200">
                  <div className="text-sm font-bold text-neutral-900 leading-tight">{req.requirement}</div>
                </div>
                
                {/* Target / Required */}
                <div className="col-span-4 p-4 border-r border-neutral-200">
                   <div className="text-sm text-neutral-700 leading-relaxed">
                     {req.sourceCitation?.clause || "Standard requirement matching guidelines."}
                   </div>
                </div>

                {/* Startup Current State */}
                <div className="col-span-5 p-4 flex flex-col justify-center">
                   <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-neutral-900 mb-1">
                          {req.statusLabel}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Evidence: {req.evidenceDocumentName ? <span className="text-violet-600 font-medium">{req.evidenceDocumentName}</span> : "Not Found"}
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'SATISFIED' ? 'bg-emerald-100 text-emerald-700' :
                          req.status === 'VERIFICATION_REQUIRED' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {req.status.replace("_", " ")}
                        </span>
                      </div>
                   </div>
                </div>
              </div>
            ))}
            {(!analysis.findings[0] || analysis.findings[0].criteriaBreakdown.length === 0) && (
              <div className="p-12 text-center text-neutral-500 text-sm">
                No comparison data available for this analysis.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
