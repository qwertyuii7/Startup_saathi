"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle, 
  XCircle, 
  Sparkles,
  Scale 
} from "lucide-react";
import { Scheme } from "@/types/deep-analysis";

interface SchemeComparisonTableProps {
  schemes: Scheme[];
  onSelectScheme: (scheme: Scheme) => void;
}

export function SchemeComparisonTable({
  schemes,
  onSelectScheme,
}: SchemeComparisonTableProps) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const filteredSchemes = schemes.filter((s) => {
    const matchesFilter = 
      filter === "all" ? true :
      filter === "eligible" ? s.fitLevel === "eligible" :
      filter === "potential" ? s.fitLevel === "potential" :
      filter === "missing" ? s.fitLevel === "missing_requirement" :
      filter === "not_eligible" ? s.fitLevel === "not_eligible" : true;

    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.shortName.toLowerCase().includes(search.toLowerCase()) ||
      s.level.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-5 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-neutral-900 text-lg tracking-tight">
              Scheme Cross-Comparison Matrix
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Side-by-side assessment of central & state grants, missing items, and evidence strength.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes..."
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:bg-white focus:border-violet-400 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: "all", label: "All Schemes" },
          { id: "eligible", label: "Eligible" },
          { id: "potential", label: "Potential" },
          { id: "missing", label: "Missing Info" },
          { id: "not_eligible", label: "Not Eligible" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              filter === tab.id
                ? "bg-violet-50 text-violet-800 border-violet-300 font-semibold shadow-2xs"
                : "bg-neutral-50/60 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto border border-neutral-200 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-[28%]">Scheme</th>
              <th className="py-3 px-3 w-[12%]">Level</th>
              <th className="py-3 px-4 w-[24%]">Potential Benefit</th>
              <th className="py-3 px-3 w-[14%]">Eligibility</th>
              <th className="py-3 px-3 w-[12%]">Missing Items</th>
              <th className="py-3 px-3 w-[10%]">Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredSchemes.map((scheme) => {
              const isEligible = scheme.fitLevel === "eligible";
              const isPotential = scheme.fitLevel === "potential";
              const isMissing = scheme.fitLevel === "missing_requirement";

              return (
                <tr
                  key={scheme.id}
                  onClick={() => onSelectScheme(scheme)}
                  className="hover:bg-violet-50/50 cursor-pointer transition-colors group"
                >
                  {/* Scheme Name */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-900 group-hover:text-violet-700">
                    <div className="flex flex-col">
                      <span>{scheme.name}</span>
                      <span className="text-[10px] text-neutral-400 font-normal mt-0.5">
                        {scheme.category.join(", ")}
                      </span>
                    </div>
                  </td>

                  {/* Level */}
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase rounded-md">
                      {scheme.level === "State" ? `${scheme.stateName}` : "Central"}
                    </span>
                  </td>

                  {/* Potential Benefit */}
                  <td className="py-3.5 px-4 font-medium text-neutral-800">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-violet-500 shrink-0" />
                      <span className="truncate max-w-[220px]" title={scheme.maxBenefit}>
                        {scheme.maxBenefit}
                      </span>
                    </div>
                  </td>

                  {/* Eligibility Status */}
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${
                      isEligible
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : isPotential
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : isMissing
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {scheme.fitLabel}
                    </span>
                  </td>

                  {/* Missing Items */}
                  <td className="py-3.5 px-3 text-neutral-600">
                    {scheme.blockingFactors.length > 0 ? (
                      <span className="text-amber-700 font-medium text-[11px]">
                        {scheme.blockingFactors.length} Requirement(s)
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium text-[11px]">None (Complete)</span>
                    )}
                  </td>

                  {/* Evidence Strength */}
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      isEligible 
                        ? "bg-emerald-100 text-emerald-800" 
                        : isPotential 
                        ? "bg-amber-100 text-amber-800" 
                        : "bg-neutral-100 text-neutral-600"
                    }`}>
                      {isEligible ? "Strong" : isPotential ? "Partial" : "Weak"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
