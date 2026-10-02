"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden bg-brand-600 px-6 py-20 text-center shadow-2xl sm:px-16"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500 rounded-full blur-[100px] opacity-50" />
            <div className="absolute inset-0 bg-[url('https://assets.dub.co/misc/grid.svg')] opacity-20 filter invert" />
          </div>

          <h2 className="mx-auto max-w-2xl font-display text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Ready to find your <br/> government match?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-brand-100">
            Join the smart founders who use Startup Saathi to verify eligibility, 
            discover funding, and fast-track their applications.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="#"
              className="group flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-brand-600 shadow-sm hover:bg-brand-50 transition-all duration-200 hover:-translate-y-0.5"
            >
              Start Your Free Scan
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
