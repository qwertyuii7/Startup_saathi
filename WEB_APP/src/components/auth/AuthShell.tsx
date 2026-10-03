"use client";

import Image from "next/image";
import { ShieldCheck, FileSearch, Sparkles } from "lucide-react";

/**
 * Dedicated auth layout shell — full viewport, fixed, no page scroll.
 * Auth pages must NEVER inherit the app navbar, sidebar, or footer;
 * this shell is the only chrome they render.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh w-screen overflow-hidden bg-[#0A0A0A] text-white flex flex-col lg:grid lg:grid-cols-[1fr_1.1fr]">
      {/* Brand panel — condensed bar on mobile, full panel on desktop */}
      <div className="relative shrink-0 overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r">
        {/* backdrop */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-violet-600/25 blur-[110px]" />
          <div className="absolute -bottom-40 -right-24 w-[460px] h-[460px] rounded-full bg-fuchsia-600/15 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.14] hidden lg:block"
            style={{
              backgroundImage:
                "linear-gradient(rgba(139,92,246,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.35) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>

        <div className="relative flex items-center gap-2.5 px-5 py-4 lg:flex-col lg:items-start lg:justify-between lg:h-full lg:p-10">
          <div className="flex items-center gap-2.5">
            <span className="relative block w-9 h-9 rounded-xl overflow-hidden shrink-0">
              <Image src="/logo.png" alt="AROVA" width={36} height={36} className="object-contain w-full h-full" priority />
            </span>
            <span className="leading-none">
              <span className="block font-bold text-[15px] tracking-tight">AROVA</span>
              <span className="block text-[10px] font-semibold tracking-[0.18em] text-violet-300">INTELLIGENCE</span>
            </span>
          </div>

          <div className="hidden lg:block max-w-md">
            <h1 className="font-display text-4xl xl:text-[2.75rem] font-medium tracking-tight leading-[1.08]">
              Government funding,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-orange-300">
                decoded for founders.
              </span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              AROVA verifies your startup against Central and State scheme clauses —
              with document evidence for every claim.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: FileSearch, title: "Clause-level eligibility", desc: "Every requirement traced to an official source." },
                { icon: ShieldCheck, title: "Evidence-backed answers", desc: "Citations from your own uploaded documents." },
                { icon: Sparkles, title: "Audit-ready drafts", desc: "Applications generated from verified workspace data." },
              ].map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-violet-300" />
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold">{f.title}</span>
                    <span className="block text-xs text-neutral-400 mt-0.5">{f.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="hidden lg:block text-[11px] text-neutral-500">
            © {new Date().getFullYear()} AROVA Intelligence · Secure sign-in
          </p>
        </div>
      </div>

      {/* Form column — centers content; scrolls internally only on short viewports */}
      <div className="relative flex-1 min-h-0 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center px-4 py-6 sm:px-8 sm:py-8">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
