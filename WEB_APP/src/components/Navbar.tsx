"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Why Us", href: "#why-us" },
  { name: "Impact", href: "#impact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 w-full"
      >
        {/* Scrolled background */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            scrolled
              ? "border-b border-border-default bg-white/80 backdrop-blur-xl shadow-sm"
              : "border-b border-transparent bg-transparent"
          }`}
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md transition-transform duration-200 group-hover:scale-105">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
                </svg>
              </div>
              <span className="text-lg font-display font-bold text-content-primary tracking-tight">
                Startup <span className="text-brand-600">Saathi</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative px-3.5 py-2 text-sm font-medium text-content-secondary hover:text-content-primary rounded-lg transition-colors duration-150 hover:bg-brand-50/60"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* CTA buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="#"
                className="px-4 py-2 text-sm font-medium text-content-secondary hover:text-content-primary rounded-lg border border-border-default bg-white hover:bg-surface-secondary transition-all duration-150 shadow-sm"
              >
                Log in
              </Link>
              <Link
                href="#"
                className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 transition-all duration-200 shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/30"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden relative z-50 p-2 rounded-lg text-content-secondary hover:bg-surface-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl lg:hidden"
        >
          <nav className="flex flex-col items-center justify-center h-full gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-display font-semibold text-content-primary hover:text-brand-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-6 w-64">
              <Link
                href="#"
                className="w-full text-center px-6 py-3 text-sm font-medium rounded-xl border border-border-default bg-white text-content-primary"
              >
                Log in
              </Link>
              <Link
                href="#"
                className="w-full text-center px-6 py-3 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 shadow-md"
              >
                Get Started Free
              </Link>
            </div>
          </nav>
        </motion.div>
      )}
    </>
  );
}
