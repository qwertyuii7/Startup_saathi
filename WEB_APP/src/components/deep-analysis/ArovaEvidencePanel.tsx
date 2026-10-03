"use client";

import React from "react";
import { FileSearch, FileText, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { usePathname } from "next/navigation";

export function ArovaEvidencePanel() {
  const { analysis } = useWorkspaceAnalysis();
  const pathname = usePathname();

  if (!analysis) {
    return (
      <div className="absolute inset-0 flex flex-col bg-neutral-50 overflow-y-auto">
        <div className="flex flex-col items-center justify-center h-full p-6 text-center text-neutral-500">
          <FileSearch className="w-8 h-8 text-neutral-300 mb-3" />
          <p className="text-xs">No analysis available to show evidence.</p>
        </div>
      </div>
    );
  }

  // Aggregate all evidence from the current analysis
  const allCriteria = analysis.findings.flatMap(f => 
    (f.criteriaBreakdown || []).map(c => ({
      ...c, 
      schemeName: f.schemeName 
    }))
  );
  
  const extractedEvidence = allCriteria.filter(c => c.evidenceDocumentName);
  const missingEvidence = allCriteria.filter(c => !c.evidenceDocumentName && c.status !== 'SATISFIED');

  return (
    <div className="absolute inset-0 flex flex-col bg-neutral-50 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-white border-b border-neutral-100 shrink-0 shadow-xs z-10">
        <h3 className="font-bold text-sm flex items-center gap-2 text-neutral-900 tracking-tight">
          <FileSearch className="w-4 h-4 text-violet-600" /> Grounded Evidence
        </h3>
        <p className="text-[10px] text-neutral-500 mt-1 font-medium">Source documents supporting this analysis</p>
      </div>

      <div className="p-4 space-y-4">
        {extractedEvidence.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-500">
            <FileText className="w-8 h-8 text-neutral-300 mb-3" />
            <p className="text-xs font-semibold">No evidence mapped yet.</p>
            <p className="text-[10px] mt-1">Upload documents to verify your eligibility.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-1 mb-2">Verified Documents</h4>
            {extractedEvidence.map((c, i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-xl p-3 shadow-2xs hover:border-violet-200 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {c.evidenceDocumentName}
                  </div>
                  {c.evidencePage && <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">p.{c.evidencePage}</span>}
                </div>
                
                <div className="text-[11px] font-semibold text-neutral-700 mb-2 leading-tight">
                  Supports: <span className="font-normal">{c.requirement}</span>
                </div>
                
                {c.evidenceSnippet && (
                  <div className="text-[10px] text-neutral-500 italic bg-neutral-50/80 p-2 rounded border border-neutral-100 line-clamp-2">
                    "{c.evidenceSnippet}"
                  </div>
                )}
                
                <div className="mt-3 pt-2 border-t border-neutral-100 flex gap-2">
                  <button className="flex-1 py-1.5 text-[10px] font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors">
                    View Document
                  </button>
                  <button className="flex-1 py-1.5 text-[10px] font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-md transition-colors flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" /> Ask AROVA
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {missingEvidence.length > 0 && (
          <div className="mt-6">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-1 mb-2 mt-6 border-t border-neutral-200/60 pt-4">Missing Evidence</h4>
            <div className="space-y-2">
              {missingEvidence.slice(0, 3).map((c, i) => (
                <div key={i} className="bg-red-50/50 border border-red-100 rounded-lg p-2.5 flex items-start gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-bold text-red-800">{c.requirement}</div>
                    <div className="text-[9px] text-red-600/80 mt-0.5">No supporting document found</div>
                  </div>
                </div>
              ))}
              {missingEvidence.length > 3 && (
                <div className="text-[10px] font-bold text-neutral-400 text-center py-2">
                  +{missingEvidence.length - 3} more missing items
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
