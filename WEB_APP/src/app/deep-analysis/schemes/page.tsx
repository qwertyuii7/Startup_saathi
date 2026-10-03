"use client";

import React, { useEffect, useState } from "react";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, FileSearch, Target, FileCheck, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

export default function SchemesIntelligencePage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/applicant/schemes")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMatches(data.matches);
        } else {
          setError(data.error?.message || "Failed to load matches");
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Scheme Intelligence...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Analysis Unavailable</h2>
        <p className="text-sm text-neutral-500">{error}</p>
      </div>
    );
  }

  const highMatches = matches.filter(m => m.matchScore >= 80).length;
  const needsVerif = matches.filter(m => m.eligibilityStatus === "needs_verification").length;

  return (
    <div className="space-y-8 pb-24 relative">
      <AnalysisPageHeader 
        title="Relevant Government Schemes" 
        description="Schemes matched automatically based on your verified documents and startup profile."
        status="complete"
        updatedAt={new Date().toISOString()}
      />

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-1"><FileSearch className="w-3.5 h-3.5" /> Total Matched</div>
          <div className="text-2xl font-bold text-neutral-900">{matches.length}</div>
        </div>
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 mb-1"><Target className="w-3.5 h-3.5" /> High Relevance</div>
          <div className="text-2xl font-bold text-emerald-700">{highMatches}</div>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Needs Verification</div>
          <div className="text-2xl font-bold text-amber-700">{needsVerif}</div>
        </div>
      </div>

      {/* Schemes List */}
      <div className="space-y-4">
        {matches.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50">
            <h3 className="text-lg font-bold text-neutral-900 mb-1">No Matching Schemes Found</h3>
            <p className="text-sm text-neutral-500">Try uploading more documents like your Certificate of Incorporation or GST.</p>
          </div>
        ) : (
          matches.map(match => (
            <div key={match.schemeId} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:border-violet-300 transition-all group">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600">
                        {match.ministry}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        match.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                        match.matchScore >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {match.matchScore}% Match
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        match.eligibilityStatus === 'eligible' || match.eligibilityStatus === 'likely_eligible' ? 'bg-emerald-100 text-emerald-700' :
                        match.eligibilityStatus === 'needs_verification' ? 'bg-amber-100 text-amber-700' :
                        'bg-neutral-100 text-neutral-700'
                      }`}>
                        {match.eligibilityStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">{match.schemeName}</h2>
                    <p className="text-sm text-neutral-600 leading-relaxed mb-6 line-clamp-2">
                      {match.description}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelectedMatch(match)}
                        className="px-4 py-2 bg-violet-50 text-violet-700 text-sm font-bold rounded-lg hover:bg-violet-100 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  {/* Right side Context */}
                  <div className="w-full md:w-64 shrink-0 bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">Why it matched</h3>
                    <ul className="space-y-2">
                      {(match.matchedCriteria || []).slice(0, 3).map((q: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-tight">{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl">
            <div className="p-6 md:p-8 border-b border-neutral-100">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">{selectedMatch.schemeName}</h2>
                  <p className="text-sm text-neutral-500">{selectedMatch.ministry}</p>
                </div>
                <button onClick={() => setSelectedMatch(null)} className="text-neutral-400 hover:text-neutral-600">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">Why this matches your profile</h3>
                <p className="text-sm text-neutral-600 mb-4">{selectedMatch.reason}</p>
                <div className="grid gap-2">
                  {(selectedMatch.matchedCriteria || []).map((c: string, i: number) => (
                    <div key={i} className="flex gap-2 items-start text-sm text-neutral-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      {c}
                    </div>
                  ))}
                  {(selectedMatch.missingInformation || []).map((c: string, i: number) => (
                    <div key={i} className="flex gap-2 items-start text-sm text-neutral-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      {c} (Missing Information)
                    </div>
                  ))}
                </div>
              </div>

              {selectedMatch.evidence && selectedMatch.evidence.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">Document Evidence</h3>
                  <div className="space-y-3">
                    {selectedMatch.evidence.map((ev: any, i: number) => (
                      <div key={i} className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        <div className="text-xs font-bold text-neutral-500 mb-2">Source: Document ID {ev.documentId} (Page {ev.page})</div>
                        <p className="text-sm text-neutral-700 italic">"{ev.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2 text-sm font-bold text-neutral-600 hover:text-neutral-900"
              >
                Close
              </button>
              {selectedMatch.sourceUrl && (
                <a 
                  href={selectedMatch.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-lg hover:bg-violet-700 flex items-center gap-2"
                >
                  Official Source <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
