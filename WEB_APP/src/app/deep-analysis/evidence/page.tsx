"use client";

import React, { useState } from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, FileCheck, CheckCircle2, ShieldAlert, FileSearch } from "lucide-react";

export default function EvidenceIntelligencePage() {
  const { analysis, isLoading, error } = useWorkspaceAnalysis();
  const [filter, setFilter] = useState("ALL");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Evidence Workspace...</span>
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
  
  const extractedEvidence = allCriteria.filter(c => c.evidenceDocumentName);
  const missingEvidence = allCriteria.filter(c => !c.evidenceDocumentName && c.status !== 'SATISFIED');

  const displayItems = filter === "ALL" ? allCriteria : filter === "EXTRACTED" ? extractedEvidence : missingEvidence;

  return (
    <div className="space-y-8 pb-24 h-full">
      <AnalysisPageHeader 
        title="Evidence Intelligence" 
        description="Verify how AROVA maps your exact document snippets to strict government requirements."
        status={analysis.status}
        updatedAt={analysis.updatedAt}
      />

      <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-xl inline-flex overflow-x-auto max-w-full">
        {[
          { id: "ALL", label: `All Requirements (${allCriteria.length})` },
          { id: "EXTRACTED", label: `Verified Evidence (${extractedEvidence.length})` },
          { id: "MISSING", label: `Missing Evidence (${missingEvidence.length})` },
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
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-12 bg-neutral-50/50 border-b border-neutral-200">
            <div className="col-span-3 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Requirement</div>
            <div className="col-span-3 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Target Scheme</div>
            <div className="col-span-4 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Mapped Evidence</div>
            <div className="col-span-2 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Validation</div>
          </div>
          
          <div className="divide-y divide-neutral-100">
            {displayItems.length === 0 ? (
               <div className="p-12 text-center text-neutral-500 text-sm">No evidence data for this filter.</div>
            ) : (
               displayItems.map((c, i) => (
                 <div key={i} className="grid grid-cols-12 hover:bg-neutral-50 transition-colors group cursor-pointer items-center">
                   <div className="col-span-3 p-4">
                     <p className="text-sm font-bold text-neutral-900 leading-tight">{c.requirement}</p>
                   </div>
                   <div className="col-span-3 p-4">
                     <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-1 rounded inline-block">{c.schemeName}</span>
                   </div>
                   <div className="col-span-4 p-4">
                     {c.evidenceDocumentName ? (
                       <div>
                         <div className="text-xs font-bold text-violet-600 mb-1 flex items-center gap-1">
                           <FileSearch className="w-3 h-3" /> {c.evidenceDocumentName} 
                           {c.evidencePage && <span className="text-neutral-400 font-medium">p.{c.evidencePage}</span>}
                         </div>
                         {c.evidenceSnippet && (
                           <div className="text-[11px] text-neutral-500 italic bg-neutral-50 p-2 rounded border border-neutral-100 line-clamp-2">
                             "{c.evidenceSnippet}"
                           </div>
                         )}
                       </div>
                     ) : (
                       <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                         <ShieldAlert className="w-3.5 h-3.5" /> Missing mapped evidence
                       </div>
                     )}
                   </div>
                   <div className="col-span-2 p-4 flex items-center justify-between">
                     {c.evidenceDocumentName ? (
                       <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 flex items-center gap-1">
                         <CheckCircle2 className="w-3 h-3" /> Verified
                       </span>
                     ) : (
                       <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-500">
                         Unverified
                       </span>
                     )}
                     <button className="opacity-0 group-hover:opacity-100 text-xs font-bold text-violet-600">Trace Source</button>
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
