"use client";

import React, { useState } from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, BookOpen, ExternalLink, ShieldCheck, FileText, Globe } from "lucide-react";

export default function SourcesIntelligencePage() {
  const { analysis, isLoading, error } = useWorkspaceAnalysis();
  const [filter, setFilter] = useState("ALL");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Source Intelligence...</span>
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

  // Aggregate sources from criteria breakdown
  const sourceMap = new Map();
  analysis.findings.flatMap(f => f.criteriaBreakdown).forEach(c => {
    if (c.sourceCitation && c.sourceCitation.url) {
      if (!sourceMap.has(c.sourceCitation.url)) {
        sourceMap.set(c.sourceCitation.url, {
          title: c.sourceCitation.title,
          url: c.sourceCitation.url,
          category: c.sourceCitation.url.includes("gov.in") ? "GOVERNMENT" : "KNOWLEDGE BASE",
          uses: new Set()
        });
      }
      sourceMap.get(c.sourceCitation.url).uses.add(c.requirement);
    }
    
    // Add internal documents as sources
    if (c.evidenceDocumentName) {
      const docId = `doc-${c.evidenceDocumentName}`;
      if (!sourceMap.has(docId)) {
        sourceMap.set(docId, {
          title: c.evidenceDocumentName,
          url: null,
          category: "USER DOCUMENTS",
          uses: new Set()
        });
      }
      sourceMap.get(docId).uses.add(c.requirement);
    }
  });

  const sources = Array.from(sourceMap.values());
  const filtered = filter === "ALL" ? sources : sources.filter(s => s.category === filter);

  return (
    <div className="space-y-8 pb-24 h-full">
      <AnalysisPageHeader 
        title="Knowledge & Sources" 
        description="Every verified government guideline, document, and knowledge base used to generate this analysis."
        status={analysis.status}
        updatedAt={analysis.updatedAt}
      />

      <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-xl inline-flex overflow-x-auto max-w-full">
        {[
          { id: "ALL", label: `All Sources (${sources.length})` },
          { id: "GOVERNMENT", label: `Government (${sources.filter(s => s.category === "GOVERNMENT").length})` },
          { id: "USER DOCUMENTS", label: `Your Documents (${sources.filter(s => s.category === "USER DOCUMENTS").length})` },
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
            <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-neutral-900 mb-1">No Sources Found</h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">No distinct sources match this filter.</p>
          </div>
        ) : (
          filtered.map((src, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:border-violet-300 transition-colors flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    src.category === "GOVERNMENT" ? 'bg-emerald-100 text-emerald-700' :
                    src.category === "USER DOCUMENTS" ? 'bg-violet-100 text-violet-700' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {src.category === "GOVERNMENT" ? <ShieldCheck className="w-3 h-3" /> :
                     src.category === "USER DOCUMENTS" ? <FileText className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    {src.category}
                  </span>
                </div>
                
                <h3 className="text-base font-bold text-neutral-900 leading-tight mb-2 truncate max-w-full" title={src.title}>{src.title}</h3>
                {src.url && (
                  <p className="text-xs text-neutral-500 mb-4 truncate font-mono bg-neutral-50 p-1.5 rounded border border-neutral-100">{src.url}</p>
                )}
                
                <div className="mt-4">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Used For {src.uses.size} Requirements</div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(src.uses).slice(0, 3).map((use: any, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600 truncate max-w-[200px]">
                        {use}
                      </span>
                    ))}
                    {src.uses.size > 3 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-500">
                        +{src.uses.size - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {src.url && (
                <div className="pt-4 mt-6 border-t border-neutral-100">
                  <a href={src.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 hover:text-violet-700">
                    Visit Official Source <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
