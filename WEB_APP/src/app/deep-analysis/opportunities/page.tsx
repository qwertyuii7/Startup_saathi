"use client";

import React, { useState } from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, Lightbulb, Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OpportunitiesIntelligencePage() {
  const { analysis, isLoading, error } = useWorkspaceAnalysis();
  const [filter, setFilter] = useState("ALL");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Opportunity Intelligence...</span>
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

  // Derive opportunities strictly from schemes that are HIGH fit or have minimal missing requirements
  const allOpportunities = analysis.findings.filter(f => f.fitLevel === "HIGH" || f.fitLevel === "MEDIUM").map(f => {
    const missing = f.blockingFactors.length;
    return {
      id: f.schemeId,
      title: f.schemeName,
      category: f.maxBenefit.toLowerCase().includes("funding") || f.maxBenefit.toLowerCase().includes("inr") || f.maxBenefit.toLowerCase().includes("lakh") ? "FUNDING" : 
                f.maxBenefit.toLowerCase().includes("tax") ? "TAX INCENTIVE" : "GOVERNMENT SUPPORT",
      fitLabel: f.fitLabel,
      maxBenefit: f.maxBenefit,
      effort: missing === 0 ? "LOW" : missing <= 2 ? "MEDIUM" : "HIGH",
      eligibilityMet: `${f.criteriaMetCount}/${f.totalCriteriaCount}`,
      missingRequirements: missing,
      nextAction: missing === 0 ? "Prepare Application" : "Resolve Gaps"
    };
  });

  const filtered = filter === "ALL" ? allOpportunities : allOpportunities.filter(o => o.category === filter);

  return (
    <div className="space-y-8 pb-24 h-full">
      <AnalysisPageHeader 
        title="Opportunity Intelligence" 
        description="Prioritized list of real government support, funding, and incentives tailored for your startup."
        status={analysis.status}
        updatedAt={analysis.updatedAt}
      />

      <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-xl inline-flex overflow-x-auto max-w-full">
        {[
          { id: "ALL", label: `All Opportunities (${allOpportunities.length})` },
          { id: "FUNDING", label: `Funding & Grants` },
          { id: "TAX INCENTIVE", label: `Tax Incentives` },
          { id: "GOVERNMENT SUPPORT", label: `Support Programs` },
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50">
            <h3 className="text-lg font-bold text-neutral-900 mb-1">No Specific Opportunities</h3>
            <p className="text-sm text-neutral-500">Your startup does not currently strongly match any specific funding or tax schemes.</p>
          </div>
        ) : (
          filtered.map((opp, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:border-violet-300 transition-colors flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 flex items-center gap-1.5">
                    <Lightbulb className="w-3 h-3" />
                    {opp.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    opp.effort === 'LOW' ? 'bg-emerald-50 text-emerald-600' :
                    opp.effort === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {opp.effort} EFFORT
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-neutral-900 leading-tight mb-2">{opp.title}</h3>
                <p className="text-sm text-neutral-600 mb-6">{opp.fitLabel}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Max Benefit</div>
                    <div className="text-sm font-bold text-emerald-600">{opp.maxBenefit}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Eligibility Met</div>
                    <div className="text-sm font-bold text-neutral-900">{opp.eligibilityMet} Criteria</div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-neutral-100">
                <Link href={`/deep-analysis/schemes`} className="inline-flex items-center justify-between w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm">
                  {opp.nextAction} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
