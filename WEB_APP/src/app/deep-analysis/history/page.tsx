"use client";

import Link from "next/link";
import { CheckCircle2, Copy, ArrowUpRight, Plus, Loader2, RefreshCw } from "lucide-react";
import { useAnalysisHistory } from "@/lib/use-analysis";

export default function AnalysisHistoryPage() {
  const { history, isLoading, error, retry } = useAnalysisHistory();

  return (
    <div className="space-y-8 max-w-none w-full">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Analysis History</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Review and compare previous statutory eligibility runs.
          </p>
        </div>

        <Link
          href="/deep-analysis/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20" role="status">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
          <span className="text-xs font-semibold text-neutral-500">Loading history…</span>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-white border border-red-200 text-center space-y-3">
          <p role="alert" className="text-xs text-red-600 font-medium">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : history.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-dashed border-neutral-300 text-center">
          <p className="text-sm font-semibold text-neutral-700">No analyses yet</p>
          <p className="text-xs text-neutral-500 mt-1">Your completed runs will appear here with full results.</p>
          <Link
            href="/deep-analysis/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start your first analysis</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Analysis Query</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Schemes</th>
                  <th className="py-3.5 px-6">Result</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {history.map((item) => {
                  const matches = (item.eligibleCount || 0) + (item.potentialCount || 0);
                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-4 px-6 text-neutral-900 font-bold">
                        {item.query || item.title}
                      </td>
                      <td className="py-4 px-6 text-neutral-500">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-4 px-6 text-neutral-600">
                        {item.schemesAnalyzedCount} analyzed
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-neutral-800">
                          {matches} matches
                        </span>
                        <span className="text-neutral-400 ml-1">
                          ({item.eligibleCount} strong)
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{item.status === "completed" ? "Completed" : item.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/deep-analysis/${item.id}/results`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-violet-50 text-neutral-700 hover:text-violet-700 text-xs font-semibold transition-all"
                        >
                          <span>View</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                        <Link
                          href="/deep-analysis/new"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-all"
                          title="Run a new analysis"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Duplicate</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
