"use client";

import { 
  Building2, 
  MapPin, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Award
} from "lucide-react";
import { Incubator } from "@/types/deep-analysis";

interface IncubatorMatchesSectionProps {
  incubators: Incubator[];
  onStartApplication: (incubator: Incubator) => void;
}

export function IncubatorMatchesSection({
  incubators,
  onStartApplication,
}: IncubatorMatchesSectionProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-7 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-neutral-900 text-lg tracking-tight">
              Recommended Incubator Opportunities
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Empaneled partner incubators authorized to disburse Seed Fund (SISFS) and state sustenance grants.
          </p>
        </div>

        <span className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-xl border border-violet-200 self-start sm:self-auto">
          {incubators.length} Matching Centers
        </span>
      </div>

      {/* Incubator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {incubators.map((inc) => (
          <div
            key={inc.id}
            className="border border-neutral-200 hover:border-violet-200 rounded-2xl p-5 bg-neutral-50/40 hover:bg-white transition-all shadow-2xs hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Status Badge & Location */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                  inc.applicationStatus === "Open"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : inc.applicationStatus === "Closing Soon"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                  ● {inc.applicationStatus}
                </span>

                <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  <span className="truncate max-w-[140px]">{inc.location}</span>
                </div>
              </div>

              {/* Incubator Name */}
              <h4 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug mb-1.5">
                {inc.name}
              </h4>

              {/* Focus Area */}
              <div className="text-xs text-neutral-500 mb-3 flex items-start gap-1">
                <span className="font-medium text-neutral-700">Focus:</span>
                <span>{inc.focusArea}</span>
              </div>

              {/* Why Matched Box */}
              <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-3 text-xs text-violet-950 mb-3.5">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-violet-700 mb-1">
                  <Sparkles className="w-3 h-3" />
                  Why matched
                </div>
                <p className="text-[11px] leading-relaxed text-violet-900">
                  {inc.matchReason}
                </p>
              </div>

              {/* Key Benefits List */}
              <div className="space-y-1 mb-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Key Benefits & Grants
                </div>
                {inc.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-neutral-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="text-[11px]">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Actions */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
              <a
                href={inc.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <span>Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => onStartApplication(inc)}
                className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>Start Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
