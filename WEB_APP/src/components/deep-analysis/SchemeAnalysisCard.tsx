"use client";

import { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  XCircle, 
  HelpCircle, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Scale
} from "lucide-react";
import { Scheme, EligibilityCriterion } from "@/types/deep-analysis";
import { EligibilityBreakdownTable } from "./EligibilityBreakdownTable";
import { WhyYouQualifySection } from "./WhyYouQualifySection";
import { WhyYouDontQualifySection } from "./WhyYouDontQualifySection";

interface SchemeAnalysisCardProps {
  scheme: Scheme;
  onOpenEvidence: (criterion: EligibilityCriterion) => void;
  onOpenOfficialSource: (url: string) => void;
  onDraftApplication: (scheme: Scheme) => void;
  defaultExpanded?: boolean;
}

export function SchemeAnalysisCard({
  scheme,
  onOpenEvidence,
  onOpenOfficialSource,
  onDraftApplication,
  defaultExpanded = false,
}: SchemeAnalysisCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getStatusBadge = () => {
    switch (scheme.fitLevel) {
      case "eligible":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          label: "✓ Eligible",
        };
      case "potential":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: HelpCircle,
          label: "! Potentially Eligible",
        };
      case "missing_requirement":
        return {
          bg: "bg-orange-50 text-orange-700 border-orange-200",
          icon: AlertCircle,
          label: "⚠ Missing Requirement",
        };
      case "not_eligible":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: XCircle,
          label: "× Not Eligible",
        };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  return (
    <div className={`bg-white border rounded-2xl transition-all ${
      isExpanded 
        ? "border-violet-300 ring-1 ring-violet-200/50 shadow-sm" 
        : "border-neutral-200 hover:border-neutral-300 shadow-2xs"
    }`}>
      
      {/* Top Card Header / Summary Clickable Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 sm:p-6 cursor-pointer select-none"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Scheme Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-neutral-200">
                {scheme.level === "State" ? `${scheme.stateName} State` : "Central Government"}
              </span>

              {scheme.category.map((cat, i) => (
                <span key={i} className="px-2 py-0.5 bg-neutral-50 text-neutral-500 text-[10px] font-medium rounded-md border border-neutral-200/60">
                  {cat}
                </span>
              ))}

              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border flex items-center gap-1 ${statusBadge.bg}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{statusBadge.label}</span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight group-hover:text-violet-600 transition-colors">
              {scheme.name}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-500 mt-1 line-clamp-2">
              {scheme.benefitDescription}
            </p>

            {/* Benefit Max Highlight */}
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-violet-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Benefit: {scheme.maxBenefit}</span>
            </div>
          </div>

          {/* Right Metrics & Expand CTA */}
          <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
            <div className="flex flex-col items-start lg:items-end">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                <span className={scheme.criteriaMetCount === scheme.totalCriteriaCount ? "text-emerald-600" : "text-neutral-700"}>
                  {scheme.criteriaMetCount} of {scheme.totalCriteriaCount}
                </span>
                <span className="text-neutral-400 font-normal">criteria satisfied</span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-0.5">
                {scheme.deadline || "Rolling Evaluation"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1.5 bg-neutral-100 hover:bg-violet-50 text-neutral-700 hover:text-violet-700 text-xs font-medium rounded-xl border border-neutral-200 hover:border-violet-200 transition-colors flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                <span>{isExpanded ? "Less" : "Full Analysis"}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

          </div>

        </div>

        {/* Quick Criteria Preview List (when collapsed) */}
        {!isExpanded && (
          <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap gap-2 text-xs">
            {scheme.criteria.slice(0, 3).map((crit) => (
              <div 
                key={crit.id}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-50 rounded-lg border border-neutral-200/70 text-neutral-700 text-[11px]"
              >
                <span className={crit.status === "satisfied" ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                  {crit.status === "satisfied" ? "✓" : "!"}
                </span>
                <span className="truncate max-w-[200px]">{crit.requirement}</span>
              </div>
            ))}
            {scheme.criteria.length > 3 && (
              <span className="text-[11px] text-neutral-400 self-center">
                +{scheme.criteria.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expanded Detailed Section (Progressive Disclosure) */}
      {isExpanded && (
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-neutral-100 space-y-6 animate-in fade-in-50">
          
          {/* Action Header in Expanded View */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80">
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <Scale className="w-4 h-4 text-violet-600" />
              <span>Official Reference:</span>
              <strong className="text-neutral-900 font-medium truncate max-w-md">
                {scheme.officialSourceTitle}
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenOfficialSource(scheme.officialSourceUrl)}
                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg border border-neutral-200 transition-colors"
              >
                <span>Open Official Source</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </button>

              {scheme.fitLevel !== "not_eligible" && (
                <button
                  type="button"
                  onClick={() => onDraftApplication(scheme)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Draft Application</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 10: Condition-by-condition Breakdown Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider text-xs">
                Eligibility Breakdown & Criteria Verification
              </h4>
              <span className="text-[11px] text-neutral-400">Click row to inspect documentary evidence</span>
            </div>
            
            <EligibilityBreakdownTable
              criteria={scheme.criteria}
              onSelectCriterion={onOpenEvidence}
            />
          </div>

          {/* Section 12: Why You Qualify Structured Reasoning */}
          {scheme.qualifyingFactors.length > 0 && (
            <WhyYouQualifySection
              schemeName={scheme.name}
              factors={scheme.qualifyingFactors}
              criteria={scheme.criteria.filter(c => c.status === "satisfied")}
              onViewEvidence={onOpenEvidence}
            />
          )}

          {/* Section 13: Why You Don't Qualify / Blocking Items */}
          {scheme.blockingFactors.length > 0 && (
            <WhyYouDontQualifySection
              blockingFactors={scheme.blockingFactors}
              onResolveAction={(action) => {
                alert(`Action initiated: ${action}`);
              }}
            />
          )}

        </div>
      )}

    </div>
  );
}
