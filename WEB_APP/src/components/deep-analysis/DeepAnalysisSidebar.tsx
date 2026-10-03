"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Sparkles, 
  FileSearch, 
  FileCheck, 
  ListChecks, 
  Building2, 
  History,
  ArrowLeft
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function DeepAnalysisSidebar() {
  const pathname = usePathname();

  // Extract analysisId from pathname if present; otherwise no deep links.
  const match = pathname.match(/\/deep-analysis\/([^\/]+)/);
  const rawId = match ? match[1] : null;
  const activeAnalysisId = rawId && rawId !== "new" && rawId !== "history" ? rawId : null;

  const navItems = [
    {
      label: "Overview",
      href: "/deep-analysis",
      icon: LayoutDashboard,
      isActive: pathname === "/deep-analysis",
    },
    {
      label: "New Analysis",
      href: "/deep-analysis/new",
      icon: Sparkles,
      isActive: pathname === "/deep-analysis/new",
    },
    // Record-scoped links only render once an analysis is selected —
    // never a hardcoded demo id.
    ...(activeAnalysisId
      ? [
          {
            label: "Results",
            href: `/deep-analysis/${activeAnalysisId}/results`,
            icon: FileSearch,
            isActive: pathname.includes("/results") || pathname.includes("/running"),
          },
          {
            label: "Evidence",
            href: `/deep-analysis/${activeAnalysisId}/evidence`,
            icon: FileCheck,
            isActive: pathname.includes("/evidence"),
          },
          {
            label: "Action Plan",
            href: `/deep-analysis/${activeAnalysisId}/action-plan`,
            icon: ListChecks,
            isActive: pathname.includes("/action-plan"),
          },
          {
            label: "Incubators",
            href: `/deep-analysis/${activeAnalysisId}/incubators`,
            icon: Building2,
            isActive: pathname.includes("/incubators"),
          },
        ]
      : []),
    {
      label: "History",
      href: "/deep-analysis/history",
      icon: History,
      isActive: pathname === "/deep-analysis/history",
    },
  ];

  return (
    <aside className="w-[230px] min-w-[230px] max-w-[230px] bg-white border-r border-neutral-200 flex flex-col shrink-0 h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="h-16 border-b border-neutral-100 flex items-center justify-between px-4">
        <BrandLogo size={28} showText={true} />
      </div>

      {/* Back to Dashboard Link */}
      <div className="px-3 pt-3 pb-1">
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                item.isActive
                  ? "bg-violet-50 text-violet-700 font-semibold"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <Icon 
                className={`w-4 h-4 shrink-0 transition-colors ${
                  item.isActive ? "text-violet-600" : "text-neutral-400"
                }`} 
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Status */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 m-3 rounded-xl">
        <div className="text-[11px] font-semibold text-neutral-700">AI Analysis Engine</div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-emerald-700 font-medium">Ready</span>
        </div>
      </div>
    </aside>
  );
}
