"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertOctagon, 
  Target, 
  TrendingUp, 
  Loader2, 
  FileText,
  User,
  MapPin,
  Building2,
  DollarSign,
  Users
} from "lucide-react";

export default function WorkspaceOverviewPage() {
  const { analysis, isLoading, error } = useWorkspaceAnalysis();
  const router = useRouter();
  const [startup, setStartup] = useState<{
    stage?: string; startupStage?: string;
    industry?: string; sector?: string;
    city?: string; state?: string;
    annualTurnover?: number; turnoverDisplay?: string;
    employees?: number;
    updatedAt?: string;
  } | null>(null);
  const [latestDocAt, setLatestDocAt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/startup/profile", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => { if (d?.success && d.startup) setStartup(d.startup); })
      .catch(() => undefined);
    fetch("/api/documents", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        const docs = d?.documents || [];
        const latest = docs
          .map((x: { uploadedAt?: string }) => x.uploadedAt)
          .filter(Boolean)
          .sort()
          .pop();
        if (latest) setLatestDocAt(latest);
      })
      .catch(() => undefined);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Founder Workspace...</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-neutral-400" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">No Active Intelligence</h2>
        <p className="text-sm text-neutral-500 max-w-md mb-8 leading-relaxed">
          AROVA needs to analyze your startup profile and uploaded documents against government knowledge bases to build your intelligence workspace.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/deep-analysis/new" className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl transition-all shadow-md">
            Start Deep Analysis
          </Link>
          <Link href="/deep-analysis/history" className="px-6 py-3 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-sm rounded-xl transition-all">
            View History
          </Link>
        </div>
      </div>
    );
  }

  const missingReqs = analysis.findings.flatMap(s => s.blockingFactors).length;
  const snapshot = {
    stage: startup?.stage || startup?.startupStage || "—",
    sector: startup?.industry || startup?.sector || "—",
    location: [startup?.city, startup?.state].filter(Boolean).join(", ") || "India",
    revenue: typeof startup?.annualTurnover === "number"
      ? `₹${startup.annualTurnover.toLocaleString("en-IN")}`
      : startup?.turnoverDisplay || "—",
    team: typeof startup?.employees === "number" ? String(startup.employees) : "—",
  };
  const staleEvidence = (() => {
    try {
      if (!analysis?.updatedAt) return false;
      const a = new Date(analysis.updatedAt).getTime();
      if (startup?.updatedAt && new Date(startup.updatedAt).getTime() > a) return true;
      if (latestDocAt && new Date(latestDocAt).getTime() > a) return true;
      return false;
    } catch { return false; }
  })();

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER / FOUNDER BRIEFING */}
      <section>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Founder Briefing</h1>
        <p className="text-sm text-neutral-500 max-w-2xl leading-relaxed">
          AROVA analyzed your startup using your current profile, uploaded documents, and official scheme requirements. Here is exactly what is happening with your startup right now.
        </p>
      </section>

      {/* STARTUP SNAPSHOT */}
      <section className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b border-neutral-100 pb-4">
          <h2 className="text-sm font-bold text-neutral-900 tracking-wider uppercase">Startup Snapshot</h2>
          <Link href="/profile" className="text-[11px] font-bold text-violet-600 hover:text-violet-700">Update Profile</Link>
        </div>

        {staleEvidence && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
            New evidence available — re-run analysis to refresh these results.
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Stage</div>
            <div className="text-sm font-bold text-neutral-900">{snapshot.stage}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Target className="w-3 h-3" /> Sector</div>
            <div className="text-sm font-bold text-neutral-900">{snapshot.sector}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Location</div>
            <div className="text-sm font-bold text-neutral-900">{snapshot.location}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> Revenue</div>
            <div className="text-sm font-bold text-neutral-900">{snapshot.revenue}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Users className="w-3 h-3" /> Team</div>
            <div className="text-sm font-bold text-neutral-900">{snapshot.team}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Evidence</div>
            <div className="text-sm font-bold text-violet-600">Active</div>
          </div>
        </div>
      </section>

      {/* EXECUTIVE INSIGHTS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strongest Position */}
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
          <div className="flex items-center gap-2 mb-3 text-emerald-800">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Strongest Position</h3>
          </div>
          <p className="text-sm font-semibold text-emerald-900 mb-1">
            You are fully eligible for {analysis.eligibleCount} schemes.
          </p>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Based on verified evidence in your documents, AROVA has mathematically proven your eligibility. You are ready to apply.
          </p>
        </div>

        {/* Biggest Blocker / Gap */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-2 mb-3 text-amber-800">
            <AlertOctagon className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Biggest Blocker</h3>
          </div>
          <p className="text-sm font-semibold text-amber-900 mb-1">
            {missingReqs} requirements are missing evidence.
          </p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Your startup matches {analysis.potentialCount} potential schemes, but AROVA cannot find the required documents to verify eligibility.
          </p>
        </div>
      </section>

      {/* INTELLIGENCE METRICS */}
      <section>
        <h2 className="text-sm font-bold text-neutral-900 tracking-wider uppercase mb-4">Analysis Coverage</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Schemes Evaluated</div>
            <div className="text-3xl font-black text-neutral-900 mt-2">{analysis.schemesAnalyzedCount}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Eligible Matches</div>
            <div className="text-3xl font-black text-emerald-600 mt-2">{analysis.eligibleCount}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Missing Evidence</div>
            <div className="text-3xl font-black text-amber-600 mt-2">{missingReqs}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Recommended Actions</div>
            <div className="text-3xl font-black text-violet-600 mt-2">{analysis.actionPlan?.length || 0}</div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="flex flex-wrap items-center gap-3 pt-6 border-t border-neutral-200">
        <Link href={`/deep-analysis/schemes?id=${analysis.id}`} className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2">
          View Scheme Matches <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link href={`/deep-analysis/gaps?id=${analysis.id}`} className="px-5 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold rounded-xl transition-all">
          View Startup Gap Map
        </Link>
        <Link href={`/deep-analysis/action-plan?id=${analysis.id}`} className="px-5 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold rounded-xl transition-all">
          Open Action Plan
        </Link>
      </section>
    </div>
  );
}
