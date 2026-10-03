"use client";

import React from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, FileText, CheckCircle2, ShieldAlert, FileSearch } from "lucide-react";
import Link from "next/link";

export default function DocumentIntelligencePage() {
  const { analysis, isLoading, error } = useWorkspaceAnalysis();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Document Intelligence...</span>
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

  // To build document intelligence, we'll extract evidence usage from the criteria.
  const allCriteria = analysis.findings.flatMap(f => f.criteriaBreakdown);
  
  // Create a map of documents to the requirements they support
  const docMap = new Map();
  allCriteria.forEach(c => {
    if (c.evidenceDocumentName) {
      if (!docMap.has(c.evidenceDocumentName)) {
        docMap.set(c.evidenceDocumentName, {
          name: c.evidenceDocumentName,
          supportedReqs: new Set(),
          schemes: new Set(),
          evidenceCount: 0
        });
      }
      const entry = docMap.get(c.evidenceDocumentName);
      entry.supportedReqs.add(c.requirement);
      entry.schemes.add(c.sourceCitation?.title || "Scheme");
      entry.evidenceCount++;
    }
  });

  const documents = Array.from(docMap.values());

  return (
    <div className="space-y-8 pb-24 h-full">
      <AnalysisPageHeader 
        title="Document Intelligence" 
        description="Understand exactly how AROVA is using your uploaded documents to prove eligibility across government schemes."
        status={analysis.status}
        updatedAt={analysis.updatedAt}
      >
        <Link href="/dashboard/profile?section=documents" className="h-9 px-4 flex items-center gap-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-xs font-bold text-white transition-colors shadow-sm">
          + Manage Documents
        </Link>
      </AnalysisPageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileSearch className="w-4 h-4 text-violet-500" /> Evidence-Producing Docs</div>
          <div className="text-3xl font-bold text-neutral-900">{documents.length}</div>
          <p className="text-xs text-neutral-500 mt-2">Documents successfully extracted and used in this analysis.</p>
        </div>
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Total Evidence Extracted</div>
          <div className="text-3xl font-bold text-emerald-700">{documents.reduce((acc, d) => acc + d.evidenceCount, 0)}</div>
          <p className="text-xs text-emerald-600/80 mt-2">Data points matched directly to requirements.</p>
        </div>
        <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl shadow-sm">
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-amber-600" /> Missing Documents</div>
          <div className="text-3xl font-bold text-amber-700">{analysis.findings.flatMap(f => f.blockingFactors).filter(b => b.issue.includes("document") || b.issue.includes("evidence")).length}</div>
          <p className="text-xs text-amber-600/80 mt-2">Identified blocking missing documents.</p>
        </div>
      </div>

      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50">
            <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-neutral-900 mb-1">No Evidence Documents</h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">No documents were found or successfully mapped to requirements in this analysis.</p>
          </div>
        ) : (
          documents.map((doc, idx) => (
            <div key={idx} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:border-violet-300 transition-colors">
               <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                 
                 <div className="flex-1">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                        <FileText className="w-5 h-5" />
                     </div>
                     <div>
                       <h3 className="text-lg font-bold text-neutral-900">{doc.name}</h3>
                       <div className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                         <CheckCircle2 className="w-3.5 h-3.5" /> Vector Indexed
                       </div>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="text-xs text-neutral-500 mb-1 font-medium">Requirements Supported</div>
                        <div className="text-xl font-bold text-neutral-900">{doc.supportedReqs.size}</div>
                      </div>
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="text-xs text-neutral-500 mb-1 font-medium">Schemes Affected</div>
                        <div className="text-xl font-bold text-neutral-900">{doc.schemes.size}</div>
                      </div>
                   </div>
                 </div>

                 <div className="w-full md:w-96 shrink-0 bg-neutral-50 border border-neutral-100 rounded-xl p-5 overflow-y-auto max-h-[250px]">
                   <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-4 border-b border-neutral-200 pb-2">Extracted Evidence Coverage</h4>
                   <ul className="space-y-3">
                     {Array.from(doc.supportedReqs).map((req: any, i: number) => (
                       <li key={i} className="flex gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                         <span className="text-xs font-medium text-neutral-600 leading-relaxed">{req}</span>
                       </li>
                     ))}
                   </ul>
                 </div>

               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
