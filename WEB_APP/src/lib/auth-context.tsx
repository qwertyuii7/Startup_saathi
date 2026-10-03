"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  onboardingCompleted: boolean;
  onboardingStep: number;
}

interface AuthContextType {
  user: SafeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Exchange a Google ID-token credential for a cookie session. */
  loginWithGoogleCredential: (credential: string) => Promise<SafeUser>;
  /** Real email/password login. */
  loginWithEmail: (email: string, password: string) => Promise<SafeUser>;
  /** Real email/password registration (new users land in onboarding). */
  registerWithEmail: (name: string, email: string, password: string, confirmPassword: string) => Promise<SafeUser>;
  /**
   * Adopt a server-confirmed user object directly (e.g. from the
   * onboarding-complete response). Avoids a second round-trip race
   * where a transient refresh failure would wipe fresh auth state.
   */
  setAuthUser: (user: SafeUser) => void;
  /** Alias of loginWithGoogleCredential. */
  login: (credential: string) => Promise<SafeUser>;
  logout: () => Promise<void>;
  refreshUser: (opts?: { force?: boolean; keepOnError?: boolean }) => Promise<SafeUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Where an authenticated user should land based on onboarding state. */
export function resolvePostLoginDestination(
  user: SafeUser,
  redirectTarget?: string
): string {
  if (!user.onboardingCompleted) return "/onboarding";
  return redirectTarget && redirectTarget.startsWith("/") ? redirectTarget : "/dashboard";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(null);
  // Single in-flight auth request guard — prevents duplicate /api/auth/me
  // calls and double login submissions racing each other.
  const inFlightRef = React.useRef<Promise<SafeUser | null> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // The initial auth check must ALWAYS settle: a 15s abort guarantees
  // the app can never stick on the loading screen, even if the network
  // or server hangs. Timeout/error → logged-out state (pages redirect).
  // Generation guard: only the latest refresh may write state, so a
  // forced retry can never be overwritten by a stale in-flight request.
  const genRef = React.useRef(0);
  const refreshUser = useCallback(async (opts?: { force?: boolean; keepOnError?: boolean }): Promise<SafeUser | null> => {
    if (inFlightRef.current && !opts?.force) return inFlightRef.current;
    const gen = ++genRef.current;
    const startedAt = Date.now();
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[auth] refreshUser start (force=${!!opts?.force})`);
    }
    const p = (async () => {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 15000);
      const isLatest = () => genRef.current === gen;
      try {
        const res = await api.auth.getMe(ctrl.signal);
        // A newer refresh superseded this one — let it own the state.
        if (!isLatest()) return null;
        if (res.success && res.user) {
          setUser(res.user);
          if (process.env.NODE_ENV !== "production") {
            console.debug(`[auth] refreshUser ok in ${Date.now() - startedAt}ms`);
          }
          return res.user as SafeUser;
        }
        // Authenticated endpoint says otherwise → logged out.
        setUser(null);
        return null;
      } catch (e: unknown) {
        if (process.env.NODE_ENV !== "production") {
          const reason = e instanceof DOMException && e.name === "AbortError" ? "timeout(15s)" : e instanceof Error ? e.message : "network";
          console.debug(`[auth] refreshUser failed in ${Date.now() - startedAt}ms: ${reason}`);
        }
        // keepOnError: a background re-sync must NEVER wipe fresh auth
        // state (e.g. right after onboarding completion) — the session
        // cookie + middleware remain the enforcement point.
        if (isLatest() && !opts?.keepOnError) {
          setUser(null);
        }
        return null;
      } finally {
        window.clearTimeout(timer);
        if (isLatest()) {
          setIsLoading(false);
          inFlightRef.current = null;
        }
      }
    })();
    inFlightRef.current = p;
    return p;
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const withTimeout = async <T,>(fn: (signal: AbortSignal) => Promise<T>): Promise<T> => {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 30000);
    try {
      return await fn(ctrl.signal);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") {
        throw new Error("The request timed out. Please check your connection and try again.");
      }
      throw e;
    } finally {
      window.clearTimeout(timer);
    }
  };

  const loginWithGoogleCredential = useCallback(
    async (credential: string): Promise<SafeUser> => {
      if (!credential) {
        throw new Error("Google sign-in did not return a valid credential. Please try again.");
      }
      const res = await withTimeout((signal) => api.auth.loginWithGoogle({ credential }, signal));
      if (res.success && res.user) {
        setUser(res.user as SafeUser);
        setIsLoading(false);
        return res.user as SafeUser;
      }
      throw new Error("Authentication failed. Please try again.");
    },
    []
  );

  const loginWithEmail = useCallback(
    async (email: string, password: string): Promise<SafeUser> => {
      const res = await withTimeout((signal) => api.auth.loginWithEmail({ email, password }, signal));
      if (res.success && res.user) {
        setUser(res.user as SafeUser);
        setIsLoading(false);
        return res.user as SafeUser;
      }
      throw new Error("Authentication failed. Please try again.");
    },
    []
  );

  const registerWithEmail = useCallback(
    async (name: string, email: string, password: string, confirmPassword: string): Promise<SafeUser> => {
      const res = await withTimeout((signal) =>
        api.auth.registerWithEmail({ name, email, password, confirmPassword }, signal)
      );
      if (res.success && res.user) {
        setUser(res.user as SafeUser);
        setIsLoading(false);
        return res.user as SafeUser;
      }
      throw new Error("Registration failed. Please try again.");
    },
    []
  );

  const setAuthUser = useCallback((nextUser: SafeUser) => {
    setUser(nextUser);
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {    try {
      await api.auth.logout();
    } catch (e) {
      console.warn("Logout error:", e);
    } finally {
      setUser(null);
      router.push("/login");
      // Refresh server components / middleware state.
      router.refresh();
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogleCredential,
        loginWithEmail,
        registerWithEmail,
        setAuthUser,
        login: loginWithGoogleCredential,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
