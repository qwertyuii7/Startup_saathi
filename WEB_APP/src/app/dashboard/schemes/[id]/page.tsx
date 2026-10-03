"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  Building2,
  Landmark,
  Sparkles,
  Calendar,
  Coins,
  ShieldCheck,
  Layers,
  ChevronRight,
  Share2,
  Bookmark,
  Loader2,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDrawer } from "@/components/dashboard/DrawerProvider";
import { api } from "@/lib/api-client";

interface Criterion {
  requirementId: string;
  requirement: string;
  status: "satisfied" | "needs_verification" | "not_satisfied" | "evidence_missing";
  statusLabel: string;
  evidenceSnippet?: string;
  evidenceDocumentName?: string;
  evidencePage?: number;
  evidenceStrength: string;
  sourceCitation: { title: string; clause: string; url: string };
  aiReasoning: string;
}

interface SchemeData {
  id: string;
  name: string;
  governmentLevel: string;
  state?: string;
  description: string;
  benefits: string;
  maxBenefitDisplay: string;
  deadline?: string;
  category: string[];
  department: string;
  officialSourceTitle: string;
  officialSourceUrl: string;
  guidelineClause: string;
}

interface Evaluation {
  fitLevel: string;
  fitLabel: string;
  criteriaMetCount: number;
  totalCriteriaCount: number;
  criteriaBreakdown: Criterion[];
  blockingFactors: { issue: string; required: string; current: string; impact: string; resolutionAction: string }[];
}

function statusIcon(status: string) {
  if (status === "satisfied") return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;
  if (status === "needs_verification" || status === "evidence_missing")
    return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
  return <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
}

