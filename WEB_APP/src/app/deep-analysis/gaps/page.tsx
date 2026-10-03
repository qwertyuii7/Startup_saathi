"use client";

import React, { useState } from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, AlertOctagon, ArrowRight, ShieldAlert, FileMinus } from "lucide-react";
import Link from "next/link";

export default function StartupGapMapPage() {
  const { analysis, isLoading, error } = useWorkspaceAnalysis();
  const [filter, setFilter] = useState("ALL");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Startup Gap Map...</span>
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

  const allGaps = analysis.findings.flatMap(f => 
    f.blockingFactors.map(b => ({
      ...b,
      schemeName: f.schemeName,
      schemeId: f.schemeId,
      category: b.issue.toLowerCase().includes("document") || b.issue.toLowerCase().includes("certificate") ? "DOCUMENTATION" : "ELIGIBILITY"
    }))
  );

  const filteredGaps = filter === "ALL" ? allGaps : allGaps.filter(g => g.category === filter);

  return (
    <div className="space-y-8 pb-24 h-full">
      <AnalysisPageHeader 
        title="Startup Gap Map" 
        description="A precise view of the blocking factors currently preventing your startup from being fully eligible for evaluated schemes."
        status={analysis.status}
        updatedAt={analysis.updatedAt}
      />

      <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-xl inline-flex overflow-x-auto max-w-full">
        {[
          { id: "ALL", label: `All Gaps (${allGaps.length})` },
          { id: "DOCUMENTATION", label: `Documentation (${allGaps.filter(g => g.category === "DOCUMENTATION").length})` },
          { id: "ELIGIBILITY", label: `Eligibility (${allGaps.filter(g => g.category === "ELIGIBILITY").length})` },
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

      <div className="grid grid-cols-1 gap-4">
        {filteredGaps.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-emerald-300 rounded-2xl bg-emerald-50">
            <h3 className="text-lg font-bold text-emerald-900 mb-1">No Gaps Found</h3>
            <p className="text-sm text-emerald-700">Your startup currently has no blocking gaps for the evaluated schemes.</p>
          </div>
        ) : (
          filteredGaps.map((gap, i) => (
            <div key={i} className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm hover:border-red-300 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 flex items-center gap-1">
                      {gap.category === "DOCUMENTATION" ? <FileMinus className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {gap.category}
                    </span>
                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 truncate max-w-[200px]">
                      {gap.schemeName}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-neutral-900 mb-2 leading-tight">{gap.issue}</h3>
                  <p className="text-sm text-neutral-600 mb-6">{gap.impact}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Required State</div>
                      <div className="text-sm font-medium text-neutral-900">{gap.required}</div>
                    </div>
                    <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                      <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Current State</div>
                      <div className="text-sm font-medium text-red-900">{gap.current}</div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-64 shrink-0 flex flex-col justify-between">
                  <div className="p-5 bg-violet-50 rounded-xl border border-violet-100 h-full flex flex-col justify-center">
                    <div className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5" /> Recommended Action
                    </div>
                    <div className="text-sm font-bold text-neutral-900 mb-4 leading-tight">{gap.resolutionAction}</div>
                    <Link href={`/dashboard/profile`} className="inline-flex items-center justify-center gap-2 w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                      Resolve Gap <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
