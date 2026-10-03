"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, ListChecks, FileText, Bell } from "lucide-react";
import { useCopilot } from "./CopilotProvider";

export function BottomTabs() {
  const pathname = usePathname();
  const { openCopilot } = useCopilot();

  const tabs = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Schemes", href: "/dashboard/schemes", icon: Search },
    { label: "Docs", href: "/documents", icon: FileText },
    { label: "Plan", href: "/dashboard/plan", icon: ListChecks },
    { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
  ];

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-neutral-200 flex items-center justify-around px-2 z-40">
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              active ? "text-violet-600 font-semibold" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? "text-violet-600" : "text-neutral-400"}`} />
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
