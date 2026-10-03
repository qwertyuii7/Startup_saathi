"use client";

import React, { useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DeepAnalysisSidebar } from "@/components/deep-analysis/DeepAnalysisSidebar";
import { DeepAnalysisHeader } from "@/components/deep-analysis/DeepAnalysisHeader";
import { AnalysisProvider } from "@/lib/analysis-context";
import { AskSchemeSenseDrawer } from "@/components/deep-analysis/AskSchemeSenseDrawer";
import { Sparkles, FileSearch, CheckCircle2, AlertCircle, User, Loader2, X } from "lucide-react";
import { ArovaChatPanel } from "@/components/deep-analysis/ArovaChatPanel";
import { ArovaEvidencePanel } from "@/components/deep-analysis/ArovaEvidencePanel";

export default function DeepAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<"chat" | "evidence" | "closed">("chat");
  const pathname = usePathname();

  // Certain routes like "new" or "history" might bypass the strict workspace layout,
  // but we can just render the same shell and let the children take full space.
  const isNonWorkspaceRoute = pathname === "/deep-analysis/new" || pathname === "/deep-analysis/history";

  return (
    <RequireAuth mode="completed" loadingMessage="Checking your workspace...">
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-neutral-50">
           <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      }>
        <AnalysisProvider>
          <div className="flex flex-col h-[100dvh] overflow-hidden bg-neutral-50/50 text-neutral-900 font-default selection:bg-violet-200">
            {/* Top Navbar */}
            <DeepAnalysisHeader 
              onMenuClick={() => setIsSidebarOpen(true)} 
              onChatClick={() => setIsChatOpen(true)}
            />

            <div className="flex flex-1 overflow-hidden relative">
              {/* Premium Persistent Sidebar */}
              <DeepAnalysisSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

              {/* Main Content Area */}
              <main className="flex-1 overflow-y-auto bg-neutral-50/50 p-4 md:p-8 min-w-0 relative">
                <div className="max-w-5xl mx-auto h-full">
                  {children}
                </div>
              </main>

              {/* Contextual Right Panel (AI / Evidence) - Hidden on non-workspace routes */}
              {!isNonWorkspaceRoute && (
                <>
                  {/* Mobile Backdrop for Right Panel */}
                  {isChatOpen && (
                    <div 
                      className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-40 lg:hidden"
                      onClick={() => setIsChatOpen(false)}
                    />
                  )}
                  <aside className={`
                    fixed lg:static inset-y-0 right-0 z-50
                    w-[320px] max-w-full shrink-0 
                    bg-white border-l border-neutral-200 
                    flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)]
                    transition-transform duration-300 ease-in-out
                    ${isChatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                  `}>
                    <div className="h-12 border-b border-neutral-100 flex items-center p-1 bg-neutral-50/50 shrink-0">
                      <div className="flex bg-neutral-200/50 p-0.5 rounded-lg w-full">
                        <button 
                          onClick={() => setRightPanelMode("chat")}
                          className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${rightPanelMode === "chat" ? "bg-white shadow-xs text-violet-700" : "text-neutral-500 hover:text-neutral-800"}`}
                        >
                          Ask AROVA
                        </button>
                        <button 
                          onClick={() => setRightPanelMode("evidence")}
                          className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${rightPanelMode === "evidence" ? "bg-white shadow-xs text-violet-700" : "text-neutral-500 hover:text-neutral-800"}`}
                        >
                          Evidence
                        </button>
                      </div>
                      <button 
                        onClick={() => setIsChatOpen(false)}
                        className="lg:hidden ml-2 p-1.5 text-neutral-500 hover:text-neutral-900 rounded-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-hidden relative">
                      {rightPanelMode === "chat" ? (
                        <ArovaChatPanel onClose={() => setIsChatOpen(false)} />
                      ) : (
                        <ArovaEvidencePanel />
                      )}
                    </div>
                  </aside>
                </>
              )}
            </div>
          </div>
        </AnalysisProvider>
      </Suspense>
    </RequireAuth>
  );
}
