"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useAnalysis } from "@/lib/use-analysis";

export default function AnalysisResultsPage() {
  const params = useParams();
  const analysisId = params?.analysisId as string | undefined;
  const { analysis, isLoading, error, retry } = useAnalysis(analysisId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
        <span className="text-xs font-semibold text-neutral-500">Loading analysis results…</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-10 rounded-2xl bg-white border border-red-200 text-center space-y-3">
        <p role="alert" className="text-xs text-red-600 font-medium">
          {error || "This analysis could not be found."}
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
          <Link
            href="/deep-analysis/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold"
          >
            <span>New analysis</span>
          </Link>
        </div>
      </div>
    );
  }

  const findings = analysis.findings || [];

  return (
    <div className="space-y-8 max-w-none w-full">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Analysis Results</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {analysis.title} — evaluated against your startup profile and uploaded documents.
        </p>
      </div>

      {/* Top Summary KPI Cards — from the persisted record */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Potential Matches</div>
          <div className="text-3xl font-bold text-neutral-900 mt-2">
            {analysis.eligibleCount + analysis.potentialCount}
          </div>
          <div className="text-xs text-neutral-400 mt-1">Total identified schemes</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strong Matches</span>
          </div>
          <div className="text-3xl font-bold text-emerald-600 mt-2">{analysis.eligibleCount}</div>
          <div className="text-xs text-neutral-400 mt-1">All criteria satisfied</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Need More Information</span>
          </div>
          <div className="text-3xl font-bold text-amber-600 mt-2">
            {analysis.potentialCount + analysis.missingCount}
          </div>
          <div className="text-xs text-neutral-400 mt-1">Missing specific documents</div>
        </div>
      </div>

      {/* Scheme Cards List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-neutral-900">Analyzed Schemes</h2>

        {findings.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-dashed border-neutral-300 text-center">
            <p className="text-sm font-semibold text-neutral-700">No schemes were analyzed in this run</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {findings.map((scheme) => {
              const strong = scheme.fitLevel === "eligible";
              const bad = scheme.fitLevel === "not_eligible";
              return (
                <div
                  key={scheme.schemeId}
                  className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 tracking-wider">
                        {scheme.governmentLevel?.toUpperCase()}
                        {scheme.state ? ` · ${scheme.state.toUpperCase()}` : ""}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                          strong
                            ? "text-emerald-700 bg-emerald-50"
                            : bad
                              ? "text-rose-700 bg-rose-50"
                              : "text-amber-700 bg-amber-50"
                        }`}
                      >
                        {strong ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : bad ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{scheme.fitLabel}</span>
                      </span>

                      <span className="text-xs text-neutral-400">
                        · {scheme.criteriaMetCount} / {scheme.totalCriteriaCount} criteria satisfied
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-neutral-900">
                      {scheme.schemeName}
                    </h3>

                    {scheme.qualifyingFactors.length > 0 && (
                      <p className="text-xs text-neutral-600 leading-relaxed max-w-3xl">
                        Satisfied: {scheme.qualifyingFactors.slice(0, 2).join(" · ")}
                        {scheme.qualifyingFactors.length > 2 ? "…" : ""}
                      </p>
                    )}

                    <div className="text-xs font-medium text-violet-700">
                      <span className="text-neutral-400 font-normal">Benefits: </span>
                      {scheme.maxBenefit}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    <Link
                      href={`/deep-analysis/${analysis.id}/scheme/${scheme.schemeId}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-all"
                    >
                      <span>View Eligibility</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Link
        href={`/deep-analysis/${analysis.id}/action-plan`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Continue to your action plan →</span>
      </Link>
    </div>
  );
}
