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
    <div className="flex h-screen w-full bg-[#FAFAFA] overflow-hidden text-neutral-900 font-default selection:bg-violet-500 selection:text-white">
      
      {/* Sidebar for Desktop/Tablet */}
      <Rail />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col md:ml-[76px] xl:ml-[230px] min-h-screen overflow-hidden relative transition-all duration-300 ease-in-out ${
          isOpen ? "xl:mr-[420px]" : "mr-0"
        }`}
      >
        {/* Top Navbar */}
        <TopBar />
        
        {/* Scrollable Main Workspace */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 relative z-10 bg-[#FAFAFA]">
           <div className="w-full max-w-none p-4 sm:p-6 md:p-8">
              {children}
           </div>
        </main>
      </div>

      {/* Bottom Tabs for Mobile Navigation */}
      <BottomTabs />

      {/* Ask AROVA AI Copilot Panel (Right Split Drawer) */}
      <CopilotPanel />
      
      {/* Side Drawer for Proof/Simulation */}
      <Drawer />
      
    </div>
  );
}
