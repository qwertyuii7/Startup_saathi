"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, ExternalLink, CheckCircle2, Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { useAnalysis } from "@/lib/use-analysis";
import { api } from "@/lib/api-client";

interface EvidenceCard {
  id: string;
  title: string;
  type: string;
  category: "documents" | "sources";
  status: string;
  usedFor: string;
  detail: string;
  url?: string;
  sourceType: string;
}

export default function EvidencePage() {
  const params = useParams();
  const analysisId = params?.analysisId as string | undefined;
  const { analysis, isLoading, error, retry } = useAnalysis(analysisId);
  const [activeFilter, setActiveFilter] = useState<"all" | "documents" | "sources">("all");
  const [userDocs, setUserDocs] = useState<{ id: string; name: string; type: string; pageCount: number; storageUrl?: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    api.documents
      .list()
      .then((res) => {
        if (!cancelled) setUserDocs((res.documents || []) as typeof userDocs);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
        <span className="text-xs font-semibold text-neutral-500">Loading evidence…</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-10 rounded-2xl bg-white border border-red-200 text-center space-y-3">
        <p role="alert" className="text-xs text-red-600 font-medium">{error || "Analysis not found."}</p>
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Real evidence: document excerpts cited during evaluation + official
  // clause sources + the user's own uploaded documents.
  const cards: EvidenceCard[] = [];

  for (const f of analysis.findings || []) {
    for (const c of f.criteriaBreakdown || []) {
      if (c.evidenceSnippet && c.evidenceDocumentName) {
        cards.push({
          id: `${f.schemeId}-${c.requirementId}-doc`,
          title: c.evidenceDocumentName,
          type: "Startup Document",
          category: "documents",
          status: c.statusLabel,
          usedFor: c.requirement,
          detail: `“${c.evidenceSnippet.slice(0, 220)}${c.evidenceSnippet.length > 220 ? "…" : ""}”${typeof c.evidencePage === "number" ? ` — Page ${c.evidencePage}` : ""}`,
          sourceType: "Startup Document",
        });
      }
      const citationKey = `${c.sourceCitation.title}||${c.sourceCitation.clause}`;
      if (!cards.some((x) => x.id === `cite-${citationKey}`)) {
        cards.push({
          id: `cite-${citationKey}`,
          title: c.sourceCitation.title,
          type: "Official Government Source",
          category: "sources",
          status: "Statutory Reference",
          usedFor: c.requirement,
          detail: c.sourceCitation.clause,
          url: c.sourceCitation.url,
          sourceType: "Government Source",
        });
      }
    }
  }

  for (const d of userDocs) {
    if (!cards.some((x) => x.category === "documents" && x.title === d.name)) {
      cards.push({
        id: `upload-${d.id}`,
        title: d.name,
        type: d.type,
        category: "documents",
        status: `${d.pageCount} ${d.pageCount === 1 ? "page" : "pages"} indexed`,
        usedFor: "Available as retrieval evidence across evaluations",
        detail: d.storageUrl ? `Stored file: ${d.storageUrl}` : "Indexed in your workspace vector store",
        url: d.storageUrl,
        sourceType: "Startup Document",
      });
    }
  }

  const filteredItems = cards.filter((item) => {
    if (activeFilter === "documents") return item.category === "documents";
    if (activeFilter === "sources") return item.category === "sources";
    return true;
  });

  return (
    <div className="space-y-8 max-w-none w-full">
      <div>
        <Link
          href={`/deep-analysis/${analysis.id}/results`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Results</span>
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Evidence</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Documents and official sources cited in “{analysis.title}”.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        {[
          { id: "all", label: "All Evidence" },
          { id: "documents", label: "Startup Documents" },
          { id: "sources", label: "Government Sources" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === tab.id
                ? "bg-violet-600 text-white shadow-2xs"
                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-dashed border-neutral-300 text-center">
          <p className="text-sm font-semibold text-neutral-700">No evidence in this view</p>
          <p className="text-xs text-neutral-500 mt-1">
            Upload documents on the <Link href="/documents" className="text-violet-700 hover:underline">Documents page</Link> to generate citable evidence.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                    {item.sourceType}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{item.status}</span>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                      {item.title}
                    </h3>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      {item.type}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-600">
                  <span className="font-semibold text-neutral-800">Used for: </span>
                  <span>{item.usedFor}</span>
                  <span className="block mt-1.5 text-neutral-500">{item.detail}</span>
                </div>
              </div>

              {item.url && (
                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-end">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-violet-50 text-neutral-700 hover:text-violet-700 text-xs font-semibold transition-all"
                  >
                    <span>{item.category === "documents" ? "View Document" : "Open Source"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
