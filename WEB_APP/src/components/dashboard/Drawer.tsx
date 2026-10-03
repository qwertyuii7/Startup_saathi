"use client";

import { useDrawer } from "./DrawerProvider";
import { X, FileText, ExternalLink, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Drawer() {
  const { isOpen, drawerType, drawerProps, closeDrawer } = useDrawer();

  const renderContent = () => {
    switch (drawerType) {
      case "proof": {
        // Real criterion passed by the caller — never invented proof.
        const proof = (drawerProps || {}) as {
          requirement?: string;
          statusLabel?: string;
          reasoning?: string;
          evidenceSnippet?: string;
          evidenceDocumentName?: string;
          evidencePage?: number;
          clause?: string;
          sourceTitle?: string;
          sourceUrl?: string;
        };
        if (!proof.requirement) {
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">Clause & Proof</h3>
              <p className="text-xs text-neutral-500">
                Select a requirement to inspect its statutory clause and your document evidence.
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 text-[10px] font-bold uppercase tracking-wider rounded">
                  {proof.statusLabel || "Evaluated"}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">{proof.requirement}</h3>
              {proof.reasoning && (
                <p className="text-neutral-500 text-xs mt-1 leading-relaxed">{proof.reasoning}</p>
              )}
            </div>

            {proof.evidenceSnippet ? (
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 rounded-l-xl" />
                <p className="text-emerald-950 leading-relaxed text-xs italic">
                  “{proof.evidenceSnippet.slice(0, 400)}{proof.evidenceSnippet.length > 400 ? "…" : ""}”
                </p>
              </div>
            ) : (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
                <p className="text-amber-900 text-xs">
                  No document evidence matched for this requirement yet. Upload the relevant
                  certificate or letter on the Documents page.
                </p>
              </div>
            )}

            <div className="bg-white border border-neutral-200/90 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-neutral-100 text-neutral-700 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-xs">
                      {proof.evidenceDocumentName || "Startup workspace evidence"}
                      {typeof proof.evidencePage === "number" ? ` · Page ${proof.evidencePage}` : ""}
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      {proof.clause || ""}{proof.sourceTitle ? ` · ${proof.sourceTitle}` : ""}
                    </p>
                  </div>
                </div>
                {proof.sourceUrl && (
                  <a
                    href={proof.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-violet-600 transition-colors p-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="p-4 bg-violet-50/60 border border-violet-100 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-xs font-semibold text-violet-900">AROVA Audit Trail</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Deterministic rule evaluation against your startup profile, cross-checked with
                vector-retrieved excerpts from your own uploaded documents. Missing evidence is
                reported as missing — never assumed.
              </p>
            </div>
          </div>
        );
      }
      // NOTE: the legacy "simulator" drawer was removed — it displayed a
      // static verdict unrelated to the user's data. What-if analysis now
      // happens through real Deep Analysis runs.
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="relative w-full md:w-[460px] h-full bg-white shadow-2xl border-l border-neutral-200 flex flex-col pt-safe mt-auto md:mt-0 max-h-[88vh] md:max-h-full rounded-t-3xl md:rounded-t-none z-10"
          >
            {/* Mobile Drag Handle */}
            <div className="w-full h-6 flex md:hidden items-center justify-center shrink-0 cursor-pointer" onClick={closeDrawer}>
               <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">AROVA Intelligence Inspector</span>
              <button 
                onClick={closeDrawer}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-6">
              {renderContent()}
            </div>
            
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
