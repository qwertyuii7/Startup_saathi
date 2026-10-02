"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import CardNav from "@/components/landing/CardNav";
import Footer from "@/components/Footer";

type EaseTuple = [number, number, number, number];
const EASE: EaseTuple = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: EASE },
  }),
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type AuthMode = "login" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const validate = (f = form) => {
    const e: { email?: string; password?: string } = {};
    if (!f.email.trim()) {
      e.email = "Email address is required.";
    } else if (!validateEmail(f.email)) {
      e.email = "Please enter a valid email address.";
    }
    if (mode === "login") {
      if (!f.password) {
        e.password = "Password is required.";
      } else if (f.password.length < 8) {
        e.password = "Password must be at least 8 characters.";
      }
    }
    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name as keyof typeof touched]) {
      setErrors(validate(next));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const fillDemoAccount = () => {
    const demo = { email: "founder@startupsaathi.in", password: "Password@123" };
    setForm(demo);
    setTouched({ email: true, password: true });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = { email: true, password: true };
    setTouched(allTouched);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");
    setErrorMsg("");

    await new Promise((r) => setTimeout(r, 1400));

    if (mode === "forgot") {
      setForgotSent(true);
      setStatus("idle");
      return;
    }

    // Success flow - redirect to dashboard
    setStatus("success");
    setTimeout(() => router.push("/dashboard"), 800);
  };

  const handleOAuthGoogle = () => {
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 800);
    }, 1200);
  };

  const fieldClass = (field: "email" | "password") =>
    `w-full px-4 py-3.5 bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border rounded-xl text-sm text-white placeholder:text-neutral-500 outline-none transition-all duration-200 ${
      touched[field] && errors[field]
        ? "border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
        : "border-white/10 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/25"
    }`;

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white font-default selection:bg-violet-500 selection:text-white flex flex-col justify-between relative overflow-x-hidden">
      {/* Top GSAP-enabled CardNav matching landing page & public pages */}
      <CardNav
        baseColor="#0A0A0A"
        menuColor="#fff"
        buttonBgColor="#fff"
        buttonTextColor="#000"
        items={[
          {
            label: "Product",
            bgColor: "#1B1722",
            textColor: "#fff",
            links: [
              { label: "Scheme Discovery", href: "/dashboard" },
              { label: "Eligibility Simulator", href: "/simulator" },
            ],
          },
          {
            label: "Solutions",
            bgColor: "#2F293A",
            textColor: "#fff",
            links: [
              { label: "For Startups", href: "/startups" },
              { label: "For Incubators", href: "/incubators" },
            ],
          },
          {
            label: "Resources",
            bgColor: "#1B1722",
            textColor: "#fff",
            links: [
              { label: "Policy Updates", href: "/updates" },
              { label: "Contact Us", href: "/contact" },
            ],
          },
        ]}
      />

      {/* Main Container with landing page atmospheric aurora glow & purple grid */}
      <main className="relative flex-1 flex items-center justify-center pt-32 pb-20 px-6 sm:px-8 overflow-hidden">
        {/* Abstract Background Elements identical to Hero & CTA on landing page */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-r from-violet-600/25 via-fuchsia-600/20 to-orange-600/20 blur-[130px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-10 right-10 w-[450px] h-[350px] bg-violet-900/15 blur-[120px] rounded-full" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(139,92,246,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.12) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/40 to-[#0A0A0A]" />
        </div>

        {/* 2-Column Responsive Layout: Left Value Prop, Right Auth Card */}
        <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Brand Story & Live Scheme Highlights */}
          <motion.div
            variants={fadeUp}
            initial={shouldReduceMotion ? "show" : "hidden"}
            animate="show"
            className="lg:col-span-6 flex flex-col justify-center text-left"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium w-fit mb-6">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Government funding, demystified</span>
            </div>

            {/* Heading with landing page gradient */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight text-white leading-[1.12] mb-6">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400">
                Startup Saathi.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed mb-8 max-w-lg font-light">
              Log in to your founder portal to simulate eligibility, track DPIIT scheme updates, and generate AI-backed grant applications.
            </p>

            {/* 3 Core Value Props matching landing page */}
            <div className="space-y-3.5 mb-10 max-w-lg">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm hover:border-violet-500/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-white">500+ Schemes Indexed</h2>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    Central ministries and 28 state startup policies tracked with clause-level precision.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm hover:border-violet-500/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-white">Evidence-Based Eligibility</h2>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    Instant rule verification citing official policy clauses — know why you qualify.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm hover:border-violet-500/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4 h-4 text-fuchsia-400" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-white">Bank-Grade Confidentiality</h2>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    Your DPIIT certificates and financial disclosures are encrypted and protected.
                  </p>
                </div>
              </div>
            </div>

            {/* Social proof logos from landing page */}
            <div className="border-t border-white/10 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                Trusted by modern Indian startups
              </p>
              <div className="flex flex-wrap items-center gap-6 text-neutral-400 text-sm font-display font-semibold tracking-tight">
                <span className="hover:text-white transition-colors">Razorpay</span>
                <span className="hover:text-white transition-colors">Zerodha</span>
                <span className="hover:text-white transition-colors">CRED</span>
                <span className="hover:text-white transition-colors">Groww</span>
                <span className="hover:text-white transition-colors">Meesho</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Premium Auth Card */}
          <motion.div
            variants={fadeUp}
            initial={shouldReduceMotion ? "show" : "hidden"}
            animate="show"
            custom={1}
            className="lg:col-span-6 w-full max-w-md mx-auto"
          >
            <div className="relative rounded-3xl border border-white/10 bg-[#121118]/85 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl shadow-violet-950/40 overflow-hidden">
              {/* Top ambient gradient accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: "linear-gradient(90deg, #7c3aed, #ec4899, #f97316)" }}
              />

              {/* Demo pre-fill quick pill */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                  <span>Demo Mode</span>
                </div>
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className="text-xs font-medium text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Auto-fill demo credentials
                </button>
              </div>

              <AnimatePresence mode="wait">
                {/* --- LOGIN MODE --- */}
                {mode === "login" && (
                  <motion.div
                    key="login"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-2xl font-display font-medium text-white tracking-tight">
                        Log in to your account
                      </h2>
                      <p className="text-sm text-neutral-400 mt-1">
                        Enter your credentials to access your dashboard
                      </p>
                    </div>

                    {/* OAuth Button */}
                    <button
                      type="button"
                      onClick={handleOAuthGoogle}
                      disabled={status === "loading" || status === "success"}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.14] border border-white/10 rounded-xl text-sm font-medium text-white transition-all mb-5 shadow-sm group"
                      id="login-google"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-xs uppercase tracking-wider text-neutral-500">or with email</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Main Form */}
                    <form onSubmit={handleSubmit} noValidate aria-label="Login form" className="space-y-4">
                      {/* Global Feedback Banners */}
                      <AnimatePresence>
                        {status === "error" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            role="alert"
                            className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-300"
                          >
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                            <span>{errorMsg || "Invalid credentials. Please verify and try again."}</span>
                          </motion.div>
                        )}
                        {status === "success" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            role="status"
                            className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm text-emerald-300"
                          >
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                            <span>Authentication successful! Redirecting to dashboard…</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Email field */}
                      <div>
                        <label
                          htmlFor="login-email"
                          className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2"
                        >
                          Work Email
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="login-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={handleChange}
                            onBlur={() => handleBlur("email")}
                            placeholder="founder@startup.in"
                            className={`${fieldClass("email")} pl-10`}
                            aria-required="true"
                            aria-invalid={touched.email && !!errors.email}
                            aria-describedby={errors.email ? "login-email-error" : undefined}
                          />
                        </div>
                        {touched.email && errors.email && (
                          <p id="login-email-error" role="alert" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>

                      {/* Password field */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label
                            htmlFor="login-password"
                            className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider"
                          >
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setMode("forgot");
                              setForgotSent(false);
                            }}
                            className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="login-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            value={form.password}
                            onChange={handleChange}
                            onBlur={() => handleBlur("password")}
                            placeholder="••••••••••••"
                            className={`${fieldClass("password")} pl-10 pr-10`}
                            aria-required="true"
                            aria-invalid={touched.password && !!errors.password}
                            aria-describedby={errors.password ? "login-password-error" : undefined}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {touched.password && errors.password && (
                          <p id="login-password-error" role="alert" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.password}</span>
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        id="login-submit"
                        disabled={status === "loading" || status === "success"}
                        className="w-full py-3.5 mt-2 bg-gradient-to-r from-violet-600 via-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Authenticating…</span>
                          </>
                        ) : status === "success" ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Redirecting to Dashboard…</span>
                          </>
                        ) : (
                          <>
                            <span>Log In</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="text-center text-xs text-neutral-400 mt-6">
                      Don't have an account?{" "}
                      <Link href="/onboarding" className="text-violet-400 hover:text-violet-300 font-semibold hover:underline">
                        Get started free →
                      </Link>
                    </p>
                  </motion.div>
                )}

                {/* --- FORGOT PASSWORD MODE --- */}
                {mode === "forgot" && (
                  <motion.div
                    key="forgot"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mb-6">
                      <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center mb-4">
                        <Lock className="w-5 h-5 text-violet-400" />
                      </div>
                      <h2 className="text-2xl font-display font-medium text-white tracking-tight">
                        Reset password
                      </h2>
                      <p className="text-sm text-neutral-400 mt-1">
                        Enter your registered email and we'll send you a recovery link
                      </p>
                    </div>

                    {forgotSent ? (
                      <div className="flex flex-col items-center text-center py-6">
                        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                        </div>
                        <h3 className="font-display font-medium text-lg text-white mb-2">Check your inbox</h3>
                        <p className="text-sm text-neutral-400 mb-6 max-w-xs">
                          We sent a password reset link to{" "}
                          <span className="font-medium text-violet-300">{form.email}</span>.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setMode("login");
                            setForgotSent(false);
                          }}
                          className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                          ← Back to log in
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} noValidate aria-label="Password reset form" className="space-y-4">
                        <div>
                          <label
                            htmlFor="forgot-email"
                            className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2"
                          >
                            Work Email
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              id="forgot-email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              value={form.email}
                              onChange={handleChange}
                              onBlur={() => handleBlur("email")}
                              placeholder="founder@startup.in"
                              className={`${fieldClass("email")} pl-10`}
                              aria-required="true"
                              aria-invalid={touched.email && !!errors.email}
                              aria-describedby={errors.email ? "forgot-email-error" : undefined}
                            />
                          </div>
                          {touched.email && errors.email && (
                            <p id="forgot-email-error" role="alert" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{errors.email}</span>
                            </p>
                          )}
                        </div>

                        <button
                          type="submit"
                          id="forgot-submit"
                          disabled={status === "loading"}
                          className="w-full py-3.5 bg-gradient-to-r from-violet-600 via-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 text-sm"
                        >
                          {status === "loading" ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Sending reset link…</span>
                            </>
                          ) : (
                            <>
                              <span>Send Reset Link</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="w-full text-xs text-neutral-400 hover:text-white transition-colors text-center py-2"
                        >
                          ← Return to log in
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Security / Terms note */}
              <div className="mt-6 pt-5 border-t border-white/10 text-center">
                <p className="text-[11px] text-neutral-500">
                  Protected by 256-bit encryption. By signing in, you agree to our{" "}
                  <a href="#" className="text-neutral-400 hover:text-neutral-300 underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-neutral-400 hover:text-neutral-300 underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer matching all public pages */}
      <Footer />
    </div>
  );
}
