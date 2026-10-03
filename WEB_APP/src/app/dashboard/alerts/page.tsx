"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, CheckCircle2, FileText, Sparkles, ArrowRight, RefreshCw, Loader2, UploadCloud } from "lucide-react";
import { api } from "@/lib/api-client";

interface Alert {
  id: string;
  title: string;
  description: string;
  type: string;
  affectsYou: boolean;
  actionText: string;
  actionHref: string;
  tone: "violet" | "amber" | "emerald" | "red";
}

const TONES: Record<Alert["tone"], string> = {
  violet: "text-violet-600 bg-violet-50",
  amber: "text-amber-600 bg-amber-50",
  emerald: "text-emerald-600 bg-emerald-50",
  red: "text-red-600 bg-red-50",
};

const ICONS: Record<string, typeof Bell> = {
  blocker: AlertTriangle,
  document: FileText,
  success: CheckCircle2,
  start: Sparkles,
  upload: UploadCloud,
};

export default function PolicyAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [kinds, setKinds] = useState<Record<string, keyof typeof ICONS>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [historyRes, docsRes] = await Promise.all([
        api.deepAnalysis.getHistory().catch(() => ({ success: false as const, history: [] as never[] })),
        api.documents.list().catch(() => ({ success: false as const, documents: [] as never[] })),
      ]);

      const built: Alert[] = [];
      const iconKinds: Record<string, keyof typeof ICONS> = {};

      const docs = (docsRes.success ? docsRes.documents : []) as {
        id: string;
        name: string;
        status: string;
        processingError?: string;
      }[];
      const failed = docs.filter((d) => d.status === "error");
      for (const d of failed) {
        built.push({
          id: `doc-${d.id}`,
          title: `“${d.name}” failed to process`,
          description: d.processingError || "Text extraction or indexing failed. Delete it and upload the file again.",
          type: "Document Status",
          affectsYou: true,
          actionText: "Open Documents",
          actionHref: "/documents",
          tone: "red",
        });
        iconKinds[`doc-${d.id}`] = "document";
      }

      const history = (historyRes.success ? historyRes.history : []) as {
        id: string;
        title: string;
        findings: {
          schemeName: string;
          fitLevel: string;
          blockingFactors: { issue: string; resolutionAction: string }[];
        }[];
      }[];
      const latest = history[0];

      if (!latest) {
        built.push({
          id: "no-analysis",
          title: "No eligibility alerts yet",
          description:
            "Run your first deep analysis and AROVA will turn every missing requirement into a tracked alert here.",
          type: "Getting Started",
          affectsYou: false,
          actionText: "Run Deep Analysis",
          actionHref: "/deep-analysis/new",
          tone: "violet",
        });
        iconKinds["no-analysis"] = "start";
      } else {
        let n = 0;
        for (const f of latest.findings || []) {
          for (const b of f.blockingFactors || []) {
            if (n >= 8) break;
            const resolution = b.resolutionAction.toLowerCase();
            const href = resolution.includes("upload")
              ? "/documents"
              : resolution.includes("incubator")
                ? "/dashboard/incubators"
                : "/dashboard/profile";
            const actionText = resolution.includes("upload")
              ? "Upload Document"
              : resolution.includes("incubator")
                ? "View Incubators"
                : "Update Profile";
            built.push({
              id: `blocker-${n}`,
              title: `${f.schemeName}: ${b.issue}`,
              description: `${b.resolutionAction}. Currently: ${"current" in b ? (b as { current: string }).current : "unverified"}.`,
              type: "Missing Evidence",
              affectsYou: true,
              actionText,
              actionHref: href,
              tone: "amber",
            });
            iconKinds[`blocker-${n}`] = "blocker";
            n += 1;
          }
        }
        const eligibleCount = (latest.findings || []).filter((f) => f.fitLevel === "eligible").length;
        if (eligibleCount > 0) {
          built.unshift({
            id: "eligible-summary",
            title: `${eligibleCount} ${eligibleCount === 1 ? "scheme" : "schemes"} fully satisfied in “${latest.title}”`,
            description: "Your verified evidence already meets every evaluated criterion for these schemes. Open the results to prepare applications.",
            type: "Eligibility",
            affectsYou: true,
            actionText: "View Results",
            actionHref: `/deep-analysis/${latest.id}/results`,
            tone: "emerald",
          });
          iconKinds["eligible-summary"] = "success";
        }
        if (built.length === 0) {
          built.push({
            id: "all-clear",
            title: "All requirements satisfied",
            description: `Your latest analysis (“${latest.title}”) found no blocking requirements.`,
            type: "Eligibility",
            affectsYou: true,
            actionText: "View Results",
            actionHref: `/deep-analysis/${latest.id}/results`,
            tone: "emerald",
          });
          iconKinds["all-clear"] = "success";
        }
      }

      if (docs.length === 0) {
        built.push({
          id: "no-docs",
          title: "No documents uploaded yet",
          description:
            "Scheme evaluations are far stronger with evidence. Upload DPIIT, incorporation, GST, or financial documents to unlock citations.",
          type: "Document Status",
          affectsYou: true,
          actionText: "Upload Documents",
          actionHref: "/documents",
          tone: "violet",
        });
        iconKinds["no-docs"] = "upload";
      }

      setAlerts(built);
      setKinds(iconKinds);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load alerts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8 max-w-none w-full">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Alerts</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Missing evidence and verification gaps from your own workspace — updated on every analysis.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20" role="status">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
          <span className="text-xs font-semibold text-neutral-500">Checking your workspace…</span>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-white border border-red-200 text-center space-y-3">
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
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const Icon = ICONS[kinds[alert.id] || "blocker"] || Bell;
            return (
              <div
                key={alert.id}
                className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-xl ${TONES[alert.tone]} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {alert.affectsYou && (
                        <span className="px-2 py-0.2 rounded bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider">
                          Direct Impact
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                        {alert.type}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-neutral-900">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-neutral-500 leading-relaxed max-w-3xl">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  <Link
                    href={alert.actionHref}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-violet-50 text-neutral-800 hover:text-violet-700 text-xs font-semibold transition-all"
                  >
                    <span>{alert.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
