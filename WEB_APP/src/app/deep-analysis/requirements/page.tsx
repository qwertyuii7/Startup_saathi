"use client";

import React, { useState } from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, ListChecks, ShieldCheck, ShieldAlert, CircleSlash2 } from "lucide-react";

export default function RequirementsIntelligencePage() {
  const { analysis, isLoading, error } = useWorkspaceAnalysis();
  const [filter, setFilter] = useState("ALL");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Requirement Matrix...</span>
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

  const allCriteria = analysis.findings.flatMap(f => f.criteriaBreakdown.map(c => ({...c, schemeName: f.schemeName})));
  const satisfiedCount = allCriteria.filter(c => c.status === 'SATISFIED').length;
  const missingCount = allCriteria.filter(c => c.status === 'VERIFICATION_REQUIRED').length;
  const failedCount = allCriteria.filter(c => c.status === 'NOT_SATISFIED').length;

  const displayItems = filter === "ALL" ? allCriteria : allCriteria.filter(c => c.status === filter);

  return (
    <div className="space-y-8 pb-24 h-full">
      <AnalysisPageHeader 
        title="Requirement Intelligence" 
        description="Every individual condition required across all matches, and exactly how your startup measures up."
        status={analysis.status}
        updatedAt={analysis.updatedAt}
      />

      <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-xl inline-flex overflow-x-auto max-w-full">
        {[
          { id: "ALL", label: `All Requirements (${allCriteria.length})` },
          { id: "SATISFIED", label: `Satisfied (${satisfiedCount})` },
          { id: "VERIFICATION_REQUIRED", label: `Missing (${missingCount})` },
          { id: "NOT_SATISFIED", label: `Not Satisfied (${failedCount})` },
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              filter === t.id ? "bg-white text-violet-700 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-12 bg-neutral-50/50 border-b border-neutral-200">
            <div className="col-span-3 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Requirement</div>
            <div className="col-span-2 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Target Scheme</div>
            <div className="col-span-3 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Required Condition</div>
            <div className="col-span-2 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Startup State</div>
            <div className="col-span-2 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</div>
          </div>
          
          <div className="divide-y divide-neutral-100">
            {displayItems.length === 0 ? (
               <div className="p-12 text-center text-neutral-500 text-sm">No requirements found.</div>
            ) : (
               displayItems.map((c, i) => (
                 <div key={i} className="grid grid-cols-12 hover:bg-neutral-50 transition-colors group cursor-pointer items-start">
                   <div className="col-span-3 p-4">
                     <p className="text-sm font-bold text-neutral-900 leading-tight mb-2">{c.requirement}</p>
                     <div className="text-[10px] text-neutral-400 bg-neutral-100 px-2 py-1 rounded inline-flex font-mono truncate max-w-full">
                       ID: {c.requirementId}
                     </div>
                   </div>
                   <div className="col-span-2 p-4">
                     <span className="text-xs font-medium text-neutral-600 truncate">{c.schemeName}</span>
                   </div>
                   <div className="col-span-3 p-4">
                     <p className="text-xs text-neutral-700 leading-relaxed">{c.sourceCitation?.clause || "Standard Condition"}</p>
                     {c.sourceCitation?.url && (
                        <a href={c.sourceCitation.url} target="_blank" rel="noreferrer" className="text-[10px] text-violet-600 hover:underline mt-1 inline-block">
                          View Source ↗
                        </a>
                     )}
                   </div>
                   <div className="col-span-2 p-4">
                     <p className="text-xs font-bold text-neutral-900 mb-1">{c.statusLabel}</p>
                     {c.evidenceDocumentName ? (
                       <span className="text-[10px] text-emerald-600 font-medium">Supported by Evidence</span>
                     ) : (
                       <span className="text-[10px] text-amber-600 font-medium">No Evidence</span>
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
                     <button className="opacity-0 group-hover:opacity-100 text-xs font-bold text-violet-600">Trace</button>
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
