"use client";

import { useEffect, useState } from "react";
import {
  X,
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  Edit3,
  Check,
  AlertCircle,
  FileCheck,
  Loader2,
} from "lucide-react";
import { ApplicationDraft, Scheme } from "@/types/deep-analysis";
import { api } from "@/lib/api-client";

interface AiApplicationDraftModalProps {
  scheme?: Scheme | null;
  schemeId?: string;
  onClose: () => void;
}

const EMPTY_DRAFT: ApplicationDraft = {
  startupOverview: "",
  problem: "",
  solution: "",
  market: "",
  innovation: "",
  businessModel: "",
  impact: "",
  fundingRequirement: "",
  useOfFunds: "",
  lastGenerated: "",
  reviewedByFounder: false,
};

export function AiApplicationDraftModal({
  scheme,
  schemeId,
  onClose,
}: AiApplicationDraftModalProps) {
  const [draft, setDraft] = useState<ApplicationDraft | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("overview");

  const targetSchemeId = schemeId || scheme?.id;

  const applyDraft = (sections: Record<string, string>) => {
    setDraft({
      ...EMPTY_DRAFT,
      ...(sections as unknown as ApplicationDraft),
      lastGenerated: `Generated on ${new Date().toLocaleDateString()} via AROVA Engine`,
      reviewedByFounder: false,
    });
  };

  // Generate the real draft from the backend on open.
  useEffect(() => {
    let cancelled = false;
    async function generate() {
      setIsLoading(true);
      setLoadError("");
      try {
        const res = await api.applications.generateDraft(targetSchemeId);
        if (cancelled) return;
        if (res.success && res.draft?.sections) {
          applyDraft(res.draft.sections);
        } else {
          throw new Error("Draft generation returned no content.");
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Could not generate the draft.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    generate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSchemeId]);

  const sections = [
    { key: "startupOverview", label: "1. Startup Overview", content: draft?.startupOverview || "" },
    { key: "problem", label: "2. Problem Statement", content: draft?.problem || "" },
    { key: "solution", label: "3. Proprietary Solution", content: draft?.solution || "" },
    { key: "market", label: "4. Market Opportunity & TAM", content: draft?.market || "" },
    { key: "innovation", label: "5. Degree of Innovation (IMB)", content: draft?.innovation || "" },
    { key: "businessModel", label: "6. Business Model & Pricing", content: draft?.businessModel || "" },
    { key: "impact", label: "7. Socio-Economic Impact", content: draft?.impact || "" },
    { key: "fundingRequirement", label: "8. Funding Requirement", content: draft?.fundingRequirement || "" },
    { key: "useOfFunds", label: "9. Milestones & Use of Funds", content: draft?.useOfFunds || "" },
  ];

  const handleCopyAll = () => {
    const fullText = sections.map(s => `## ${s.label}\n${s.content}\n`).join("\n");
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setLoadError("");
    try {
      const res = await api.applications.generateDraft(targetSchemeId);
      if (res.success && res.draft?.sections) {
        applyDraft(res.draft.sections);
      } else {
        throw new Error("Draft generation returned no content.");
      }
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : "Could not regenerate the draft.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExportText = () => {
    if (!draft) return;
    const fullText = `AROVA APPLICATION DOSSIER\nTarget Scheme: ${scheme ? scheme.name : targetSchemeId || "Selected scheme"}\nGenerated: ${draft.lastGenerated}\n\n` +
      sections.map(s => `=========================================\n${s.label}\n=========================================\n${s.content}\n`).join("\n");
    
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SchemeSense_Application_Draft_${(scheme?.shortName || "Dossier").replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="fixed inset-4 sm:inset-10 lg:inset-x-24 lg:inset-y-12 bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-neutral-200 overflow-hidden animate-in fade-in-50 zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-neutral-900 text-base sm:text-lg">
                  AI Application Draft Workspace
                </h3>
                <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold uppercase rounded-md">
                  Grounded in Company Data
                </span>
              </div>
                <p className="text-xs text-neutral-500">
                  Target: <strong>{scheme ? scheme.name : targetSchemeId || "Selected scheme"}</strong>
                </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Founder Review Alert Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Mandatory Founder Review:</strong> This draft was synthesized from your uploaded documents and official eligibility clauses. You must carefully review, edit, and verify all statements before official portal submission.
          </span>
        </div>

        {/* Modal Body: Two-Column Structure (Sections list on left, Editor on right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Section Selector Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-200 bg-neutral-50/50 p-3 space-y-1 overflow-y-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1">
              Application Sections
            </div>
            {sections.map((sec) => (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeSection === sec.key
                    ? "bg-white text-violet-700 font-bold border border-violet-200 shadow-2xs"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Section Content Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col justify-between">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-neutral-400 min-h-[220px]">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                <p className="text-xs font-semibold">Generating your application draft from workspace data…</p>
              </div>
            ) : loadError || !draft ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center min-h-[220px]">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-xs text-red-600 font-medium max-w-sm">{loadError || "No draft available."}</p>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold"
                >
                  Try again
                </button>
              </div>
            ) : (
            sections
              .filter(s => s.key === activeSection)
              .map((sec) => (
                <div key={sec.key} className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <h4 className="text-base font-bold text-neutral-900">
                      {sec.label}
                    </h4>
                    <span className="text-[11px] text-neutral-400">
                      {isEditing ? "Editing mode" : "Synthesized view"}
                    </span>
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={12}
                      value={(draft as ApplicationDraft)[sec.key as keyof ApplicationDraft] as string}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraft(prev => (prev ? { ...prev, [sec.key]: val } : prev));
                      }}
                      className="w-full p-4 border border-violet-300 rounded-xl text-xs sm:text-sm text-neutral-900 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none bg-neutral-50/40"
                    />
                  ) : (
                    <div className="p-4 bg-neutral-50/80 border border-neutral-200/80 rounded-xl text-xs sm:text-sm text-neutral-800 leading-relaxed font-normal whitespace-pre-line min-h-[220px]">
                      {sec.content}
                    </div>
                  )}
                </div>
              ))
            )}

            <div className="text-[11px] text-neutral-400 pt-4 border-t border-neutral-100 flex items-center justify-between">
              <span>{draft?.lastGenerated}</span>
              <span>Synthesized from your startup profile and uploaded documents</span>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin text-violet-600" : ""}`} />
              <span>{isRegenerating ? "Synthesizing..." : "Regenerate Draft"}</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                isEditing
                  ? "bg-violet-100 text-violet-800 border-violet-300 font-bold"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-200"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? "Save Edits" : "Edit Text"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied All!" : "Copy Full Application"}</span>
            </button>

            <button
              onClick={handleExportText}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Application Text</span>
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
