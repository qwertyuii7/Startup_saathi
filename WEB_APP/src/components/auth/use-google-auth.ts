"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, resolvePostLoginDestination, type SafeUser } from "@/lib/auth-context";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (notification?: (n: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getDismissedReason: () => string;
            getNotDisplayedReason: () => string;
          }) => void) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export type GoogleStatus = "idle" | "loading" | "success" | "error";

/**
 * Google Identity Services wiring (ID-token flow).
 * Renders the official GIS button into a hidden host; the visible
 * "Continue with Google" button delegates to it so the real Google
 * account-chooser popup opens. The credential is verified on the
 * backend — never trusted from the client.
 */
export function useGoogleAuth(redirectTarget: string) {
  const router = useRouter();
  const { loginWithGoogleCredential } = useAuth();
  const [status, setStatus] = useState<GoogleStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [gsiReady, setGsiReady] = useState(false);
  const authInFlight = useRef(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const fail = useCallback((message: string) => {
    setStatus("error");
    setErrorMsg(message);
    authInFlight.current = false;
  }, []);

  const handleGoogleCredentialResponse = useCallback(
    async (response: { credential?: string } | undefined) => {
      if (!response || !response.credential) {
        fail("Google sign-in did not return a valid credential. Please try again.");
        return;
      }
      if (authInFlight.current) return;
      authInFlight.current = true;
      setStatus("loading");
      setErrorMsg("");
      try {
        const loggedUser: SafeUser = await loginWithGoogleCredential(response.credential);
        setStatus("success");
        const destination = resolvePostLoginDestination(loggedUser, redirectTarget);
        window.setTimeout(() => router.push(destination), 350);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Google sign-in failed. Please try again.";
        fail(message);
      } finally {
        authInFlight.current = false;
      }
    },
    [loginWithGoogleCredential, redirectTarget, router, fail]
  );

  const initializeGSI = useCallback(() => {
    if (typeof window === "undefined" || !window.google?.accounts?.id) return;
    if (!googleClientId) {
      fail("Google sign-in is not configured (missing client ID). Please contact support.");
      return;
    }
    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (resp: { credential?: string }) => {
          void handleGoogleCredentialResponse(resp);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
        itp_support: true,
      });
      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 320,
        });
      }
      setGsiReady(true);
    } catch {
      fail("Could not start Google sign-in. Please reload and try again.");
    }
  }, [googleClientId, handleGoogleCredentialResponse, fail]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id && !gsiReady) {
      const t = window.setTimeout(() => initializeGSI(), 0);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [initializeGSI, gsiReady]);

  const triggerGoogle = useCallback(() => {
    if (status === "loading" || status === "success") return;
    if (typeof window === "undefined" || !window.google?.accounts?.id || !gsiReady) {
      fail(
        "Google sign-in is still loading or was blocked. Check your connection (or allow accounts.google.com) and try again."
      );
      return;
    }
    try {
      const host = googleBtnRef.current;
      const clickable = host?.firstElementChild as HTMLElement | null;
      if (clickable) {
        clickable.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      }
      window.google.accounts.id.prompt(() => undefined);
      setStatus("loading");
      setErrorMsg("");
      window.setTimeout(() => {
        if (!authInFlight.current) {
          setStatus((s) => (s === "loading" ? "idle" : s));
        }
      }, 1500);
    } catch {
      fail("Google sign-in failed. Please try again.");
    }
  }, [status, gsiReady, fail]);

  const reset = useCallback(() => {
    setStatus("idle");
    setErrorMsg("");
    authInFlight.current = false;
    initializeGSI();
  }, [initializeGSI]);

  return { status, errorMsg, gsiReady, googleBtnRef, googleClientId, triggerGoogle, reset, initializeGSI, fail };
}
