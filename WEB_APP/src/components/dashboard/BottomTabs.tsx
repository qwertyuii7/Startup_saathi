"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  CheckSquare, 
  MoreHorizontal
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TABS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Schemes", href: "/dashboard/schemes", icon: Search },
  { label: "Plan", href: "/dashboard/plan", icon: CheckSquare },
  { label: "More", href: "/dashboard/profile", icon: MoreHorizontal },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 z-50 flex items-center justify-around px-2 pb-safe">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              isActive ? "text-violet-600" : "text-neutral-500"
            )}
          >
            <tab.icon className={cn("w-5 h-5", isActive ? "fill-violet-600/20" : "")} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
