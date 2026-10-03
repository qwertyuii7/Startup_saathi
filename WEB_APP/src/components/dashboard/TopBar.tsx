"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, Sparkles, User, Settings, LogOut, Loader2, ChevronDown } from "lucide-react";
import { useCopilot } from "./CopilotProvider";
import { useAuth } from "@/lib/auth-context";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openCopilot } = useCopilot();
  // Authenticated backend user is the single source of truth.
  const { user, isLoading: authLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click / Escape / navigation.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      await logout();
      // Hard replace so the back button cannot resurface protected pages.
      router.replace("/login");
      router.refresh();
    } catch (e) {
      setLoggingOut(false);
      setLogoutError(e instanceof Error ? e.message : "Logout failed. Please try again.");
    }
  };

  const getPageTitle = () => {
    if (pathname === "/dashboard") return { title: "Overview", category: "Workspace" };
    if (pathname.startsWith("/dashboard/schemes")) return { title: "Scheme Discovery", category: "Opportunities" };
    if (pathname.startsWith("/dashboard/plan")) return { title: "Action Plan", category: "Milestones" };
    if (pathname.startsWith("/dashboard/incubators")) return { title: "Incubators & Accelerators", category: "Ecosystem" };
    if (pathname.startsWith("/dashboard/alerts")) return { title: "Policy Notifications", category: "Intelligence" };
    if (pathname.startsWith("/dashboard/profile")) return { title: "Startup Profile", category: "Account" };
    if (pathname.startsWith("/dashboard/settings")) return { title: "Settings", category: "Account" };
    if (pathname.startsWith("/documents")) return { title: "Documents", category: "Evidence" };
    return { title: "Dashboard", category: "AROVA" };
  };

  const { title, category } = getPageTitle();
  const displayName = user?.name || (authLoading ? "…" : "Founder");
  const initial = (displayName.charAt(0) || "A").toUpperCase();

  return (
    <header className="h-16 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 shrink-0">

      {/* Left: Page Title / Breadcrumbs */}
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider hidden sm:inline">
          {category}
        </span>
        <span className="text-neutral-300 hidden sm:inline">/</span>
        <h1 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">

        {/* Deep Analysis Workspace Link */}
        <Link
          href="/deep-analysis"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200/80 text-violet-700 rounded-xl text-xs font-semibold transition-all shadow-2xs group"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-600 group-hover:rotate-12 transition-transform" />
          <span>Deep Analysis</span>
        </Link>

        {/* Ask AROVA AI Copilot Trigger */}
        <button
          onClick={openCopilot}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 rounded-xl text-xs font-semibold transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span>Ask AROVA</span>
        </button>

        {/* Notifications */}
        <Link
          href="/dashboard/alerts"
          className="relative w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Policy Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full ring-2 ring-white" />
        </Link>

        <div className="h-4 w-px bg-neutral-200 mx-0.5" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-neutral-100 transition-colors group"
          >
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={displayName}
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-cover shadow-2xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs group-hover:bg-violet-600 transition-colors">
                {initial}
              </div>
            )}
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-neutral-900 leading-tight truncate max-w-[120px]">
                {displayName}
              </div>
              <div className="text-[10px] text-neutral-400 leading-none truncate max-w-[120px]">
                {user?.email || "Founder"}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden lg:block" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden z-50"
            >
              {/* Identity header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100 bg-neutral-50/60">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={displayName}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white font-bold text-sm flex items-center justify-center">
                    {initial}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-neutral-900 truncate">{displayName}</div>
                  <div className="text-[11px] text-neutral-500 truncate">{user?.email}</div>
                </div>
              </div>

              <div className="p-1.5">
                <Link
                  href="/dashboard/profile"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <User className="w-4 h-4 text-neutral-400" />
                  <span>Startup Profile</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <Settings className="w-4 h-4 text-neutral-400" />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="p-1.5 border-t border-neutral-100">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {loggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span>{loggingOut ? "Signing out…" : "Log out"}</span>
                </button>
                {logoutError && (
                  <p role="alert" className="px-3 py-1.5 text-[11px] text-red-600">
                    {logoutError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
