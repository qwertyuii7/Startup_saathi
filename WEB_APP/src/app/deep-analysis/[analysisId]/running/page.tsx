"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Circle, Loader2, ArrowRight, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { useAnalysis } from "@/lib/use-analysis";

const STAGES = [
  "Reading startup profile & statutory records",
  "Processing & chunking startup documents",
  "Finding relevant central & state government schemes",
  "Checking statutory eligibility requirements",
  "Validating vector evidence & page citations",
  "Preparing personalized action plan & recommendations",
];

export default function AnalysisRunningPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params?.analysisId as string | undefined;
  const { analysis, isLoading, error, retry } = useAnalysis(analysisId);

  useEffect(() => {
    if (!analysisId) {
      router.replace("/deep-analysis/new");
    }
  }, [analysisId, router]);

  const isComplete = !!analysis && analysis.status === "completed";

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 mb-2">
          {isComplete ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          ) : (
            <Sparkles className="w-6 h-6 animate-spin" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">
          {isComplete ? "Analysis complete" : "Confirming your analysis"}
        </h1>
        <p className="text-xs text-neutral-500">
          {isComplete
            ? `“${analysis.title}” — ${analysis.schemesAnalyzedCount} schemes evaluated against your profile and documents.`
            : "Loading the persisted result of your backend analysis run."}
        </p>
      </div>

      {isLoading ? (
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs flex items-center justify-center gap-2 text-xs text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
          <span>Loading analysis record…</span>
        </div>
      ) : error || !analysis ? (
        <div className="p-6 rounded-2xl bg-white border border-red-200 shadow-2xs text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p role="alert" className="text-xs text-red-600 font-medium">
            {error || "This analysis could not be found. It may belong to another account or the run may have failed."}
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
              <span>Start a new run</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar Card — reflects the real persisted record */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-700">Analysis Progress</span>
              <span className="text-violet-600 font-bold">{isComplete ? 100 : 50}%</span>
            </div>
            <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${isComplete ? 100 : 50}%` }}
              />
            </div>
          </div>

          {/* Step Timeline — the actual backend pipeline stages */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-4">
            <div className="space-y-3">
              {STAGES.map((label, idx) => {
                const done = isComplete;
                return (
                  <div key={idx} className="flex items-center gap-3.5 text-xs transition-colors">
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutral-300 shrink-0" />
                    )}
                    <span className={`font-medium ${done ? "text-neutral-800 font-semibold" : "text-neutral-400"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Action / View Results Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => analysisId && router.push(`/deep-analysis/${analysisId}/results`)}
          disabled={!isComplete}
          className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
            isComplete
              ? "bg-violet-600 hover:bg-violet-700 text-white shadow-md cursor-pointer"
              : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
          }`}
        >
          <span>View Analysis Results</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
