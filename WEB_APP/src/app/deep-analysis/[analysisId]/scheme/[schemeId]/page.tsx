"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, FileText, ArrowRight, ArrowLeft, Loader2, RefreshCw, AlertTriangle, XCircle, Sparkles } from "lucide-react";
import { useAnalysis } from "@/lib/use-analysis";
import { AiApplicationDraftModal } from "@/components/deep-analysis/AiApplicationDraftModal";

function statusBadge(status: string, label: string) {
  const cls =
    status === "satisfied"
      ? "text-emerald-700 bg-emerald-50"
      : status === "needs_verification" || status === "evidence_missing"
        ? "text-amber-700 bg-amber-50"
        : "text-rose-700 bg-rose-50";
  const Icon = status === "satisfied" ? CheckCircle2 : status === "not_satisfied" ? XCircle : AlertTriangle;
  return (
    <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </span>
  );
}

export default function SchemeEligibilityPage() {
  const params = useParams();
  const analysisId = params?.analysisId as string | undefined;
  const schemeId = params?.schemeId as string | undefined;
  const { analysis, isLoading, error, retry } = useAnalysis(analysisId);
  const [draftOpen, setDraftOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
        <span className="text-xs font-semibold text-neutral-500">Loading eligibility breakdown…</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-10 rounded-2xl bg-white border border-red-200 text-center space-y-3">
        <p role="alert" className="text-xs text-red-600 font-medium">{error || "Analysis not found."}</p>
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const finding = (analysis.findings || []).find((f) => f.schemeId === schemeId);

  if (!finding) {
    return (
      <div className="p-10 rounded-2xl bg-white border border-neutral-200 text-center space-y-3">
        <p className="text-sm font-semibold text-neutral-700">This scheme was not part of the analysis</p>
        <p className="text-xs text-neutral-500">It may have been filtered out by the analysis scope.</p>
        <Link
          href={`/deep-analysis/${analysis.id}/results`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Results</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-none w-full">
      {/* Back Button & Title Header */}
      <div>
        <Link
          href={`/deep-analysis/${analysis.id}/results`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Results</span>
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Eligibility Analysis</h1>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="text-sm font-semibold text-neutral-800">{finding.schemeName}</span>
          {statusBadge(finding.fitLevel === "eligible" ? "satisfied" : finding.fitLevel === "not_eligible" ? "not_satisfied" : "needs_verification", finding.fitLabel)}
          <span className="text-xs text-neutral-400">
            {finding.criteriaMetCount}/{finding.totalCriteriaCount} criteria satisfied · Max benefit: {finding.maxBenefit}
          </span>
        </div>
      </div>

      {/* Requirement Breakdown Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
          <h2 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
            Statutory Requirement Verification
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Requirement</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Verified Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {finding.criteriaBreakdown.map((req) => (
                <tr key={req.requirementId} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-4 px-6 text-neutral-900 font-semibold">
                    {req.requirement}
                    <span className="block font-normal text-neutral-500 mt-1">{req.aiReasoning}</span>
                  </td>
                  <td className="py-4 px-6">
                    {statusBadge(req.status, req.statusLabel)}
                  </td>
                  <td className="py-4 px-6 text-neutral-600">
                    {req.evidenceSnippet ? (
                      <span className="inline-flex items-start gap-1.5 font-mono text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md">
                        <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span>
                          {req.evidenceDocumentName}
                          {typeof req.evidencePage === "number" ? ` · Page ${req.evidencePage}` : ""}
                          <span className="block text-[11px] text-neutral-400 mt-0.5">
                            {req.sourceCitation.clause} · {req.sourceCitation.title}
                          </span>
                        </span>
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-[11px]">No evidence yet — see resolution below</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blocking factors */}
      {finding.blockingFactors.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-amber-200/70 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
            What is blocking full eligibility?
          </h2>
          <ul className="space-y-2.5">
            {finding.blockingFactors.map((b, i) => (
              <li key={i} className="text-xs text-neutral-600 leading-relaxed">
                <span className="font-semibold text-neutral-900">{b.issue}. </span>
                {b.resolutionAction}. <span className="text-neutral-400">({b.impact})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom CTAs */}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="button"
          onClick={() => setDraftOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Application Draft</span>
        </button>
        <Link
          href={`/deep-analysis/${analysis.id}/evidence`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-all"
        >
          <span>View Evidence</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href={`/deep-analysis/${analysis.id}/action-plan`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-all"
        >
          <span>View Action Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {draftOpen && (
        <AiApplicationDraftModal schemeId={finding.schemeId} onClose={() => setDraftOpen(false)} />
      )}
    </div>
  );
}
