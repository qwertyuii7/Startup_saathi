"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Mail,
  Lock,
  User,
} from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen";
import { useGoogleAuth } from "@/components/auth/use-google-auth";
import { useAuth, resolvePostLoginDestination } from "@/lib/auth-context";
import { passwordIssues } from "@/lib/auth/password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function inputClass(invalid: boolean) {
  return `w-full px-3.5 py-2.5 bg-white/[0.05] border rounded-xl text-sm text-white placeholder:text-neutral-500 outline-none transition-all ${
    invalid
      ? "border-red-500/70 focus:border-red-400"
      : "border-white/10 focus:border-violet-400 focus:bg-white/[0.07]"
  }`;
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "";
  const { loginWithEmail, registerWithEmail, user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const google = useGoogleAuth(redirectTarget);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      router.replace(resolvePostLoginDestination(user, redirectTarget));
    }
  }, [authLoading, isAuthenticated, user, router, redirectTarget]);

  const emailInvalid = touched.email && (!email.trim() || !EMAIL_RE.test(email.trim()));
  const nameInvalid = mode === "register" && touched.name && !name.trim();
  const pwInvalid = touched.password && (mode === "login" ? !password : passwordIssues(password).length > 0);
  const confirmInvalid = mode === "register" && touched.confirm && confirm !== password;

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    const em = email.trim();
    if (!em || !EMAIL_RE.test(em)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (mode === "login") {
      if (!password) {
        setError("Please enter your password.");
        return;
      }
    } else {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      const issues = passwordIssues(password);
      if (issues.length > 0) {
        setError(`Password must include ${issues.join(", ")}.`);
        return;
      }
      if (confirm !== password) {
        setError("Passwords do not match.");
        return;
      }
    }
    if (busy || done) return;
    setBusy(true);
    setError("");
    try {
      const loggedUser =
        mode === "login"
          ? await loginWithEmail(em, password)
          : await registerWithEmail(name.trim(), em, password, confirm);
      setDone(true);
      const destination = resolvePostLoginDestination(loggedUser, redirectTarget);
      window.setTimeout(() => router.push(destination), 350);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setError("");
    setDone(false);
    setTouched({});
  };

  if (authLoading) {
    return <AuthLoadingScreen onRetry={() => refreshUser({ force: true }).catch(() => undefined)} />;
  }

  const gBusy = google.status === "loading" || google.status === "success";

  return (
    <AuthShell>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={google.initializeGSI}
        onError={() => google.fail("Could not load Google sign-in. Check your connection and try again.")}
      />
      {/* Hidden official GIS button host */}
      <div aria-hidden="true" tabIndex={-1} className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none">
        <div ref={google.googleBtnRef} />
      </div>

      <div className="sm:hidden mb-4 text-center">
        <p className="text-sm text-neutral-400">Sign in to your founder workspace</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/[0.05] border border-white/10 mb-5" role="tablist">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={`py-2 rounded-lg text-[13px] font-semibold transition-all ${
              mode === m ? "bg-white/[0.1] text-white shadow" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {m === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <h1 className="text-xl font-display font-medium tracking-tight">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="text-[13px] text-neutral-400 mt-1 mb-5">
        {mode === "login"
          ? "Access your startup intelligence workspace."
          : "Start with email — onboarding takes a few minutes."}
      </p>

      {/* Google */}
      <button
        type="button"
        onClick={google.triggerGoogle}
        disabled={gBusy || busy}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {google.status === "loading" ? (
          <Loader2 className="w-[18px] h-[18px] animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        <span>
          {google.status === "loading"
            ? "Connecting to Google..."
            : google.status === "success"
              ? "Verified — redirecting…"
              : "Continue with Google"}
        </span>
      </button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[11px] uppercase tracking-wider text-neutral-500">or with email</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Status banners */}
      {(error || google.errorMsg) && (
        <div role="alert" className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{error || google.errorMsg}</p>
            <button
              type="button"
              onClick={() => { setError(""); google.reset(); }}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold underline"
            >
              <RefreshCw className="w-3 h-3" /> Try again
            </button>
          </div>
        </div>
      )}
      {(done || google.status === "success") && (
        <div role="status" className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Verified — opening your workspace…</span>
        </div>
      )}

      {/* Email form */}
      <form onSubmit={submitEmail} noValidate className="space-y-3">
        {mode === "register" && (
          <div>
            <label htmlFor="auth-name" className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Full name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="Your full name"
                className={`${inputClass(!!nameInvalid)} pl-9`}
              />
            </div>
            {nameInvalid && <p className="mt-1 text-[11px] text-red-400">Full name is required.</p>}
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="founder@startup.in"
              className={`${inputClass(!!emailInvalid)} pl-9`}
            />
          </div>
          {emailInvalid && <p className="mt-1 text-[11px] text-red-400">Enter a valid email address.</p>}
        </div>

        <div>
          <label htmlFor="auth-password" className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="auth-password"
              type={showPw ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder={mode === "login" ? "Your password" : "8+ chars, upper, lower, number"}
              className={`${inputClass(!!pwInvalid)} pl-9 pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {pwInvalid && (
            <p className="mt-1 text-[11px] text-red-400">
              {mode === "login"
                ? "Password is required."
                : `Must include ${passwordIssues(password).join(", ")}.`}
            </p>
          )}
        </div>

        {mode === "register" && (
          <div>
            <label htmlFor="auth-confirm" className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="auth-confirm"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                placeholder="Repeat your password"
                className={`${inputClass(!!confirmInvalid)} pl-9`}
              />
            </div>
            {confirmInvalid && <p className="mt-1 text-[11px] text-red-400">Passwords do not match.</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || done || gBusy}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{mode === "login" ? "Signing in..." : "Creating account..."}</span>
            </>
          ) : done ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Redirecting…</span>
            </>
          ) : (
            <span>{mode === "login" ? "Sign in" : "Create account"}</span>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-[11px] text-neutral-500">
        Protected by encrypted sessions. By continuing you agree to the Terms and Privacy Policy.
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <AuthForm />
    </Suspense>
  );
}
