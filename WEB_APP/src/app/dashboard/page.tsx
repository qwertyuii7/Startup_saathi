"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import { useCopilot } from "@/components/dashboard/CopilotProvider";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";

interface Startup {
  name?: string;
  startupName?: string;
  industry?: string;
  sector?: string;
  stage?: string;
  startupStage?: string;
  state?: string;
  city?: string;
  dpiitStatus?: boolean | string;
  dpiitNumber?: string;
  dpiitRecognitionNumber?: string;
  annualTurnover?: number;
  fundingStatus?: string;
  fundingStage?: string;
  incorporationDate?: string;
  website?: string;
  description?: string;
  entityType?: string;
  legalEntity?: string;
}

interface Fit {
  schemeId: string;
  schemeName: string;
  governmentLevel: string;
  state?: string;
  fitLevel: string;
  fitLabel: string;
  criteriaMetCount: number;
  totalCriteriaCount: number;
  maxBenefit: string;
}

// Profile completion across the fields onboarding + profile collect.
function profileCompletion(s: Startup | null): { percent: number; missing: string[] } {
  if (!s) return { percent: 0, missing: ["Complete onboarding"] };
  const fields: [string, unknown][] = [
    ["Startup name", s.name || s.startupName],
    ["Description", s.description],
    ["Industry", s.industry],
    ["Stage", s.stage || s.startupStage],
    ["State", s.state],
    ["City", s.city],
    ["Entity type", s.entityType || s.legalEntity],
    ["Incorporation date", s.incorporationDate],
    ["DPIIT status", s.dpiitStatus === true || s.dpiitStatus === false ? "set" : ""],
    ["Funding status", s.fundingStatus || s.fundingStage],
    ["Annual turnover", typeof s.annualTurnover === "number" ? "set" : ""],
  ];
  const missing = fields.filter(([, v]) => !v).map(([k]) => k);
  const percent = Math.round(((fields.length - missing.length) / fields.length) * 100);
  return { percent, missing };
}

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { openCopilot } = useCopilot();
  const { user } = useAuth();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [fits, setFits] = useState<Fit[]>([]);
  const [docStats, setDocStats] = useState({ total: 0, indexed: 0 });
  const [latestAnalysis, setLatestAnalysis] = useState<{
    id: string;
    title: string;
    createdAt: string;
    eligibleCount: number;
    potentialCount: number;
    actionPlan: { completed: boolean; title: string }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  void openCopilot;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [profileRes, docsRes, historyRes] = await Promise.all([
        api.startup.getProfile(),
        api.documents.list().catch(() => ({ success: false as const, documents: [] as never[] })),
        api.deepAnalysis.getHistory().catch(() => ({ success: false as const, history: [] as never[] })),
      ]);

      if (!profileRes.success) {
        throw new Error("Could not load your startup profile.");
      }
      const s = (profileRes.startup || null) as Startup | null;
      if (!s) {
        router.replace("/onboarding");
        return;
      }
      setStartup(s);

      const docs = (docsRes.success ? docsRes.documents : []) as {
        status: string;
      }[];
      setDocStats({
        total: docs.length,
        indexed: docs.filter((d) => d.status === "processed").length,
      });

      const history = (historyRes.success ? historyRes.history : []) as {
        id: string;
        title: string;
        createdAt: string;
        eligibleCount: number;
        potentialCount: number;
        actionPlan: { completed: boolean; title: string }[];
      }[];
      setLatestAnalysis(history[0] || null);

      try {
        const evalRes = await api.schemes.evaluate();
        setFits((evalRes.evaluations || []) as Fit[]);
      } catch {
        setFits([]);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Could not load your workspace.";
      if (message.includes("401")) {
        router.replace("/login?redirect=/dashboard");
        return;
      }
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24" role="status" aria-live="polite">
        <div
          className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-violet-600 animate-spin"
          aria-hidden="true"
        />
        <p className="mt-4 text-xs font-semibold text-neutral-500">Loading your workspace...</p>
      </div>
    );
  }

  if (loadError || !startup) {
    return (
      <div className="p-10 rounded-3xl bg-white border border-neutral-200/90 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <p role="alert" className="text-sm text-neutral-700 font-medium">{loadError || "Workspace unavailable."}</p>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const startupName = startup.name || startup.startupName || "Your Startup";
  const dpiitNo = startup.dpiitNumber || startup.dpiitRecognitionNumber || null;
  const isDpiit = startup.dpiitStatus === true;
  const state = startup.state || null;
  const { percent: completion, missing } = profileCompletion(startup);

  const eligible = fits.filter((f) => f.fitLevel === "eligible");
  const potential = fits.filter((f) => f.fitLevel === "potential" || f.fitLevel === "missing_requirement");
  const topMatches = [...eligible, ...potential].slice(0, 2);
  const openActions = (latestAnalysis?.actionPlan || []).filter((a) => !a.completed);

  return (
    <div className="space-y-8 max-w-none w-full">
      {/* Top Banner: Startup Intelligence Workspace */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isDpiit && dpiitNo ? (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>DPIIT Recognized ({dpiitNo})</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600 text-[11px] font-semibold">
                DPIIT recognition not confirmed
              </span>
            )}
            {state && <span className="text-xs text-neutral-400">· {state} Registered</span>}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : startupName}
          </h1>
          <p className="text-sm font-semibold text-neutral-700">{startupName}</p>

          <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl">
            {startup.stage || startup.startupStage || "Stage not set"}
            {startup.industry ? ` · ${startup.industry}` : ""}
            {fits.length > 0 ? (
              <>
                {" "}·{" "}
                <strong className="text-emerald-700 font-semibold">
                  {eligible.length} eligible {eligible.length === 1 ? "scheme" : "schemes"}
                </strong>
                {potential.length > 0 && (
                  <>
                    {" "}and{" "}
                    <strong className="text-amber-700 font-semibold">
                      {potential.length} needing evidence
                    </strong>
                  </>
                )}
              </>
            ) : (
              " · Run an evaluation to see scheme matches"
            )}
            {docStats.total === 0 && " · Upload documents to unlock evidence-based matches"}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/deep-analysis/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Deep Analysis</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Metric Cards — all computed from real data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Scheme Matches</div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">
            {fits.length === 0 ? "—" : `${eligible.length} eligible`}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 font-medium">
            {fits.length === 0 ? "No evaluation yet" : `${fits.length} schemes evaluated`}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Profile Completion</div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">{completion}%</div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {missing.length === 0 ? "Profile complete" : `Missing: ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? "…" : ""}`}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Document Coverage</div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">
            {docStats.total === 0 ? "0 uploaded" : `${docStats.indexed} of ${docStats.total} indexed`}
          </div>
          <div className="text-[11px] mt-1 font-medium">
            {docStats.total === 0 ? (
              <Link href="/documents" className="text-violet-700 hover:underline">Upload documents →</Link>
            ) : (
              <span className="text-violet-700">RAG evidence synced</span>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Open Action Items</div>
          <div className="text-2xl font-bold text-neutral-900 mt-2">
            {latestAnalysis ? openActions.length : "—"}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {latestAnalysis ? `From latest analysis` : "Run an analysis to generate a plan"}
          </div>
        </div>
      </div>

      {/* Primary Action Notice — from the latest real analysis */}
      {latestAnalysis && openActions.length > 0 ? (
        <div className="p-6 rounded-2xl bg-white border border-amber-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Action Required
                </span>
                <h3 className="font-bold text-sm text-neutral-900">{openActions[0].title}</h3>
              </div>
              <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
                {openActions.length - 1 > 0
                  ? `Plus ${openActions.length - 1} more open ${openActions.length - 1 === 1 ? "item" : "items"} from “${latestAnalysis.title}”.`
                  : `From your latest analysis: “${latestAnalysis.title}”.`}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/plan"
            className="shrink-0 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5"
          >
            <span>Complete in Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white border border-dashed border-neutral-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900">No action plan yet</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
                Run a deep analysis to evaluate schemes against your profile and generate prioritized next steps.
              </p>
            </div>
          </div>
          <Link
            href="/deep-analysis/new"
            className="shrink-0 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5"
          >
            <span>Start analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Top Matching Opportunities — real evaluation results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900">Top Scheme Matches</h2>
          <Link
            href="/dashboard/schemes"
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            <span>View All Schemes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {fits.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-dashed border-neutral-300 text-center">
            <p className="text-sm font-semibold text-neutral-700">No evaluation yet</p>
            <p className="text-xs text-neutral-500 mt-1">
              {docStats.total === 0
                ? "Upload documents and complete your profile, then run an evaluation."
                : "Run a scheme evaluation to see how you match."}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {docStats.total === 0 && (
                <Link
                  href="/documents"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Upload documents</span>
                </Link>
              )}
              <Link
                href="/dashboard/schemes"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold"
              >
                <span>Evaluate schemes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topMatches.map((f) => {
              const strong = f.fitLevel === "eligible";
              return (
                <div
                  key={f.schemeId}
                  className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                        {f.governmentLevel}
                        {f.state ? ` · ${f.state}` : ""}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          strong ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
                        }`}
                      >
                        {strong ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        <span>
                          {f.fitLabel} ({f.criteriaMetCount}/{f.totalCriteriaCount})
                        </span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-neutral-900">{f.schemeName}</h3>
                  </div>

                  <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-violet-700">{f.maxBenefit}</span>
                    <Link
                      href={`/dashboard/schemes/${f.schemeId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-violet-700"
                    >
                      <span>View Proof & Evidence</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent analysis strip */}
      {latestAnalysis && (
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Latest analysis</div>
            <div className="text-sm font-bold text-neutral-900 mt-0.5">{latestAnalysis.title}</div>
            <div className="text-[11px] text-neutral-500">
              {new Date(latestAnalysis.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {" · "}{latestAnalysis.eligibleCount} eligible · {latestAnalysis.potentialCount} potential
            </div>
          </div>
          <Link
            href={`/deep-analysis/${latestAnalysis.id}/results`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-violet-50 text-neutral-800 hover:text-violet-700 text-xs font-semibold shrink-0"
          >
            <span>Open results</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
