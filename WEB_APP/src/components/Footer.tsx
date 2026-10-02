"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import PixelCard from "@/components/landing/PixelCard";

export interface FooterProps {
  showCta?: boolean;
}

export default function Footer({ showCta = true }: FooterProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer role="contentinfo" className="relative w-full overflow-hidden bg-[#0A0A0A] text-white font-default border-t border-white/10">
      {showCta ? (
        <PixelCard 
          variant="default" 
          className="w-full flex flex-col justify-between bg-[#0A0A0A]"
          gap={12}
          speed={45}
          colors="#a78bfa,#e879f9,#fb923c,#c084fc,#f472b6"
        >
          {/* Main CTA matching the landing page */}
          <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-6 py-16 sm:py-20">
            <motion.h2 
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-semibold tracking-tight text-white font-display mb-6 leading-tight"
            >
              Ready to claim your unfair advantage?
            </motion.h2>
            
            <motion.p 
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-base md:text-lg text-neutral-300 mb-8 max-w-2xl font-light leading-relaxed"
            >
              Join hundreds of Indian startups successfully navigating government grants, schemes, and incubator matching with AI precision.
            </motion.p>
            
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link 
                href="/dashboard" 
                className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-medium text-lg hover:bg-neutral-100 transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-sm text-neutral-400 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>No credit card required. Free forever for basic use.</span>
            </motion.p>
          </div>

          {/* Navigation Columns styled in dark aesthetic */}
          <nav aria-label="Footer Navigation" className="relative z-20 w-full border-t border-white/10 bg-black/30 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 sm:py-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-4">
                    Product
                  </h3>
                  <ul className="space-y-2.5 text-sm text-neutral-400">
                    <li>
                      <Link href="/dashboard" className="hover:text-white transition-colors">
                        Scheme Discovery
                      </Link>
                    </li>
                    <li>
                      <Link href="/simulator" className="hover:text-white transition-colors">
                        Eligibility Simulator
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard" className="hover:text-white transition-colors">
                        Application Copilot
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-4">
                    Solutions
                  </h3>
                  <ul className="space-y-2.5 text-sm text-neutral-400">
                    <li>
                      <Link href="/startups" className="hover:text-white transition-colors">
                        For Startups
                      </Link>
                    </li>
                    <li>
                      <Link href="/incubators" className="hover:text-white transition-colors">
                        For Incubators
                      </Link>
                    </li>
                    <li>
                      <Link href="/startups" className="hover:text-white transition-colors">
                        DPIIT Verification
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-4">
                    Resources
                  </h3>
                  <ul className="space-y-2.5 text-sm text-neutral-400">
                    <li>
                      <Link href="/updates" className="hover:text-white transition-colors">
                        Policy Updates
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="hover:text-white transition-colors">
                        Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/login" className="hover:text-white transition-colors">
                        Founder Portal
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-4">
                    About
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                    Built by Team IceCube during Codeblitz 2.0 to empower India's next generation of startup founders.
                  </p>
                  <div className="flex items-center gap-4">
                    <a href="#" aria-label="Twitter" className="text-neutral-400 hover:text-white transition-colors">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a href="#" aria-label="GitHub" className="text-neutral-400 hover:text-white transition-colors">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="#" aria-label="LinkedIn" className="text-neutral-400 hover:text-white transition-colors">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Integrated Footer Bar */}
          <div className="relative z-20 w-full border-t border-white/10 bg-black/40 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-5">
              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <Link href="/" className="flex items-center gap-2 tracking-tight text-white hover:opacity-90 transition-opacity">
                  <span className="font-serif italic font-light text-2xl pr-0.5">SS</span>
                  <span className="font-medium text-lg">Startup Saathi</span>
                </Link>
                <p className="text-sm text-neutral-500 font-light text-center md:text-left">
                  &copy; {new Date().getFullYear()} Codeblitz 2.0 (IceCube Team). All rights reserved.
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      ) : (
        /* Compact variant: Sleek dark nav links & bottom bar matching landing page */
        <div className="w-full bg-[#0A0A0A]">
          <nav aria-label="Footer Navigation" className="border-t border-white/10 bg-black/30 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <Link href="/" className="flex items-center gap-2 tracking-tight text-white hover:opacity-90 transition-opacity">
                  <span className="font-serif italic font-light text-2xl pr-0.5">SS</span>
                  <span className="font-medium text-lg">Startup Saathi</span>
                </Link>
                <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-400">
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Scheme Discovery
                  </Link>
                  <Link href="/startups" className="hover:text-white transition-colors">
                    For Startups
                  </Link>
                  <Link href="/incubators" className="hover:text-white transition-colors">
                    For Incubators
                  </Link>
                  <Link href="/updates" className="hover:text-white transition-colors">
                    Policy Updates
                  </Link>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <div className="border-t border-white/10 bg-black/40 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-5">
              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <p className="text-sm text-neutral-500 font-light">
                  &copy; {new Date().getFullYear()} Codeblitz 2.0 (IceCube Team). All rights reserved.
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
