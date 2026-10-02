"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  CheckSquare, 
  Building2, 
  Bell, 
  User, 
  Sparkles 
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useCopilot } from "./CopilotProvider";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Schemes", href: "/dashboard/schemes", icon: Search },
  { label: "Plan", href: "/dashboard/plan", icon: CheckSquare },
  { label: "Incubators", href: "/dashboard/incubators", icon: Building2 },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export function Rail() {
  const pathname = usePathname();
  const { openCopilot } = useCopilot();

  return (
    <aside className="hidden md:flex flex-col w-[80px] xl:w-[220px] h-screen fixed left-0 top-0 border-r border-neutral-200 bg-neutral-50 transition-all duration-300 z-40">
      
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-center xl:justify-start xl:px-6 border-b border-neutral-200">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif italic font-light text-2xl text-violet-600">SS</span>
          <span className="font-medium text-lg text-neutral-900 hidden xl:block">Startup Saathi</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                isActive 
                  ? "bg-white shadow-sm ring-1 ring-neutral-200 text-violet-600" 
                  : "text-neutral-500 hover:bg-neutral-200/50 hover:text-neutral-900"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-violet-600" : "text-neutral-400 group-hover:text-neutral-600")} />
              <span className="font-medium text-sm hidden xl:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Setup Progress / Saathi Launcher Area */}
      <div className="p-4 border-t border-neutral-200">
        <button 
          onClick={openCopilot}
          className="w-full flex items-center justify-center xl:justify-start gap-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl p-3 xl:px-4 xl:py-3 transition-colors shadow-sm"
        >
          <Sparkles className="w-5 h-5 shrink-0" />
          <span className="font-medium text-sm hidden xl:block">Ask Saathi</span>
        </button>
      </div>
    </aside>
  );
}
