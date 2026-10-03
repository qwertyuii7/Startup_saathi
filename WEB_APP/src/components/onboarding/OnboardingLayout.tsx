"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps?: number;
  children: React.ReactNode;
}

const STEPS = ["Founder", "Startup", "Legal", "Business", "Documents"];

/**
 * Dedicated onboarding shell — fixed viewport, no page scroll, no global
 * navbar/footer/sidebar. Steps render inside the centered column; the
 * column scrolls internally only when the viewport is too short.
 */
export function OnboardingLayout({
  currentStep,
  totalSteps = 5,
  children,
}: OnboardingLayoutProps) {
  const active = Math.min(Math.max(currentStep, 1), totalSteps + 1);
  const done = currentStep > totalSteps;

  return (
    <div className="h-dvh w-screen overflow-hidden bg-[#FAFAFA] text-neutral-900 flex flex-col selection:bg-violet-500 selection:text-white">
      {/* Shell header */}
      <header className="shrink-0 h-14 sm:h-16 border-b border-neutral-200/80 bg-white/90 backdrop-blur px-4 sm:px-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative block w-8 h-8 rounded-lg overflow-hidden shrink-0">
            <Image src="/logo.png" alt="AROVA" width={32} height={32} className="object-contain w-full h-full" priority />
          </span>
          <span className="leading-none">
            <span className="block font-bold text-sm tracking-tight">AROVA</span>
            <span className="block text-[9px] font-semibold tracking-[0.18em] text-violet-600">SETUP</span>
          </span>
        </div>

        {!done && (
          <nav aria-label="Onboarding progress" className="hidden md:flex items-center gap-1.5 min-w-0">
            {STEPS.slice(0, totalSteps).map((label, i) => {
              const n = i + 1;
              const isDone = n < active;
              const isCurrent = n === active;
              return (
                <React.Fragment key={label}>
                  {i > 0 && (
                    <span className={`w-4 sm:w-6 h-px ${n <= active ? "bg-violet-500" : "bg-neutral-200"}`} aria-hidden="true" />
                  )}
                  <span
                    aria-current={isCurrent ? "step" : undefined}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                      isCurrent
                        ? "text-violet-700 bg-violet-50 border border-violet-200"
                        : isDone
                          ? "text-neutral-500"
                          : "text-neutral-400"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                        isCurrent
                          ? "bg-violet-600 text-white"
                          : isDone
                            ? "bg-emerald-500 text-white"
                            : "bg-neutral-200 text-neutral-500"
                      }`}
                    >
                      {isDone ? "✓" : n}
                    </span>
                    <span className="hidden xl:inline">{label}</span>
                  </span>
                </React.Fragment>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3 shrink-0">
          {!done && (
            <span className="md:hidden text-[11px] font-semibold text-neutral-500">
              Step {active} of {totalSteps}
            </span>
          )}
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted</span>
          </span>
        </div>
      </header>

      {/* Mobile progress bar */}
      {!done && (
        <div className="md:hidden shrink-0 h-0.5 bg-neutral-200" aria-hidden="true">
          <div
            className="h-full bg-violet-600 transition-all duration-300"
            style={{ width: `${(active / totalSteps) * 100}%` }}
          />
        </div>
      )}

      {/* Content column */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="min-h-full flex items-start sm:items-center justify-center px-4 py-5 sm:p-8">
          <div className="w-full max-w-[560px] bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
