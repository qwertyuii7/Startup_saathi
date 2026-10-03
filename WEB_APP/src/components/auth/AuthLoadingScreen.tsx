"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { RefreshCw } from "lucide-react";

/**
 * Clean AROVA auth loading state — shown while /api/auth/me resolves.
 * If still mounted after ~10s, offers a manual retry so the UI can
 * never present a dead-end infinite spinner.
 */
export function AuthLoadingScreen({
  message = "Checking your workspace...",
  showRetry = false,
  onRetry,
}: {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setSlow(true), 10000);
    return () => window.clearTimeout(t);
  }, []);

  const canRetry = showRetry || slow;

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-5 px-6 text-center"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-violet-950/50">
        <Image src="/logo.png" alt="AROVA logo" width={56} height={56} className="object-contain w-full h-full" priority />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-6 h-6 rounded-full border-2 border-white/15 border-t-violet-400 animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm text-neutral-400">{message}</p>
        {canRetry && onRetry && (
          <div className="mt-2 space-y-2">
            <p className="text-[11px] text-neutral-500">Taking longer than usual — the server may be starting up.</p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry session check</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
