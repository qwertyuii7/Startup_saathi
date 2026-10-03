"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, ArrowRight, Building2, Upload, UserCheck, Loader2, RefreshCw, Circle, ArrowLeft, FileCheck } from "lucide-react";
import { useAnalysis, type AnalysisRecord } from "@/lib/use-analysis";
import { api } from "@/lib/api-client";

const ICONS: Record<string, typeof Upload> = {
  upload: Upload,
  profile: UserCheck,
  incubator: Building2,
};

function actionHref(actionType: string): string | null {
  if (actionType === "upload") return "/documents";
  if (actionType === "profile") return "/dashboard/profile";
  if (actionType === "incubator") return "/dashboard/incubators";
  return null;
}

export default function AnalysisActionPlanPage() {
  const params = useParams();
  const analysisId = params?.analysisId as string | undefined;
  const { analysis, isLoading, error, retry } = useAnalysis(analysisId);
  const [items, setItems] = useState<AnalysisRecord["actionPlan"] | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const plan = items || analysis?.actionPlan || [];

  const toggle = async (id: string) => {
    const current = plan.find((t) => t.id === id);
    if (!current || !analysisId || togglingId) return;
    const next = !current.completed;
    setItems(plan.map((t) => (t.id === id ? { ...t, completed: next } : t)));
    setTogglingId(id);
    try {
      const res = await api.deepAnalysis.toggleAction(analysisId, id, next);
      if (res.success && res.analysis?.actionPlan) {
        setItems(res.analysis.actionPlan);
      }
    } catch {
      setItems(plan.map((t) => (t.id === id ? { ...t, completed: !next } : t)));
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
        <span className="text-xs font-semibold text-neutral-500">Loading action plan…</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-10 rounded-2xl bg-white border border-red-200 text-center space-y-3">
        <p role="alert" className="text-xs text-red-600 font-medium">{error || "Analysis not found."}</p>
        <button
          type="button"
          onClick={() => { setItems(null); retry(); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-none w-full">
      <div>
        <Link
          href={`/deep-analysis/${analysis.id}/results`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Results</span>
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Your Action Plan</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Generated from “{analysis.title}” — every item traces to an actual eligibility gap.
        </p>
      </div>

      {plan.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-dashed border-neutral-300 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-700">Nothing to do</p>
          <p className="text-xs text-neutral-500 mt-1">This analysis found no blocking requirements.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plan.map((item) => {
            const Icon = ICONS[item.actionType] || FileCheck;
            const href = actionHref(item.actionType);
            const done = item.completed;
            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    disabled={togglingId === item.id}
                    className="mt-0.5 text-neutral-400 hover:text-violet-600 transition-colors shrink-0 disabled:opacity-50"
                    title={done ? "Mark as to-do" : "Mark as done"}
                  >
                    {togglingId === item.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                        {item.stepNumber} · {item.category}
                      </span>
                      <span className="text-[11px] text-neutral-400">{item.estimatedEffort}</span>
                    </div>
                    <h3 className={`text-sm font-bold text-neutral-900 ${done ? "line-through text-neutral-500" : ""}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">{item.description}</p>
                    <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block">
                      Unlocks: {item.unlocksDescription}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  {href && !done ? (
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.actionLabel}</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      disabled={togglingId === item.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      <span>{done ? "Mark as To-Do" : item.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
