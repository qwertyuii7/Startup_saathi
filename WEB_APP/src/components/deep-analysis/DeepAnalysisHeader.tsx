"use client";

import Link from "next/link";
import { Plus, RefreshCw, Sparkles, ChevronRight, Search, Bell, Menu, LayoutDashboard } from "lucide-react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { usePathname } from "next/navigation";

export function DeepAnalysisHeader({ onMenuClick, onChatClick }: { onMenuClick?: () => void; onChatClick?: () => void }) {
  const { analysis, isLoading, refreshAnalysis } = useWorkspaceAnalysis();
  const pathname = usePathname();

  // Create a pseudo-breadcrumb based on path
  const pathSegment = pathname?.split("/").pop() || "overview";
  const formattedSegment = pathSegment === "deep-analysis" ? "Overview" 
    : pathSegment.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <header className="h-14 bg-white border-b border-neutral-200 px-4 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
      {/* Left section: Breadcrumb & Context */}
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-1.5 -ml-1.5 text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2 text-neutral-900 font-bold tracking-tight text-sm min-w-0">
          <LayoutDashboard className="w-4 h-4 text-violet-600 hidden sm:block shrink-0" />
          <span className="hidden sm:inline shrink-0">Workspace</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-300 hidden sm:block shrink-0" />
          <span className="text-neutral-500 truncate">{formattedSegment}</span>
        </div>
        
        <div className="hidden md:block h-4 w-px bg-neutral-200" />
        
        {/* Analysis Status */}
        {analysis ? (
          <div className="hidden md:flex items-center gap-3 text-xs">
            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded font-mono text-[10px]">ID: {analysis.id.slice(-6)}</span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {analysis.status}
            </span>
            <span className="text-neutral-400">
              Analyzed: {new Date(analysis.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
        ) : isLoading ? (
          <div className="text-xs text-neutral-400 animate-pulse">Loading context...</div>
        ) : null}
      </div>

      {/* Right section: Actions & User */}
      <div className="flex items-center gap-3">
        {analysis && (
          <button 
            onClick={refreshAnalysis}
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 px-3 py-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-run Analysis
          </button>
        )}

        <div className="h-8 w-px bg-neutral-200 hidden md:block" />
        
        <button 
          onClick={onChatClick}
          className="lg:hidden p-1.5 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-md transition-colors"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        
        <button className="hidden sm:block p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors">
          <Search className="w-4 h-4" />
        </button>
        
        <button className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white" />
        </button>

        <Link
          href="/deep-analysis/new"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </Link>
        
        <div className="w-7 h-7 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 font-bold text-xs ml-1 cursor-pointer">
          S
        </div>
      </div>
    </header>
  );
}
