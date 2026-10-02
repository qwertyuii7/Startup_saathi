"use client";

import { ReactNode } from "react";
import { Rail } from "@/components/dashboard/Rail";
import { TopBar } from "@/components/dashboard/TopBar";
import { BottomTabs } from "@/components/dashboard/BottomTabs";
import { CopilotPanel } from "@/components/dashboard/CopilotPanel";
import { Drawer } from "@/components/dashboard/Drawer";
import { useCopilot } from "@/components/dashboard/CopilotProvider";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { isOpen } = useCopilot();

  return (
    <div className="flex h-screen w-full bg-neutral-50 overflow-hidden text-neutral-900 font-default selection:bg-violet-200">
      
      {/* Sidebar for Desktop/Tablet */}
      <Rail />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col md:ml-[80px] xl:ml-[220px] min-h-screen overflow-hidden relative transition-all duration-300 ease-in-out ${
          isOpen ? "lg:mr-[420px]" : "mr-0"
        }`}
      >
        
        {/* Top Bar */}
        <TopBar />
        
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative z-10 bg-white shadow-sm ring-1 ring-neutral-200 md:rounded-tl-2xl">
           <div className="max-w-[960px] mx-auto w-full p-4 sm:p-6 md:p-8">
              {children}
           </div>
        </main>
        
      </div>

      {/* Bottom Tabs for Mobile */}
      <BottomTabs />

      {/* Copilot Split Workspace (Right Side) */}
      <CopilotPanel />
      
      {/* Side Drawer */}
      <Drawer />
      
    </div>
  );
}
