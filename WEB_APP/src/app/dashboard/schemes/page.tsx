"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, CheckCircle2, AlertCircle, ArrowRight, Loader2, RefreshCw, XCircle } from "lucide-react";
import { api } from "@/lib/api-client";

interface Fit {
  schemeId: string;
  fitLevel: string;
  fitLabel: string;
  criteriaMetCount: number;
  totalCriteriaCount: number;
}

export default function SchemesDiscoveryPage() {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [fits, setFits] = useState<Record<string, Fit>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<"all" | "Central" | "State">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [evalLoading, setEvalLoading] = useState(false);
  const [error, setError] = useState("");
  const [evalError, setEvalError] = useState("");

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setEvalError("");
    try {
      const res = await api.schemes.list();
      if (res.success && res.schemes) {
        setSchemes(res.schemes);
      } else {
        throw new Error("Could not load schemes.");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load schemes.");
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    // Real per-user eligibility evaluation (profile + own documents).
    setEvalLoading(true);
    try {
      const evalRes = await api.schemes.evaluate();
      const map: Record<string, Fit> = {};
      for (const f of (evalRes.evaluations || []) as Fit[]) {
        map[f.schemeId] = f;
      }
      setFits(map);
    } catch (e: unknown) {
      setEvalError(e instanceof Error ? e.message : "Eligibility evaluation unavailable.");
    } finally {
      setEvalLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.benefits.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = filterLevel === "all" || s.governmentLevel === filterLevel;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-8 max-w-none w-full">
      {/* Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Scheme Discovery</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Official central and state government programs evaluated against your verified startup profile.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes, departments..."
              className="pl-9 pr-4 py-2 bg-white border border-neutral-200/90 rounded-xl text-xs text-neutral-900 outline-none focus:border-violet-500 transition-all w-60 sm:w-72"
            />
          </div>

          <div className="flex items-center bg-white border border-neutral-200/90 rounded-xl p-0.5 text-xs font-semibold">
            {[
              { id: "all", label: "All" },
              { id: "Central", label: "Central" },
              { id: "State", label: "State" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterLevel(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterLevel === tab.id
                    ? "bg-violet-600 text-white shadow-2xs"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schemes Grid List */}
      {evalError && (
        <div role="alert" className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Personalized eligibility is unavailable ({evalError}). Showing the official scheme catalog.</span>
        </div>
      )}
      {filteredSchemes.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-dashed border-neutral-300 text-center">
          <p className="text-sm font-semibold text-neutral-700">No schemes match your filters</p>
          <p className="text-xs text-neutral-500 mt-1">Try a different search or level filter.</p>
        </div>
      ) : null}
      <div className="space-y-4">
        {filteredSchemes.map((scheme) => {
          const fit = fits[scheme.id];
          const strong = fit?.fitLevel === "eligible";
          const weak = fit && (fit.fitLevel === "not_eligible");
          const fitLabel = !fit
            ? evalLoading ? "Evaluating…" : "Not evaluated"
            : `${fit.fitLabel} (${fit.criteriaMetCount}/${fit.totalCriteriaCount})`;
          const fitClass = !fit
            ? "bg-neutral-100 text-neutral-500 border-neutral-200"
            : strong
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : weak
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-amber-50 text-amber-700 border-amber-100";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
        <span className="text-xs font-semibold text-neutral-500">Loading official schemes…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 rounded-2xl bg-white border border-red-200 text-center space-y-3">
        <p role="alert" className="text-xs text-red-600 font-medium">{error}</p>
        <button
          type="button"
          onClick={loadAll}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
            <div
              key={scheme.id}
              className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                    {scheme.governmentLevel} {scheme.state ? `· ${scheme.state}` : ""}
                  </span>
                  
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${fitClass}`}>
                    {strong ? <CheckCircle2 className="w-3 h-3" /> : weak ? <XCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>{fitLabel}</span>
                  </span>

                  <span className="text-xs text-neutral-400">
                    · {scheme.department}
                  </span>
                </div>

                <h3 className="text-base font-bold text-neutral-900 group-hover:text-violet-600 transition-colors">
                  {scheme.name}
                </h3>

                <p className="text-xs text-neutral-500 leading-relaxed max-w-3xl">
                  {scheme.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-700 pt-1">
                  <div>
                    <span className="text-neutral-400 font-normal">Max Benefit: </span>
                    <strong className="text-violet-700 font-semibold">{scheme.maxBenefitDisplay}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-normal">Deadline: </span>
                    <span>{scheme.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end gap-2">
                <Link
                  href={`/dashboard/schemes/${scheme.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-2xs transition-all"
                >
                  <span>View Eligibility</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
