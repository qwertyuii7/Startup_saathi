"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function DeepAnalysisHeader() {
  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div>
        <h1 className="text-base font-bold text-neutral-900 leading-tight">Deep Analysis</h1>
        <p className="text-xs text-neutral-500">Evidence-backed startup eligibility analysis</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/deep-analysis/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </Link>
      </div>
    </header>
  );
}
