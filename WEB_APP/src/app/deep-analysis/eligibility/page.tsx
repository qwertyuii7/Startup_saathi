"use client";

import React, { useState } from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, ShieldCheck, ShieldAlert, CircleSlash2 } from "lucide-react";

export default function EligibilityIntelligencePage() {
  const { analysis, isLoading, error } = useWorkspaceAnalysis();
  const [filter, setFilter] = useState("ALL");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Eligibility Command Center...</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Analysis Unavailable</h2>
        <p className="text-sm text-neutral-500">Please start a new Deep Analysis.</p>
      </div>
    );
  }

  // Flatten all criteria across all schemes
  const allCriteria = analysis.findings.flatMap(f => 
    f.criteriaBreakdown.map(c => ({
      ...c,
      schemeName: f.schemeName
    }))
  );

  const filteredCriteria = filter === "ALL" 
    ? allCriteria 
    : allCriteria.filter(c => c.status === filter);

  const satisfiedCount = allCriteria.filter(c => c.status === 'SATISFIED').length;
  const missingCount = allCriteria.filter(c => c.status === 'VERIFICATION_REQUIRED').length;
  const failedCount = allCriteria.filter(c => c.status === 'NOT_SATISFIED').length;

  return (
    <div className="space-y-8 pb-24">
      <AnalysisPageHeader 
        title="Eligibility Analysis" 
        description="Comprehensive matrix of all evaluated requirements across all matched schemes."
        status={analysis.status}
        updatedAt={analysis.updatedAt}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-xl inline-flex overflow-x-auto max-w-full">
        {[
          { id: "ALL", label: `All (${allCriteria.length})`, icon: CircleSlash2 },
          { id: "SATISFIED", label: `Satisfied (${satisfiedCount})`, icon: ShieldCheck },
          { id: "VERIFICATION_REQUIRED", label: `Verification Needed (${missingCount})`, icon: ShieldAlert },
          { id: "NOT_SATISFIED", label: `Failed (${failedCount})`, icon: CircleSlash2 }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              filter === t.id ? "bg-white text-violet-700 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Matrix Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-12 bg-neutral-50/50 border-b border-neutral-200">
            <div className="col-span-3 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Requirement</div>
            <div className="col-span-2 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Scheme</div>
            <div className="col-span-3 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Required State</div>
            <div className="col-span-2 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Evidence</div>
            <div className="col-span-2 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</div>
          </div>
          
          <div className="divide-y divide-neutral-100">
            {filteredCriteria.length === 0 ? (
               <div className="p-12 text-center text-neutral-500 text-sm">No criteria match this filter.</div>
            ) : (
               filteredCriteria.map((c, i) => (
                 <div key={i} className="grid grid-cols-12 hover:bg-neutral-50 transition-colors group cursor-pointer">
                   <div className="col-span-3 p-4">
                     <p className="text-sm font-bold text-neutral-900 leading-tight">{c.requirement}</p>
                   </div>
                   <div className="col-span-2 p-4 flex items-center">
                     <span className="text-xs font-medium text-neutral-600 truncate bg-neutral-100 px-2 py-1 rounded">{c.schemeName}</span>
                   </div>
                   <div className="col-span-3 p-4">
                     <p className="text-sm text-neutral-700 leading-relaxed">{c.sourceCitation?.clause || "Standard policy"}</p>
                   </div>
                   <div className="col-span-2 p-4">
                     {c.evidenceDocumentName ? (
                       <div className="text-xs font-bold text-violet-600 truncate max-w-full">
                         📄 {c.evidenceDocumentName}
                         {c.evidencePage && <span className="text-neutral-400 ml-1">(p.{c.evidencePage})</span>}
                       </div>
                     ) : (
                       <span className="text-xs font-medium text-neutral-400">Not Found</span>
                     )}
                   </div>
                   <div className="col-span-2 p-4 flex items-center justify-between">
                     <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'SATISFIED' ? 'bg-emerald-100 text-emerald-700' :
                        c.status === 'VERIFICATION_REQUIRED' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {c.status.replace("_", " ")}
                     </span>
                     <button className="opacity-0 group-hover:opacity-100 text-xs font-bold text-violet-600">Details</button>
                   </div>
                 </div>
               ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
