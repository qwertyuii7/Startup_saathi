"use client";

import React, { useState } from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, AlertTriangle, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RiskIntelligencePage() {
  const { analysis, isLoading, error } = useWorkspaceAnalysis();
  const [filter, setFilter] = useState("ALL");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Risk Intelligence...</span>
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

  // Derive risks from blocking factors and unsatisfied requirements
  const allRisks = analysis.findings.flatMap(f => {
    const risks: Array<{id: string, category: string, title: string, impact: string, affectedArea: string, mitigation: string}> = [];
    
    // Add missing documents as documentation risks
    f.blockingFactors.filter(b => b.issue.includes("document")).forEach(b => {
      risks.push({
        id: `risk-doc-${f.schemeId}-${b.issue}`,
        category: "DOCUMENTATION RISK",
        title: b.issue,
        impact: b.impact,
        affectedArea: f.schemeName,
        mitigation: b.resolutionAction
      });
    });

    // Add unsatisfied criteria as eligibility risks
    f.criteriaBreakdown.filter(c => c.status === "NOT_SATISFIED").forEach(c => {
      risks.push({
        id: `risk-elig-${c.requirementId}`,
        category: "ELIGIBILITY RISK",
        title: `Failed Requirement: ${c.requirement}`,
        impact: `Directly disqualifies startup from ${f.schemeName} benefits.`,
        affectedArea: f.schemeName,
        mitigation: `Review profile details matching: ${c.sourceCitation?.clause || c.requirement}`
      });
    });
    
    return risks;
  });

  const filteredRisks = filter === "ALL" ? allRisks : allRisks.filter(r => r.category.startsWith(filter));

  return (
    <div className="space-y-8 pb-24 h-full">
      <AnalysisPageHeader 
        title="Risk Intelligence" 
        description="Identified risks regarding your eligibility, document integrity, and compliance across matching schemes."
        status={analysis.status}
        updatedAt={analysis.updatedAt}
      />

      <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-xl inline-flex overflow-x-auto max-w-full">
        {[
          { id: "ALL", label: `All Risks (${allRisks.length})` },
          { id: "ELIGIBILITY", label: `Eligibility (${allRisks.filter(r => r.category === "ELIGIBILITY RISK").length})` },
          { id: "DOCUMENTATION", label: `Documentation (${allRisks.filter(r => r.category === "DOCUMENTATION RISK").length})` },
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRisks.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-emerald-300 rounded-2xl bg-emerald-50">
            <h3 className="text-lg font-bold text-emerald-900 mb-1">No Risks Detected</h3>
            <p className="text-sm text-emerald-700">AROVA found no significant eligibility or documentation risks in your current profile.</p>
          </div>
        ) : (
          filteredRisks.map((risk, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:border-amber-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    risk.category.includes("ELIGIBILITY") ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {risk.category.includes("ELIGIBILITY") ? <ShieldAlert className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {risk.category}
                  </span>
                </div>
                
                <h3 className="text-base font-bold text-neutral-900 leading-tight mb-2">{risk.title}</h3>
                <p className="text-sm text-neutral-600 mb-6">{risk.impact}</p>
                
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 mb-6">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Affected Area</div>
                  <div className="text-xs font-bold text-neutral-900">{risk.affectedArea}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-neutral-100">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Mitigation Action</div>
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium text-neutral-900 leading-tight">{risk.mitigation}</p>
                  <Link href="/dashboard/profile" className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center shrink-0 transition-colors">
                    <ArrowRight className="w-4 h-4 text-neutral-700" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
