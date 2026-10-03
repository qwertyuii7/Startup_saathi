"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, MapPin, ExternalLink, CheckCircle2, ArrowRight, Search } from "lucide-react";
import { api } from "@/lib/api-client";

export default function IncubatorsDiscoveryPage() {
  const [incubators, setIncubators] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadIncubators() {
      try {
        const res = await api.incubators.list();
        if (res.success && res.incubators) {
          setIncubators(res.incubators);
        }
      } catch (err) {
        console.warn("Incubators error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadIncubators();
  }, []);

  const filteredIncubators = incubators.filter((inc) => {
    return (
      inc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.focusArea.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 max-w-none w-full">
      {/* Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Incubator Matches</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Partner host institutes accredited to endorse and disburse government seed funding.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, sector, or institute..."
            className="pl-9 pr-4 py-2 bg-white border border-neutral-200/90 rounded-xl text-xs text-neutral-900 outline-none focus:border-violet-500 transition-all w-60 sm:w-72"
          />
        </div>
      </div>

      {/* Incubator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIncubators.map((inc) => (
          <div
            key={inc.id}
            className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 leading-snug">
                    {inc.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{inc.location}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-neutral-600">
                  <span className="font-semibold text-neutral-800">Focus Areas: </span>
                  <span>{inc.focusArea}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="font-semibold text-neutral-800 block">Key Partner Benefits:</span>
                <ul className="space-y-1 text-neutral-600">
                  {inc.benefits?.map((b: string, i: number) => (
                    <li key={i} className="flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  Status: {inc.applicationStatus}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
              <a
                href={inc.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-all"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/deep-analysis/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-2xs transition-all"
              >
                <span>Evaluate Match</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
