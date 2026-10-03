"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, FileText, CheckCircle2, ListFilter, ArrowUpRight, Loader2, RefreshCw } from "lucide-react";
import { useAnalysisHistory } from "@/lib/use-analysis";

export default function DeepAnalysisOverviewPage() {
  const { history, isLoading, error, retry } = useAnalysisHistory();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
        <span className="text-xs font-semibold text-neutral-500">Loading your analyses…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 rounded-2xl bg-white border border-red-200 text-center space-y-3">
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
    );
  }

  const totalAnalyzed = history.reduce((n, a) => n + (a.schemesAnalyzedCount || 0), 0);
  const totalEligible = history.reduce((n, a) => n + (a.eligibleCount || 0), 0);
  const totalActions = history.reduce(
    (n, a) => n + ((a.actionPlan || []).filter((i) => !i.completed).length),
    0
  );
  const recent = history.slice(0, 3);

  const stats = [
    { label: "Analyses Run", value: String(history.length), icon: Sparkles, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Eligible Matches", value: String(totalEligible), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Schemes Analyzed", value: String(totalAnalyzed), icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Open Action Items", value: String(totalActions), icon: ListFilter, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8 max-w-none w-full">
      {/* Title Section */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Deep Analysis</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Understand which government schemes fit your startup and why.
        </p>
      </div>

      {/* 4 Stats Cards — computed from your persisted analyses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.label}
              className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">{st.label}</span>
                <div className={`w-8 h-8 rounded-lg ${st.bg} ${st.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900 mt-3">{st.value}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Analyses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900">Recent Analyses</h2>
          <Link
            href="/deep-analysis/history"
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-dashed border-neutral-300 text-center">
            <p className="text-sm font-semibold text-neutral-700">No analyses yet</p>
            <p className="text-xs text-neutral-500 mt-1">
              Start your first deep analysis to evaluate schemes against your profile and documents.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recent.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs flex flex-col justify-between hover:border-neutral-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                      {item.status === "completed" ? "Completed" : item.status}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 text-sm leading-snug group-hover:text-violet-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="mt-3 text-xs text-neutral-500 space-y-1">
                    <div>{item.schemesAnalyzedCount} schemes analyzed</div>
                    <div className="font-medium text-neutral-700">
                      {item.eligibleCount + item.potentialCount} potential matches ({item.eligibleCount} strong)
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-end">
                  <Link
                    href={`/deep-analysis/${item.id}/results`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-violet-50 text-neutral-700 hover:text-violet-700 text-xs font-semibold transition-all"
                  >
                    <span>View Analysis</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start New Analysis CTA Banner */}
      <div className="p-8 rounded-2xl bg-neutral-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <h3 className="text-lg font-bold">Ready to analyze your startup?</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Run deterministic statutory eligibility verification against your profile, documents, and official scheme clauses.
          </p>
        </div>
        <Link
          href="/deep-analysis/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-md shrink-0"
        >
          <span>Start a New Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
