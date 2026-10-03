"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthLoadingScreen } from "./AuthLoadingScreen";

type GuardMode =
  | "auth" // any authenticated user
  | "onboarding" // authenticated + onboarding incomplete
  | "completed"; // authenticated + onboarding completed

/**
 * Single reusable route-protection mechanism.
 *
 * - requireAuth()        → unauthenticated users go to /login
 * - requireOnboarding()  → completed users go to /dashboard, guests to /login
 * - requireCompletedOnboarding() → incomplete users go to /onboarding, guests to /login
 *
 * Server-side `middleware.ts` enforces the same rules; this guard only
 * prevents UI flicker on the client.
 *
 * Two hard guarantees:
 * 1. NEVER redirects to /login while auth is still loading.
 * 2. NEVER redirects to /login on a possibly-stale null user — it forces
 *    one fresh session check first, so a valid session can never cause a
 *    login redirect (this kills dashboard↔login redirect loops).
 */
export function RequireAuth({
  mode,
  children,
  loadingMessage,
}: {
  mode: GuardMode;
  children: React.ReactNode;
  loadingMessage?: string;
}) {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Safety net: if auth takes abnormally long, offer recovery instead
  // of an infinite spinner.
  const [stuck, setStuck] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setStuck(false);
      return;
    }
    const t = window.setTimeout(() => setStuck(true), 20000);
    return () => window.clearTimeout(t);
  }, [isLoading, pathname]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      // Re-verify before redirecting: a stale null must never bounce a
      // valid session to /login.
      let cancelled = false;
      setVerifying(true);
      refreshUser({ force: true })
        .then((fresh) => {
          if (cancelled) return;
          if (!fresh) {
            const target = pathname && pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
            router.replace(`/login${target}`);
          }
          // If fresh user arrived, state updates re-run this effect and
          // render children — no redirect.
        })
        .finally(() => {
          if (!cancelled) setVerifying(false);
        });
      return () => {
        cancelled = true;
      };
    }
    if (mode === "onboarding" && user.onboardingCompleted) {
      router.replace("/dashboard");
      return;
    }
    if (mode === "completed" && !user.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [isLoading, user, mode, router, pathname, refreshUser]);

  if (isLoading || !user || verifying) {
    return (
      <AuthLoadingScreen
        message={loadingMessage}
        showRetry={stuck}
        onRetry={() => {
          setStuck(false);
          refreshUser({ force: true }).catch(() => undefined);
        }}
      />
    );
  }
  if (mode === "onboarding" && user.onboardingCompleted) {
    return <AuthLoadingScreen message="Opening your workspace..." />;
  }
  if (mode === "completed" && !user.onboardingCompleted) {
    return <AuthLoadingScreen message="Resuming your setup..." />;
  }
  return <>{children}</>;
}

export function requireAuth(children: React.ReactNode) {
  return <RequireAuth mode="auth">{children}</RequireAuth>;
}

export function requireOnboarding(children: React.ReactNode) {
  return <RequireAuth mode="onboarding">{children}</RequireAuth>;
}

export function requireCompletedOnboarding(children: React.ReactNode) {
  return <RequireAuth mode="completed">{children}</RequireAuth>;
}
