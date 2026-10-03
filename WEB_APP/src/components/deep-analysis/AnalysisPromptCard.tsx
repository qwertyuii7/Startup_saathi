"use client";

import { Sparkles, ArrowRight, CornerDownLeft } from "lucide-react";

interface AnalysisPromptCardProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onRunAnalysis: () => void;
  isLoading?: boolean;
}

export function AnalysisPromptCard({
  prompt,
  setPrompt,
  onRunAnalysis,
  isLoading = false,
}: AnalysisPromptCardProps) {
  const suggestedPrompts = [
    "Find schemes I qualify for",
    "Why am I not eligible?",
    "Find schemes with funding",
    "Analyze my missing documents",
    "Find UP startup benefits",
    "Find incubator opportunities",
    "Prepare me for application",
  ];

  const handleChipClick = (chipText: string) => {
    switch (chipText) {
      case "Find schemes I qualify for":
        setPrompt(
          "Analyze all Central and Uttar Pradesh schemes where my DPIIT-registered SaaS startup satisfies 100% of eligibility criteria."
        );
        break;
      case "Why am I not eligible?":
        setPrompt(
          "Perform a condition-by-condition audit of schemes where my startup currently falls short. Explain why and show exact missing evidence."
        );
        break;
      case "Find schemes with funding":
        setPrompt(
          "Find non-dilutive seed grants, early prototype subsidies, and collateral-free credit facilities offering above ₹20 Lakhs."
        );
        break;
      case "Analyze my missing documents":
        setPrompt(
          "Audit my uploaded documents and provide a prioritized list of financial statements, certificates, or letters required to unlock higher tier schemes."
        );
        break;
      case "Find UP startup benefits":
        setPrompt(
          "Investigate specific Uttar Pradesh State Startup Policy 2020 incentives including monthly sustenance allowances, marketing grants, and patent fee reimbursements."
        );
        break;
      case "Find incubator opportunities":
        setPrompt(
          "Match my SaaS startup with top empaneled incubators in Uttar Pradesh and Pan-India offering SISFS and SAMRIDH funding tracks."
        );
        break;
      case "Prepare me for application":
        setPrompt(
          "Generate an evidence-backed application dossier and structured answers for the Startup India Seed Fund Scheme."
        );
        break;
      default:
        setPrompt(chipText);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
      
      {/* Subtle top ambient indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-400 opacity-90" />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
              Start a Deep Analysis
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
            Tell SchemeSense what you want to investigate. We&apos;ll analyze your startup profile, 
            uploaded documents, statutory eligibility clauses, and official government scheme sources.
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="relative mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="What would you like SchemeSense to investigate? (e.g., 'Find all Central and Uttar Pradesh schemes my SaaS startup may qualify for. Analyze eligibility, funding amount, missing documents and explain every decision with official evidence.')"
          className="w-full p-4 text-sm text-neutral-900 bg-neutral-50/60 border border-neutral-300 rounded-xl outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-neutral-400 resize-none font-normal"
        />

        {prompt.trim().length > 0 && (
          <button
            onClick={() => setPrompt("")}
            className="absolute top-3 right-3 text-xs text-neutral-400 hover:text-neutral-600 bg-white px-2 py-1 rounded-md border border-neutral-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Suggested Prompts Chips */}
      <div>
        <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-2">
          Suggested Investigations
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {suggestedPrompts.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="px-3 py-1.5 text-xs bg-neutral-100 hover:bg-violet-50 text-neutral-700 hover:text-violet-700 border border-neutral-200 hover:border-violet-200 rounded-lg transition-all duration-150 flex items-center gap-1.5 shadow-2xs group"
            >
              <span className="text-violet-500 font-bold text-[10px] group-hover:translate-x-0.5 transition-transform">✦</span>
              <span>{chip}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
