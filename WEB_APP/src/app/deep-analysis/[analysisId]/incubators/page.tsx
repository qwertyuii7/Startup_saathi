"use client";

import { Building2, MapPin, ArrowRight, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAnalysis } from "@/lib/use-analysis";

export default function IncubatorsPage() {
  const params = useParams();
  const analysisId = params?.analysisId as string | undefined;
  const { analysis, isLoading, error, retry } = useAnalysis(analysisId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
        <span className="text-xs font-semibold text-neutral-500">Loading matched incubators…</span>
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

  const incubators = analysis.incubatorMatches || [];

  return (
    <div className="space-y-8 max-w-none w-full">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Matched Incubators</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Incubators matched to your profile in “{analysis.title}”.
        </p>
      </div>

      {incubators.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-dashed border-neutral-300 text-center">
          <p className="text-sm font-semibold text-neutral-700">No incubator matches in this analysis</p>
          <p className="text-xs text-neutral-500 mt-1">Complete your state and sector profile to improve matching.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incubators.map((inc) => (
            <div
              key={inc.id}
              className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 leading-snug">
                      {inc.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{inc.location}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="text-neutral-600">
                    <span className="font-semibold text-neutral-800">Focus: </span>
                    <span>{inc.focusArea}</span>
                  </div>
                  <div className="text-neutral-600">
                    <span className="font-semibold text-neutral-800">Status: </span>
                    <span>{inc.applicationStatus}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(inc.benefits || []).slice(0, 3).map((b) => (
                    <span
                      key={b}
                      className="text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <Link
                  href="/dashboard/incubators"
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-all"
                >
                  Details
                </Link>
                <a
                  href={inc.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-2xs transition-all"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href={`/deep-analysis/${analysis.id}/results`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700"
      >
        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
        <span>Back to results</span>
      </Link>
    </div>
  );
}
