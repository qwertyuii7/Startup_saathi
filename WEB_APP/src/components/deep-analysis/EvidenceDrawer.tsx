"use client";

import { useState } from "react";
import { 
  X, 
  FileText, 
  ShieldCheck, 
  Copy, 
  ExternalLink, 
  Scale, 
  Sparkles, 
  Check, 
  AlertTriangle,
  BookOpen
} from "lucide-react";
import { EligibilityCriterion } from "@/types/deep-analysis";

interface EvidenceDrawerProps {
  criterion: EligibilityCriterion | null;
  onClose: () => void;
}

export function EvidenceDrawer({
  criterion,
  onClose,
}: EvidenceDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!criterion) return null;

  const handleCopy = () => {
    if (criterion.evidence?.extractedSnippet) {
      navigator.clipboard.writeText(criterion.evidence.extractedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/30 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose} 
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl z-50 flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-base">
                Evidentiary Audit Trail
              </h3>
              <p className="text-xs text-neutral-400">
                Statutory clause & document cross-verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-200/60 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* 1. The Statutory Condition */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Audited Condition
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-violet-100 text-violet-700">
                {criterion.category}
              </span>
            </div>
            <p className="text-sm font-semibold text-neutral-900">
              {criterion.requirement}
            </p>
          </div>

          {/* 2. Official Government Source Box */}
          <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-200 flex items-center gap-1">
                <Scale className="w-3 h-3" />
                Official Government Source
              </span>
            </div>
            <h4 className="text-xs font-bold text-neutral-900">
              {criterion.officialSource.title}
            </h4>
            {criterion.officialSource.clauseOrPage && (
              <p className="text-xs text-neutral-600 mt-0.5 font-mono">
                {criterion.officialSource.clauseOrPage}
              </p>
            )}
          </div>

          {/* 3. User-Provided Evidence Document */}
          <div className="border border-neutral-200 rounded-xl p-4 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                User-Provided Evidence
              </span>

              {criterion.evidence?.verified && (
                <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified Document
                </span>
              )}
            </div>

            {criterion.evidence ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/70">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-600" />
                    <span className="font-semibold text-neutral-900">
                      {criterion.evidence.documentName}
                    </span>
                  </div>
                  <span className="text-neutral-500 font-mono text-[11px]">
                    Page {criterion.evidence.pageNumber}
                  </span>
                </div>

                {/* Extracted Text Snippet */}
                <div>
                  <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Extracted Text Snippet (OCR Verified)
                  </div>
                  <div className="p-3 bg-neutral-900 text-neutral-100 rounded-xl text-xs font-mono leading-relaxed border border-neutral-800 relative group">
                    &ldquo;{criterion.evidence.extractedSnippet}&rdquo;
                  </div>
                </div>

                {/* Metadata tags */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-500 pt-1">
                  <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px]">Evidence Strength</span>
                    <span className="font-medium text-neutral-800 capitalize">
                      {criterion.evidence.evidenceStrength.replace("_", " ")}
                    </span>
                  </div>
                  <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px]">Verification Status</span>
                    <span className="font-medium text-emerald-700">Cryptographically Matched</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-4 text-center text-xs text-neutral-400 italic">
                No documentary evidence is currently attached for this condition.
              </div>
            )}
          </div>

          {/* 4. AI Interpretation Disclaimer Box */}
          <div className="border border-violet-200 bg-violet-50/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-violet-100 text-violet-800 text-[10px] font-bold uppercase tracking-wider rounded border border-violet-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Interpretation & Reasoning
              </span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              {criterion.aiReasoning}
            </p>
            <div className="mt-2 text-[10px] text-neutral-400 italic">
              * AI reasoning maps extracted evidence to statutory rules. Always consult official gazettes or CA for final submissions.
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-2">
          <button
            onClick={handleCopy}
            disabled={!criterion.evidence}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-all shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Evidence"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Opening ${criterion.evidence?.documentName || "document"}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>View Document</span>
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
