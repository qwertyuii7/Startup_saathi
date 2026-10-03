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
  ArrowLeft,
  PieChart,
  Scale,
  Target,
  FileText,
  AlertOctagon,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  BrainCircuit,
  Plus,
  User
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";

export function DeepAnalysisSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { analysis } = useWorkspaceAnalysis();
  
  const idParam = analysis ? `?id=${analysis.id}` : "";

  // Helper to check if a route is active
  const isActive = (path: string) => {
    if (path === "/deep-analysis") {
      return pathname === "/deep-analysis";
    }
    return pathname?.startsWith(path);
  };

  const navSections = [
    {
      title: "ANALYSIS",
      items: [
        { label: "Overview", href: `/deep-analysis${idParam}`, icon: LayoutDashboard },
        { label: "Compare", href: `/deep-analysis/compare${idParam}`, icon: Scale },
        { label: "Schemes", href: `/deep-analysis/schemes${idParam}`, icon: FileSearch },
        { label: "Eligibility", href: `/deep-analysis/eligibility${idParam}`, icon: Target },
        { label: "Evidence", href: `/deep-analysis/evidence${idParam}`, icon: FileCheck },
        { label: "Documents", href: `/deep-analysis/documents${idParam}`, icon: FileText },
        { label: "Profile", href: `/deep-analysis/profile${idParam}`, icon: User },
      ]
    },
    {
      title: "INTELLIGENCE",
      items: [
        { label: "Requirements", href: `/deep-analysis/requirements${idParam}`, icon: ListChecks },
        { label: "Gaps", href: `/deep-analysis/gaps${idParam}`, icon: AlertOctagon },
        { label: "Risks", href: `/deep-analysis/risks${idParam}`, icon: AlertTriangle },
        { label: "Opportunities", href: `/deep-analysis/opportunities${idParam}`, icon: Lightbulb },
        { label: "Incubators", href: `/deep-analysis/incubators${idParam}`, icon: Building2 },
      ]
    },
    {
      title: "EXECUTION",
      items: [
        { label: "Application Readiness", href: `/deep-analysis/readiness${idParam}`, icon: CheckCircle2 },
        { label: "Action Plan", href: `/deep-analysis/action-plan${idParam}`, icon: TrendingUp },
      ]
    },
    {
      title: "KNOWLEDGE",
      items: [
        { label: "Sources", href: `/deep-analysis/sources${idParam}`, icon: BookOpen },
        { label: "AI Analysis", href: `/deep-analysis/ai${idParam}`, icon: BrainCircuit },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[240px] min-w-[240px] max-w-[240px] 
        bg-neutral-50/50 border-r border-neutral-200 
        flex flex-col shrink-0 h-[100dvh]
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-14 bg-white border-b border-neutral-200 flex items-center px-4 shrink-0 shadow-xs">
          <BrandLogo size={24} showText={true} />
        </div>

        <div className="px-4 py-3 border-b border-neutral-100 flex flex-col gap-2 bg-white shrink-0">
          <Link 
            href="/deep-analysis/new"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New Analysis
          </Link>
          <Link 
            href="/deep-analysis/history"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            <History className="w-3.5 h-3.5" />
            History
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-2 mb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href.split('?')[0]);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? "bg-white text-violet-700 font-bold shadow-xs border border-neutral-200/60"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50 border border-transparent"
                      }`}
                    >
                      <Icon 
                        className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                          active ? "text-violet-600" : "text-neutral-400"
                        }`} 
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

      {/* Footer Profile/Status */}
      <div className="p-4 border-t border-neutral-200 bg-white shrink-0">
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Exit Workspace
        </Link>
      </div>
    </aside>
    </>
  );
}
