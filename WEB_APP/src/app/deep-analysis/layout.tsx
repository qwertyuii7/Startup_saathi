"use client";

import React, { useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DeepAnalysisSidebar } from "@/components/deep-analysis/DeepAnalysisSidebar";
import { DeepAnalysisHeader } from "@/components/deep-analysis/DeepAnalysisHeader";
import { AskSchemeSenseDrawer } from "@/components/deep-analysis/AskSchemeSenseDrawer";
import { Sparkles } from "lucide-react";

export default function DeepAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <RequireAuth mode="completed" loadingMessage="Checking your workspace...">
    <div className="min-h-screen bg-neutral-50/50 flex flex-row">
      {/* 230px Fixed Sidebar */}
      <DeepAnalysisSidebar />

      {/* Main Content Area (Full remaining width, flex: 1, min-w: 0) */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <DeepAnalysisHeader />

        <main className="flex-1 min-w-0 w-full p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Floating Ask AROVA AI Trigger */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-lg hover:shadow-xl transition-all"
      >
        <Sparkles className="w-4 h-4" />
        <span>Ask AROVA</span>
      </button>

      {/* RAG Contextual AI Chat Drawer */}
      <AskSchemeSenseDrawer 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
    </RequireAuth>
  );
}
