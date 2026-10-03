"use client";

import React, { useEffect, useState } from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, CheckCircle2, ShieldAlert, CircleSlash2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ReadinessPage() {
  const { analysis, isLoading: analysisLoading, error } = useWorkspaceAnalysis();
  const [profileHealth, setProfileHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.health) {
          setProfileHealth(d.data.health);
        }
      })
      .catch(e => console.error(e))
      .finally(() => setHealthLoading(false));
  }, []);

  if (analysisLoading || healthLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Calculating Startup Readiness...</span>
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

  // Calculate Readiness scores deterministically based on analysis data
  const profileReadiness = profileHealth?.overallScore || 0;
  
  const allCriteria = analysis.findings.flatMap(f => f.criteriaBreakdown);
  const evidenceReadiness = allCriteria.length > 0 ? Math.round((allCriteria.filter(c => c.evidenceDocumentName).length / allCriteria.length) * 100) : 0;
  
  const eligibilityReadiness = allCriteria.length > 0 ? Math.round((allCriteria.filter(c => c.status === 'SATISFIED').length / allCriteria.length) * 100) : 0;

  const missingDocs = analysis.findings.flatMap(f => f.blockingFactors).filter(b => b.issue.includes("document") || b.issue.includes("certificate")).length;
  const documentReadiness = missingDocs === 0 ? 100 : Math.max(0, 100 - (missingDocs * 10)); // Arbitrary penalty per missing doc for visual
  
  const applicationReadiness = Math.round((profileReadiness + evidenceReadiness + eligibilityReadiness + documentReadiness) / 4);

  const ReadinessCard = ({ title, score, desc, actionLabel, href, missing = [] }: any) => (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-neutral-900">{title}</h3>
          <span className={`text-xl font-black ${
            score >= 80 ? 'text-emerald-500' : 
            score >= 50 ? 'text-amber-500' : 'text-red-500'
          }`}>{score}%</span>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed mb-6 h-12">{desc}</p>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden mb-6">
          <div className={`h-full transition-all duration-1000 ${
            score >= 80 ? 'bg-emerald-500' : 
            score >= 50 ? 'bg-amber-500' : 'bg-red-500'
          }`} style={{ width: `${score}%` }} />
        </div>

        {missing.length > 0 && (
          <div className="mb-6 space-y-2">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Currently Blocking</h4>
            {missing.slice(0, 3).map((m: any, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-neutral-700 leading-tight">{m}</span>
              </div>
            ))}
            {missing.length > 3 && <div className="text-xs text-neutral-400 font-medium">+{missing.length - 3} more</div>}
          </div>
        )}
      </div>

      <Link href={href} className="inline-flex items-center justify-center w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-lg transition-colors">
        {actionLabel}
      </Link>
    </div>
  );

  return (
    <div className="space-y-8 pb-24 h-full">
      <AnalysisPageHeader 
        title="Application Readiness" 
        description="Deterministic assessment of your startup's capability to successfully apply for matched government schemes."
        status={analysis.status}
        updatedAt={analysis.updatedAt}
      />

      <div className="bg-violet-600 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <h2 className="text-3xl font-display font-medium tracking-tight mb-2">Overall Readiness</h2>
          <p className="text-violet-200 text-sm max-w-lg">Combined score factoring your profile completion, verified evidence, eligibility met, and missing blockers.</p>
        </div>
        <div className="flex items-center gap-4">
           {applicationReadiness >= 80 ? <CheckCircle2 className="w-16 h-16 text-emerald-300" /> : <ShieldAlert className="w-16 h-16 text-amber-300" />}
           <div className="text-6xl font-black">{applicationReadiness}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReadinessCard 
          title="Profile Readiness" 
          score={profileReadiness} 
          desc="Measures the completeness of your core startup identity and founder information." 
          actionLabel="Complete Profile" 
          href="/dashboard/profile"
          missing={profileHealth?.details?.startup?.filter((d: any) => !d.completed).map((d: any) => d.label) || []}
        />
        <ReadinessCard 
          title="Eligibility Readiness" 
          score={eligibilityReadiness} 
          desc="Percentage of requirements successfully met across all evaluated schemes." 
          actionLabel="View Eligibility Matrix" 
          href="/deep-analysis/eligibility"
          missing={allCriteria.filter(c => c.status === 'VERIFICATION_REQUIRED' || c.status === 'NOT_SATISFIED').map(c => c.requirement)}
        />
        <ReadinessCard 
          title="Document Readiness" 
          score={documentReadiness} 
          desc="Measures the presence of critical incorporation and financial documents." 
          actionLabel="Upload Documents" 
          href="/dashboard/profile?section=documents"
          missing={analysis.findings.flatMap(f => f.blockingFactors).filter(b => b.issue.includes("document")).map(b => b.issue)}
        />
        <ReadinessCard 
          title="Evidence Readiness" 
          score={evidenceReadiness} 
          desc="Measures how effectively your uploaded documents map to strict government requirements." 
          actionLabel="Review Evidence" 
          href="/deep-analysis/evidence"
        />
      </div>
    </div>
  );
}
