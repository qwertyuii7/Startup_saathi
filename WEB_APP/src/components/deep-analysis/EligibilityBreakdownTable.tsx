"use client";

import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  HelpCircle, 
  FileText, 
  ChevronRight, 
  Scale 
} from "lucide-react";
import { EligibilityCriterion, EligibilityStatus } from "@/types/deep-analysis";

interface EligibilityBreakdownTableProps {
  criteria: EligibilityCriterion[];
  onSelectCriterion: (criterion: EligibilityCriterion) => void;
}

export function EligibilityBreakdownTable({
  criteria,
  onSelectCriterion,
}: EligibilityBreakdownTableProps) {
  
  const getStatusBadge = (status: EligibilityStatus) => {
    switch (status) {
      case "satisfied":
        return {
          label: "✓ Satisfied",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
        };
      case "needs_verification":
        return {
          label: "! Needs Verification",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: HelpCircle,
        };
      case "not_satisfied":
        return {
          label: "× Not Satisfied",
          className: "bg-rose-50 text-rose-700 border-rose-200",
          icon: XCircle,
        };
      case "evidence_missing":
        return {
          label: "— Evidence Missing",
          className: "bg-neutral-100 text-neutral-600 border-neutral-300",
          icon: AlertCircle,
        };
    }
  };

  return (
    <div className="overflow-x-auto border border-neutral-200 rounded-xl bg-white shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-neutral-50/90 border-b border-neutral-200 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            <th className="py-3 px-4 w-[38%]">Requirement</th>
            <th className="py-3 px-3 w-[18%]">Your Status</th>
            <th className="py-3 px-4 w-[24%]">Evidence</th>
            <th className="py-3 px-3 w-[16%]">Source</th>
            <th className="py-3 px-2 w-[4%] text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {criteria.map((crit) => {
            const statusConfig = getStatusBadge(crit.status);
            const StatusIcon = statusConfig.icon;

            return (
              <tr
                key={crit.id}
                onClick={() => onSelectCriterion(crit)}
                className="hover:bg-violet-50/50 cursor-pointer transition-colors group"
              >
                {/* Requirement text */}
                <td className="py-3 px-4 font-medium text-neutral-900 group-hover:text-violet-900">
                  <div className="flex items-start gap-2">
                    <span className="text-neutral-300 group-hover:text-violet-400 mt-0.5">•</span>
                    <span>{crit.requirement}</span>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${statusConfig.className}`}>
                    <StatusIcon className="w-3 h-3 shrink-0" />
                    <span>{statusConfig.label}</span>
                  </span>
                </td>

                {/* Evidence snippet */}
                <td className="py-3 px-4 text-neutral-600">
                  {crit.evidence ? (
                    <div className="flex items-center gap-1.5 text-[11px] group-hover:text-violet-700">
                      <FileText className="w-3.5 h-3.5 text-neutral-400 group-hover:text-violet-500 shrink-0" />
                      <span className="truncate max-w-[180px] font-medium">
                        {crit.evidence.documentName}
                      </span>
                      <span className="text-neutral-400 text-[10px] shrink-0">
                        (Pg {crit.evidence.pageNumber})
                      </span>
                    </div>
                  ) : (
                    <span className="text-neutral-400 text-[11px] italic">
                      No document attached
                    </span>
                  )}
                </td>

                {/* Official Source */}
                <td className="py-3 px-3 text-neutral-500">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Scale className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="truncate max-w-[130px]" title={crit.officialSource.title}>
                      {crit.officialSource.title}
                    </span>
                  </div>
                </td>

                {/* Arrow hint */}
                <td className="py-3 px-2 text-right">
                  <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-violet-600 transition-colors inline-block" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