function statusBadge(status: string, label: string) {
  const cls =
    status === "satisfied"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : status === "needs_verification" || status === "evidence_missing"
        ? "bg-amber-50 text-amber-700 border border-amber-200"
        : "bg-rose-50 text-rose-700 border border-rose-200";
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${cls}`}>
      {label}
    </span>
  );
}

export default function SchemeDetailPage() {
  const params = useParams();
  const schemeId = params?.id as string;
  const { openDrawer } = useDrawer();

  const [activeTab, setActiveTab] = useState<"eligibility" | "benefits" | "requirements" | "evidence">("eligibility");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scheme, setScheme] = useState<SchemeData | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evalError, setEvalError] = useState("");
  const [bookmarked, setBookmarked] = useState(false);

  const load = useCallback(async () => {
    if (!schemeId) {
      setLoading(false);
      setError("No scheme selected.");
      return;
    }
    setLoading(true);
    setError("");
    setEvalError("");
    try {
      const res = await api.schemes.get(schemeId);
      if (!res.success || !res.scheme) {
        throw new Error("Scheme not found.");
      }
      setScheme(res.scheme as SchemeData);
    } catch (e: unknown) {
      setScheme(null);
      setError(e instanceof Error ? e.message : "Could not load this scheme.");
      setLoading(false);
      return;
    }
    setLoading(false);
    try {
      const evalRes = await api.schemes.evaluate(schemeId);
      const first = (evalRes.evaluations || [])[0] as Evaluation | undefined;
      if (first) setEvaluation(first);
      else setEvalError("No evaluation returned.");
    } catch (e: unknown) {
      setEvalError(e instanceof Error ? e.message : "Eligibility evaluation unavailable.");
    }
  }, [schemeId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8 space-y-6 animate-pulse">
        <div className="h-6 w-36 bg-neutral-200 rounded" />
        <div className="h-64 bg-white border border-neutral-200/80 rounded-2xl p-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-96 md:col-span-2 bg-white border border-neutral-200/80 rounded-2xl" />
          <div className="h-96 bg-white border border-neutral-200/80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 text-center space-y-4">
        <h3 className="text-xl font-medium text-neutral-900 mb-2">Scheme Not Found</h3>
        <p role="alert" className="text-sm text-neutral-500 mb-6">{error || "The requested scheme dossier could not be located."}</p>
        <div className="flex items-center justify-center gap-2">
          <Link href="/dashboard/schemes" className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Return to Schemes
          </Link>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const fitStrong = evaluation?.fitLevel === "eligible";
  const criteria = evaluation?.criteriaBreakdown || [];
  const evidenceItems = criteria.filter((c) => c.evidenceSnippet && c.evidenceDocumentName);
  const heroBadge = evaluation
    ? `${evaluation.fitLabel} (${evaluation.criteriaMetCount}/${evaluation.totalCriteriaCount})`
    : evalError
      ? "Evaluation unavailable"
      : "Evaluating…";

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col pt-2 pb-24 relative">

      {/* Navigation & Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard/schemes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Intelligence Index
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            title={bookmarked ? "Saved for this session" : "Save for this session"}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              bookmarked
                ? "bg-violet-50 border-violet-200 text-violet-700"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-violet-700" : ""}`} />
            <span>{bookmarked ? "Saved" : "Save Scheme"}</span>
          </button>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="p-2 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Hero */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 md:p-8 mb-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 text-[11px] font-semibold tracking-wide rounded-md flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-neutral-500" />
            {scheme.governmentLevel}{scheme.state ? ` · ${scheme.state}` : " · Central"}
          </span>
          <span className={`px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-md flex items-center gap-1.5 border ${
            fitStrong ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-amber-50 text-amber-700 border-amber-200/60"
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {heroBadge}
          </span>
          <span className="px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-200/60 text-[11px] font-semibold tracking-wide rounded-md flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-violet-600" />
            Max Benefit: {scheme.maxBenefitDisplay}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
          {scheme.name}
        </h1>
        <p className="text-xs text-neutral-500 font-medium mb-4 flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5 text-neutral-400" />
          Issued by: {scheme.department}
        </p>

        <p className="text-sm text-neutral-600 leading-relaxed mb-6 max-w-4xl">
          {scheme.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-100">
          <a
            href={scheme.officialSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            Apply via Official Portal
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/deep-analysis/new"
            className="px-5 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200/80 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            Run Deep Eligibility Verification
          </Link>
          <div className="ml-auto text-xs text-neutral-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            {scheme.deadline || "See official portal for deadlines"}
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex items-center gap-2 border-b border-neutral-200 mb-6 overflow-x-auto">
        {[
          { id: "eligibility", label: "Eligibility & Clause Match" },
          { id: "benefits", label: "Funding & Benefits" },
          { id: "requirements", label: "Checklist & Documents" },
          { id: "evidence", label: "Startup Evidence & Citations" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main 2-Col Content Area */}
        <div className="lg:col-span-2 space-y-4">

          {activeTab === "eligibility" && (
            <div className="space-y-3">
              <div className="p-4 bg-violet-50/50 border border-violet-100 rounded-xl mb-2 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-700 leading-relaxed">
                  AROVA evaluated your startup profile and uploaded documents against the official clauses below.
                  {evaluation ? ` Result: ${evaluation.fitLabel} (${evaluation.criteriaMetCount}/${evaluation.totalCriteriaCount} criteria).` : ""}
                </p>
              </div>

              {evalError && (
                <div role="alert" className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{evalError} Complete your profile to enable evaluation.</span>
                </div>
              )}

              {!evaluation && !evalError && (
                <div className="flex items-center gap-2 p-4 text-xs text-neutral-500">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                  <span>Evaluating your profile…</span>
                </div>
              )}

              {criteria.map((criterion) => (
                <div
                  key={criterion.requirementId}
                  className="bg-white border border-neutral-200/90 rounded-xl p-5 hover:border-neutral-300 transition-all shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    {statusIcon(criterion.status)}

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h4 className="text-sm font-semibold text-neutral-900">{criterion.requirement}</h4>
                        {statusBadge(criterion.status, criterion.statusLabel)}
                      </div>

                      <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                        {criterion.aiReasoning}
                      </p>

                      {criterion.evidenceSnippet && (
                        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 mb-2 flex items-start gap-2">
                          <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <span className="font-medium text-neutral-700">Document evidence: </span>
                            <span className="text-neutral-600 italic">“{criterion.evidenceSnippet.slice(0, 280)}{criterion.evidenceSnippet.length > 280 ? "…" : ""}”</span>
                            <span className="block text-[11px] text-neutral-400 mt-1">
                              Source: {criterion.evidenceDocumentName}
                              {typeof criterion.evidencePage === "number" ? ` — Page ${criterion.evidencePage}` : ""}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-neutral-400 font-mono">
                          Clause: {criterion.sourceCitation.clause} · {criterion.sourceCitation.title}
                        </span>
                        <button
                          onClick={() => openDrawer('proof', {
                            requirement: criterion.requirement,
                            statusLabel: criterion.statusLabel,
                            reasoning: criterion.aiReasoning,
                            evidenceSnippet: criterion.evidenceSnippet,
                            evidenceDocumentName: criterion.evidenceDocumentName,
                            evidencePage: criterion.evidencePage,
                            clause: criterion.sourceCitation.clause,
                            sourceTitle: criterion.sourceCitation.title,
                            sourceUrl: criterion.sourceCitation.url,
                          })}
                          className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
                        >
                          <span>Inspect Clause & Proof</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "benefits" && (
            <div className="space-y-4">
              <div className="bg-white border border-neutral-200/90 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-violet-600" />
                  Grant Structure & Benefits
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{scheme.benefits}</p>
                <div className="mt-4 p-4 bg-violet-50/60 border border-violet-100 rounded-xl text-xs text-neutral-700">
                  <span className="font-bold">Maximum benefit: </span>{scheme.maxBenefitDisplay}
                  <span className="block text-[11px] text-neutral-500 mt-1">
                    Source: {scheme.officialSourceTitle} ({scheme.guidelineClause}) —{" "}
                    <a href={scheme.officialSourceUrl} target="_blank" rel="noreferrer" className="text-violet-700 hover:underline">
                      official portal
                    </a>
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "requirements" && (
            <div className="bg-white border border-neutral-200/90 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-700" />
                Requirement Checklist
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Each official requirement with your current verification status.
              </p>
              <div className="space-y-2.5">
                {criteria.length === 0 && (
                  <p className="text-xs text-neutral-500">
                    {evalError ? "Evaluation unavailable — complete your profile first." : "Evaluating…"}
                  </p>
                )}
                {criteria.map((c) => (
                  <div key={c.requirementId} className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-lg border border-neutral-100 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {statusIcon(c.status)}
                      <span className="text-xs font-medium text-neutral-800">{c.requirement}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase bg-neutral-200/60 px-2 py-0.5 rounded shrink-0">
                      {c.statusLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "evidence" && (
            <div className="bg-white border border-neutral-200/90 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-600" />
                Your Evidence for This Scheme
              </h3>
              {evidenceItems.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-neutral-300 text-center">
                  <HelpCircle className="w-6 h-6 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-neutral-700">No document evidence matched yet</p>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Upload DPIIT, incorporation, GST, or financial documents on the{" "}
                    <Link href="/documents" className="text-violet-700 hover:underline">Documents page</Link>{" "}
                    and they will be cited here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {evidenceItems.map((c) => (
                    <div key={c.requirementId} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50">
                      <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 mb-1">
                        <span>{c.requirement}</span>
                        {statusBadge(c.status, c.statusLabel)}
                      </div>
                      <p className="text-xs text-neutral-600 italic mb-2">
                        “{c.evidenceSnippet?.slice(0, 300)}{(c.evidenceSnippet?.length || 0) > 300 ? "…" : ""}”
                      </p>
                      <span className="text-[11px] text-neutral-400">
                        Source: {c.evidenceDocumentName}
                        {typeof c.evidencePage === "number" ? ` (Page ${c.evidencePage})` : ""} · {c.sourceCitation.clause}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Sidebar Intelligence Card */}
        <div className="space-y-4">

          <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Quick Summary</h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Government Body</span>
                <span className="font-semibold text-neutral-900 text-right">{scheme.department}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Level</span>
                <span className="font-semibold text-neutral-900 text-right">
                  {scheme.governmentLevel}{scheme.state ? ` · ${scheme.state}` : ""}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Maximum Benefit</span>
                <span className="font-semibold text-emerald-700 text-right">{scheme.maxBenefitDisplay}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Your Match</span>
                <span className="font-semibold text-neutral-900 text-right">{heroBadge}</span>
              </div>
            </div>

            <a
              href={scheme.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Visit Official Scheme Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* AI Strategy Advice Card — derived from the real evaluation */}
          <div className="bg-gradient-to-br from-violet-900 to-neutral-950 text-white rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-300" />
              <h4 className="text-xs font-semibold text-violet-200 tracking-wide uppercase">AROVA Recommendation</h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {!evaluation
                ? "Complete your profile to receive a personalized recommendation for this scheme."
                : evaluation.fitLevel === "eligible"
                  ? `You satisfy all ${evaluation.totalCriteriaCount} evaluated criteria for this scheme. Prepare your application dossier and apply via the official portal.`
                  : evaluation.blockingFactors[0]
                    ? `Next step: ${evaluation.blockingFactors[0].resolutionAction}. (${evaluation.criteriaMetCount}/${evaluation.totalCriteriaCount} criteria satisfied.)`
                    : "Review the unmet criteria above and upload the missing evidence."}
            </p>
            <Link
              href="/deep-analysis/new"
              className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              Generate Custom Action Plan
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
