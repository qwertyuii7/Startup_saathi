"use client";

import React, { useState } from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, Building2, MapPin, Target, ExternalLink } from "lucide-react";

export default function IncubatorsIntelligencePage() {
  const { analysis, isLoading, error } = useWorkspaceAnalysis();
  const [filter, setFilter] = useState("ALL");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Incubator Intelligence...</span>
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

  const incubators = analysis.incubatorMatches || [];
  const filtered = filter === "ALL" ? incubators : incubators.filter(i => i.state.toUpperCase() === filter.toUpperCase());
  const uniqueStates = Array.from(new Set(incubators.map(i => i.state.toUpperCase())));

  return (
    <div className="space-y-8 pb-24 h-full">
      <AnalysisPageHeader 
        title="Incubator Intelligence" 
        description="Curated list of incubators matching your startup's sector, stage, and location to accelerate your growth."
        status={analysis.status}
        updatedAt={analysis.updatedAt}
      />

      <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-xl inline-flex overflow-x-auto max-w-full">
        <button 
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            filter === "ALL" ? "bg-white text-violet-700 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          All Locations
        </button>
        {uniqueStates.map(state => (
          <button 
            key={state}
            onClick={() => setFilter(state)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              filter === state ? "bg-white text-violet-700 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {state}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50">
            <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-neutral-900 mb-1">No Matching Incubators</h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">No incubators perfectly matched your current startup parameters in this analysis.</p>
          </div>
        ) : (
          filtered.map((inc, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:border-violet-300 transition-colors flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    inc.applicationStatus.includes("OPEN") ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {inc.applicationStatus}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-neutral-900 leading-tight mb-2">{inc.name}</h3>
                
                <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 mb-6">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {inc.location}, {inc.state}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    {inc.focusArea}
                  </div>
                </div>
                
                <div className="mb-6 space-y-3">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Benefits</div>
                  <ul className="space-y-2">
                    {inc.benefits.map((b, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-xs text-neutral-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1 shrink-0" />
                        <span className="leading-tight">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 border-t border-neutral-100">
                <a href={inc.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-colors shadow-sm">
                  Visit Website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
