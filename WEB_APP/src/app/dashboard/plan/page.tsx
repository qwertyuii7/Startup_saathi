"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Upload,
  UserCheck,
  Building2,
  ArrowRight,
  Clock,
  Sparkles,
  FileCheck,
  Loader2,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api-client";

interface ActionItem {
  id: string;
  analysisId: string;
  stepNumber: string;
  title: string;
  description: string;
  estimatedEffort: string;
  unlocksCount: number;
  unlocksDescription: string;
  completed: boolean;
  actionLabel: string;
  actionType: string;
  category: string;
}

const ICONS: Record<string, typeof Upload> = {
  upload: Upload,
  profile: UserCheck,
  incubator: Building2,
};

export default function ActionPlanPage() {
  const [activeTab, setActiveTab] = useState<"all" | "todo" | "completed">("all");
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisTitle, setAnalysisTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.deepAnalysis.getHistory();
      const latest = (res.history || [])[0] as
        | { id: string; title: string; actionPlan: ActionItem[] }
        | undefined;
      if (!latest) {
        setTasks([]);
        setAnalysisId(null);
      } else {
        setAnalysisId(latest.id);
        setAnalysisTitle(latest.title);
        setTasks(latest.actionPlan || []);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load your action plan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || !analysisId || togglingId) return;
    const next = !task.completed;
    // Optimistic update with rollback on failure.
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: next } : t)));
    setTogglingId(id);
    try {
      const res = await api.deepAnalysis.toggleAction(analysisId, id, next);
      if (res.success && res.analysis?.actionPlan) {
        setTasks(res.analysis.actionPlan as ActionItem[]);
      }
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !next } : t)));
    } finally {
      setTogglingId(null);
    }
  };

  const actionHref = (task: ActionItem): string | null => {
    if (task.actionType === "upload") return "/documents";
    if (task.actionType === "incubator") return "/dashboard/incubators";
    if (task.actionType === "profile") return "/dashboard/profile";
    return null;
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === "todo") return !t.completed;
    if (activeTab === "completed") return t.completed;
    return true;
  });

  const todoCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
        <span className="text-xs font-semibold text-neutral-500">Loading your action plan…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 rounded-2xl bg-white border border-red-200 text-center space-y-3">
        <p role="alert" className="text-xs text-red-600 font-medium">{error}</p>
        <button
          type="button"
          onClick={load}
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
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Your Action Plan</h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          {analysisId
            ? <>Prioritized steps from your latest analysis: <strong className="text-neutral-700">“{analysisTitle}”</strong></>
            : "High-impact steps calculated to systematically unlock government grants, subsidies, and tax benefits."}
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-dashed border-neutral-300 text-center">
          <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">No action plan yet</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
            Run a deep analysis and AROVA will generate prioritized steps from the actual
            eligibility gaps it finds — nothing generic.
          </p>
          <Link
            href="/deep-analysis/new"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold"
          >
            <span>Run Deep Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-3">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-violet-600 text-white shadow-2xs"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab("todo")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "todo"
                  ? "bg-violet-600 text-white shadow-2xs"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              To Do ({todoCount})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "completed"
                  ? "bg-violet-600 text-white shadow-2xs"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Task Cards List */}
          <div className="space-y-3.5">
            {filteredTasks.length === 0 && (
              <p className="text-xs text-neutral-500 py-6 text-center">
                Nothing in this view. Switch tabs to see {activeTab === "todo" ? "completed" : "pending"} items.
              </p>
            )}
            {filteredTasks.map((task) => {
              const isDone = task.completed;
              const Icon = ICONS[task.actionType] || FileCheck;
              const href = actionHref(task);

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl bg-white border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDone
                      ? "border-neutral-200/60 opacity-80"
                      : "border-neutral-200/90 shadow-2xs hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      disabled={togglingId === task.id}
                      className="mt-0.5 text-neutral-400 hover:text-violet-600 transition-colors shrink-0 disabled:opacity-50"
                      title={isDone ? "Mark as to-do" : "Mark as done"}
                    >
                      {togglingId === task.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded bg-neutral-100 text-neutral-600">
                          {task.category}
                        </span>
                        <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimatedEffort}</span>
                        </span>
                      </div>

                      <h3 className={`text-sm font-bold text-neutral-900 ${isDone ? "line-through text-neutral-500" : ""}`}>
                        {task.stepNumber ? `${task.stepNumber}. ` : ""}{task.title}
                      </h3>

                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block mt-1">
                        Unlocks: {task.unlocksDescription}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    {href && !isDone ? (
                      <Link
                        href={href}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-2xs transition-all"
                      >
                        <span>{task.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        disabled={togglingId === task.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{isDone ? "Mark as To-Do" : task.actionLabel}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {analysisId && (
            <Link
              href={`/deep-analysis/${analysisId}/results`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              <span>View the full analysis behind this plan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </>
      )}

      {tasks.length > 0 && (
        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Completion status is saved to your workspace automatically.</span>
        </div>
      )}
    </div>
  );
}
