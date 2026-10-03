"use client";

import { CheckCircle2, AlertCircle, HelpCircle, XCircle, Search, Filter } from "lucide-react";
import { SchemeFitLevel } from "@/types/deep-analysis";

interface AnalysisSummaryRowProps {
  selectedFilter: SchemeFitLevel | "all";
  onSelectFilter: (filter: SchemeFitLevel | "all") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  counts: {
    total: number;
    eligible: number;
    potential: number;
    missing_requirement: number;
    not_eligible: number;
  };
}

export function AnalysisSummaryRow({
  selectedFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  counts,
}: AnalysisSummaryRowProps) {
  const filterPills = [
    {
      id: "all" as const,
      label: "All Schemes",
      count: counts.total,
      color: "neutral",
    },
    {
      id: "eligible" as const,
      label: "Eligible",
      count: counts.eligible,
      color: "emerald",
      icon: CheckCircle2,
    },
    {
      id: "potential" as const,
      label: "Potential Matches",
      count: counts.potential,
      color: "amber",
      icon: HelpCircle,
    },
    {
      id: "missing_requirement" as const,
      label: "Missing Requirements",
      count: counts.missing_requirement,
      color: "orange",
      icon: AlertCircle,
    },
    {
      id: "not_eligible" as const,
      label: "Not Eligible",
      count: counts.not_eligible,
      color: "rose",
      icon: XCircle,
    },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-xs mb-6">
      
      {/* Top Title & Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-neutral-900 text-lg">
              Analysis Findings
            </h3>
            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-bold rounded-md">
              {counts.total} Analyzed
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Transparent evidentiary classification. Zero arbitrary or ungrounded guessing scores.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search schemes or clauses..."
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:bg-white focus:border-violet-400 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs / Pills */}
      <div className="flex flex-wrap gap-2">
        {filterPills.map((pill) => {
          const isSelected = selectedFilter === pill.id;
          const Icon = pill.icon;

          return (
            <button
              key={pill.id}
              onClick={() => onSelectFilter(pill.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                isSelected
                  ? pill.color === "emerald"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs font-semibold"
                    : pill.color === "amber"
                    ? "bg-amber-50 border-amber-300 text-amber-800 shadow-2xs font-semibold"
                    : pill.color === "orange"
                    ? "bg-orange-50 border-orange-300 text-orange-800 shadow-2xs font-semibold"
                    : pill.color === "rose"
                    ? "bg-rose-50 border-rose-300 text-rose-800 shadow-2xs font-semibold"
                    : "bg-neutral-900 border-neutral-900 text-white shadow-2xs font-semibold"
                  : "bg-neutral-50/70 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{pill.label}</span>
              <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-md ${
                isSelected 
                  ? pill.color === "neutral" ? "bg-neutral-800 text-white" : "bg-white/80" 
                  : "bg-neutral-200/60 text-neutral-700"
              }`}>
                {pill.count}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
