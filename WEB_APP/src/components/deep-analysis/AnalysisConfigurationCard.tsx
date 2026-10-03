"use client";

import { useState } from "react";
import { Sliders, HelpCircle, Check, MapPin, Layers, Briefcase, Zap } from "lucide-react";
import { AnalysisConfiguration, GeographyType, AnalysisDepth } from "@/types/deep-analysis";

interface AnalysisConfigurationCardProps {
  config: AnalysisConfiguration;
  onChange: (updated: AnalysisConfiguration) => void;
}

const SCHEME_TYPES = [
  "Grants",
  "Loans",
  "Subsidies",
  "Tax Benefits",
  "Equity Support",
  "Incubation",
  "Infrastructure",
  "Export Support",
];

const STATES = [
  "Uttar Pradesh",
  "Karnataka",
  "Maharashtra",
  "Delhi NCR",
  "Telangana",
  "Tamil Nadu",
  "Gujarat",
  "Rajasthan",
];

const INDUSTRIES = [
  "Technology / SaaS",
  "AI & DeepTech",
  "FinTech",
  "HealthTech & Biotech",
  "Agritech",
  "EdTech",
  "CleanTech / EV",
  "Hardware & Electronics",
];

const STAGES = [
  "Idea / Pre-Seed",
  "Early Stage",
  "Seed Stage",
  "Growth / Scaling",
];

export function AnalysisConfigurationCard({
  config,
  onChange,
}: AnalysisConfigurationCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const toggleSchemeType = (type: string) => {
    const current = config.schemeTypes;
    const exists = current.includes(type);
    const updated = exists 
      ? current.filter(t => t !== type) 
      : [...current, type];
    onChange({ ...config, schemeTypes: updated });
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-xs">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-semibold text-neutral-900 text-base">
            Analysis Configuration
          </h3>
        </div>
        <span className="text-xs text-neutral-400">Customizable scope & depth</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        
        {/* Geography */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-2">
            Jurisdiction
          </label>
          <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-1 rounded-xl">
            {(["central", "state", "both"] as GeographyType[]).map((geo) => (
              <button
                key={geo}
                type="button"
                onClick={() => onChange({ ...config, geography: geo })}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg capitalize transition-all ${
                  config.geography === geo
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {geo === "both" ? "Both" : geo === "central" ? "Central" : "State"}
              </button>
            ))}
          </div>
        </div>

        {/* State Selector */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-neutral-400" />
            <span>State Government</span>
          </label>
          <select
            value={config.selectedState}
            onChange={(e) => onChange({ ...config, selectedState: e.target.value })}
            className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:border-violet-400 focus:bg-white transition-colors"
          >
            {STATES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-2 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-neutral-400" />
            <span>Target Sector</span>
          </label>
          <select
            value={config.industry}
            onChange={(e) => onChange({ ...config, industry: e.target.value })}
            className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:border-violet-400 focus:bg-white transition-colors"
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Startup Stage */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-2 flex items-center gap-1">
            <Layers className="w-3 h-3 text-neutral-400" />
            <span>Startup Stage</span>
          </label>
          <select
            value={config.stage}
            onChange={(e) => onChange({ ...config, stage: e.target.value })}
            className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:border-violet-400 focus:bg-white transition-colors"
          >
            {STAGES.map((stg) => (
              <option key={stg} value={stg}>{stg}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Scheme Types Multi-Select */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-neutral-600">
            Scheme Categories (Multi-select)
          </label>
          <span className="text-[11px] text-neutral-400">
            {config.schemeTypes.length} of {SCHEME_TYPES.length} selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SCHEME_TYPES.map((type) => {
            const isSelected = config.schemeTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleSchemeType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-violet-50 text-violet-700 border-violet-300 font-semibold"
                    : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                  isSelected ? "bg-violet-600 border-violet-600 text-white" : "border-neutral-300 bg-white"
                }`}>
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                </div>
                <span>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Analysis Depth */}
      <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-600" />
          <span className="text-xs font-medium text-neutral-700">Analysis Depth:</span>
          
          <div className="relative inline-block">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            {showTooltip && (
              <div className="absolute left-0 bottom-6 z-30 w-72 p-2.5 bg-neutral-900 text-white text-[11px] rounded-lg shadow-lg leading-relaxed animate-in fade-in-50">
                Deep analysis checks individual eligibility conditions and validates them condition-by-condition against available evidence.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
          {(["quick", "standard", "deep"] as AnalysisDepth[]).map((depth) => {
            const isSelected = config.depth === depth;
            return (
              <button
                key={depth}
                type="button"
                onClick={() => onChange({ ...config, depth })}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium capitalize transition-all ${
                  isSelected
                    ? "bg-white text-violet-700 shadow-2xs font-semibold ring-1 ring-neutral-200"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {depth}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
