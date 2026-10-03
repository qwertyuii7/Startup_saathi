"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  ListChecks,
  Building2,
  Bell,
  User,
  Sparkles,
  FileText,
  Settings,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useCopilot } from "./CopilotProvider";
import { BrandLogo } from "@/components/ui/BrandLogo";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Rail() {
  const pathname = usePathname();
  const { openCopilot } = useCopilot();

  const mainNav = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Schemes", href: "/dashboard/schemes", icon: Search },
    { label: "Documents", href: "/documents", icon: FileText },
    { label: "My Plan", href: "/dashboard/plan", icon: ListChecks },
    { label: "Incubators", href: "/dashboard/incubators", icon: Building2 },
    { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
  ];

  const workspaceNav = [
    { 
      label: "Deep Analysis", 
      href: "/deep-analysis", 
      icon: Sparkles,
      badge: "AI",
    },
  ];

  const accountNav = [
    { label: "Profile", href: "/dashboard/profile", icon: User },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[76px] xl:w-[230px] h-screen fixed left-0 top-0 border-r border-neutral-200/90 bg-white z-40 shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-center xl:justify-start xl:px-5 border-b border-neutral-100">
        <BrandLogo size={28} showText={true} className="xl:flex hidden" />
        <BrandLogo size={28} showText={false} className="xl:hidden flex" />
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Core Navigation */}
        <div className="space-y-1">
          <div className="hidden xl:block px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Platform
          </div>
          {mainNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative",
                  isActive 
                    ? "bg-violet-50/80 text-violet-700 font-semibold shadow-2xs" 
                    : "text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900"
                )}
                title={item.label}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-violet-600" : "text-neutral-400 group-hover:text-neutral-700")} />
                <span className="truncate hidden xl:block flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Workspace Nav */}
        <div className="space-y-1">
          <div className="hidden xl:block px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Intelligence
          </div>
          {workspaceNav.map((item) => {
            const isActive = pathname.startsWith("/deep-analysis");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative",
                  isActive 
                    ? "bg-violet-50/80 text-violet-700 font-semibold shadow-2xs" 
                    : "text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900"
                )}
                title={item.label}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-violet-600" : "text-violet-500")} />
                <span className="truncate hidden xl:block flex-1">{item.label}</span>
                {item.badge && (
                  <span className="hidden xl:inline-block px-1.5 py-0.2 text-[9px] font-bold tracking-wider uppercase bg-violet-600 text-white rounded-md">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Account Nav */}
        <div className="space-y-1">
          <div className="hidden xl:block px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Account
          </div>
          {accountNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative",
                  isActive 
                    ? "bg-violet-50/80 text-violet-700 font-semibold shadow-2xs" 
                    : "text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900"
                )}
                title={item.label}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-violet-600" : "text-neutral-400 group-hover:text-neutral-700")} />
                <span className="truncate hidden xl:block flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Ask AROVA AI Trigger */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50/40">
        <button 
          onClick={openCopilot}
          className="w-full flex items-center justify-center xl:justify-start gap-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl p-2.5 xl:px-3.5 xl:py-2.5 transition-all shadow-2xs text-xs font-semibold group"
          title="Ask AROVA"
        >
          <Sparkles className="w-4 h-4 text-violet-300 group-hover:rotate-12 transition-transform shrink-0" />
          <span className="hidden xl:block truncate">Ask AROVA</span>
        </button>
      </div>
    </aside>
  );
}
