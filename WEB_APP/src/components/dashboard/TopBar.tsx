"use client";

import { Bell, Search, Globe, ChevronDown } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-16 border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      
      {/* Left: Page Title / Breadcrumbs (Can be dynamic based on route later) */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-medium text-neutral-900 hidden sm:block">Dashboard</h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        
        {/* Language Toggle */}
        <button className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full">
          <Globe className="w-4 h-4" />
          <span>EN</span>
          <span className="text-neutral-400 mx-1">/</span>
          <span className="text-neutral-400">हिं</span>
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
        </button>

        {/* Avatar Menu */}
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-medium shadow-sm border border-violet-200">
            A
          </div>
          <ChevronDown className="w-4 h-4 text-neutral-400 hidden sm:block" />
        </button>
      </div>

    </header>
  );
}
