"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  FileSearch,
  FileText,
  Globe,
  Landmark,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  CircleDashed,
  XCircle,
  Upload,
  User,
  FolderOpen,
} from "lucide-react";
import type {
  ArovaSection,
  ArovaCitation,
  ArovaAction,
  ArovaRelatedEntity,
} from "@/lib/chat/structured";
import { parseMarkdown, renderInline, type MdBlock } from "./Markdown";
import { SourcesSection, RichText } from "./citations";

/* ------------------------------------------------------------------ */
/* Evidence / status presentation (existing state model, no invented   */
/* confidence scores).                                                 */
/* ------------------------------------------------------------------ */

function normalizeStatus(s: string): string {
  return (s || "").toLowerCase();
}

export function EvidenceBadge({ status, label }: { status: string; label?: string }) {
  const s = normalizeStatus(status);
  let cls = "bg-neutral-100 text-neutral-600 border-neutral-200";
  let Icon = CircleDashed;
  if (["verified", "satisfied", "supported", "direct_evidence", "eligible"].includes(s)) {
    cls = "bg-emerald-50 text-emerald-700 border-emerald-200";
    Icon = CheckCircle2;
  } else if (["partially_supported", "partially-supported", "needs_verification", "requires_verification", "inferred_evidence", "potential", "requires verification"].includes(s)) {
    cls = "bg-amber-50 text-amber-700 border-amber-200";
    Icon = AlertTriangle;
  } else if (["not_satisfied", "not_eligible", "no_supporting_evidence", "failed"].includes(s)) {
    cls = "bg-red-50 text-red-700 border-red-200";
    Icon = XCircle;
  } else if (["missing_evidence", "missing_requirement", "missing evidence"].includes(s)) {
    cls = "bg-orange-50 text-orange-700 border-orange-200";
    Icon = AlertTriangle;
  } else if (s.includes("verif")) {
    cls = "bg-blue-50 text-blue-700 border-blue-200";
    Icon = Info;
  }
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${cls}`}>
      <Icon className="w-3 h-3 shrink-0" />
      {label || status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section shell                                                       */
/* ------------------------------------------------------------------ */

export function SectionTitle({ title }: { title?: string }) {
  if (!title) return null;
  return (
    <div className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider">
      {title}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Match cards (schemes + incubators), 2-col desktop / 1-col mobile     */
/* ------------------------------------------------------------------ */

function MatchCard({ item }: { item: Extract<ArovaSection, { type: "matches" }>["items"][number] }) {
  const Icon = item.kind === "scheme" ? FileSearch : Building2;
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-xs flex flex-col gap-2 min-w-0">
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-violet-600" />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-neutral-900 leading-snug">{item.name}</div>
          {[item.location, item.focus].filter(Boolean).length > 0 && (
            <div className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
              {[item.location, item.focus].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      </div>
      {item.eligibility && (
        <div className="text-[11px] text-neutral-600 leading-snug">{item.eligibility}</div>
      )}
      {item.whyItFits && (
        <div className="text-[11px] text-neutral-600 leading-snug">
          <span className="font-bold text-neutral-700">Why it fits: </span>
          {item.whyItFits}
        </div>
      )}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 hover:text-violet-800 hover:underline mt-auto pt-1"
        >
          View official source <ArrowUpRight className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

export function MatchesBlock({ section }: { section: Extract<ArovaSection, { type: "matches" }> }) {
  return (
    <div className="flex flex-col gap-2">
      <SectionTitle title={section.title} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {section.items.map((item, i) => (
          <MatchCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Numbered steps timeline                                             */
/* ------------------------------------------------------------------ */

export function StepsBlock({ section }: { section: Extract<ArovaSection, { type: "steps" }> }) {
  return (
    <div className="flex flex-col gap-2">
      <SectionTitle title={section.title || "Next steps"} />
      <ol className="flex flex-col gap-2">
        {section.items.map((step, i) => (
          <li key={i} className="flex gap-3 bg-white border border-neutral-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-black text-violet-600 tabular-nums shrink-0 pt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-neutral-900 leading-snug">{step.title}</div>
              {step.description && (
                <div className="text-[11px] text-neutral-500 leading-snug mt-0.5">{step.description}</div>
              )}
              {step.actionLabel && step.actionRoute && (
                <Link
                  href={step.actionRoute}
                  className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-[11px] font-bold transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  {step.actionLabel}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Eligibility rows                                                    */
/* ------------------------------------------------------------------ */

export function EligibilityBlock({ section }: { section: Extract<ArovaSection, { type: "eligibility" }> }) {
  let lastScheme = "";
  return (
    <div className="flex flex-col gap-2">
      <SectionTitle title={section.title || "Eligibility"} />
      <div className="flex flex-col gap-1.5">
        {section.rows.map((row, i) => {
          const showScheme = row.schemeName && row.schemeName !== lastScheme;
          lastScheme = row.schemeName || lastScheme;
          return (
            <div key={i} className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 shadow-xs">
              {showScheme && (
                <div className="text-[11px] font-bold text-violet-700 mb-1">{row.schemeName}</div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="text-[12px] font-medium text-neutral-800 leading-snug min-w-0">{row.requirement}</div>
                <EvidenceBadge status={row.status} label={row.statusLabel} />
              </div>
              {(row.evidence || row.source || row.explanation) && (
                <div className="mt-1.5 space-y-1">
                  {row.evidence && (
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                      <FileText className="w-3 h-3 shrink-0 text-violet-500" />
                      <span className="truncate">{row.evidence}</span>
                    </div>
                  )}
                  {row.source && (
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                      <Landmark className="w-3 h-3 shrink-0 text-amber-500" />
                      <span className="truncate">{row.source}</span>
                    </div>
                  )}
                  {row.explanation && (
                    <div className="text-[11px] text-neutral-500 leading-snug">{row.explanation}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Evidence list                                                       */
/* ------------------------------------------------------------------ */

export function EvidenceBlock({ section }: { section: Extract<ArovaSection, { type: "evidence" }> }) {
  return (
    <div className="flex flex-col gap-2">
      <SectionTitle title={section.title || "Evidence"} />
      <div className="flex flex-col gap-1.5">
        {section.items.map((e, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText className="w-3.5 h-3.5 shrink-0 text-violet-500" />
                <span className="text-[12px] font-bold text-neutral-800 truncate">{e.documentName}</span>
                {(e.page !== undefined || e.section) && (
                  <span className="text-[10px] text-neutral-400 shrink-0">
                    ({[e.page !== undefined ? `Page ${e.page}` : null, e.section].filter(Boolean).join(" · ")})
                  </span>
                )}
              </div>
              <EvidenceBadge status={e.status} />
            </div>
            {e.requirement && (
              <div className="text-[11px] text-neutral-500 mt-1">Proves: {e.requirement}</div>
            )}
            {e.excerpt && (
              <div className="text-[11px] text-neutral-600 leading-snug mt-1 border-l-2 border-violet-200 pl-2 italic">
                “{e.excerpt}”
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Responsive table (local scroll, never page overflow)                 */
/* ------------------------------------------------------------------ */

export function ArovaTable({ columns, rows, caption }: { columns: string[]; rows: string[][]; caption?: string }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      {caption && <div className="text-[11px] font-bold text-neutral-700">{caption}</div>}
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-xs">
        <table className="w-full text-[11px] leading-snug border-collapse min-w-[480px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              {columns.map((c, i) => (
                <th key={i} className="text-left font-bold text-neutral-700 px-2.5 py-2 whitespace-normal">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 1 ? "bg-neutral-50/50" : undefined}>
                {row.map((cell, ci) => (
                  <td key={ci} className={`px-2.5 py-2 align-top border-t border-neutral-100 ${ci === 0 ? "font-semibold text-neutral-800" : "text-neutral-600"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Markdown fallback blocks → AROVA styling                             */
/* ------------------------------------------------------------------ */

export function MarkdownBlocks({ blocks, citations }: { blocks: MdBlock[]; citations?: ArovaCitation[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "heading":
            return b.level === 1 ? (
              <h4 key={i} className="text-[15px] font-bold text-neutral-900 mt-1 leading-snug">{renderInline(b.text, `h-${i}`)}</h4>
            ) : (
              <h5 key={i} className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider mt-2">{renderInline(b.text, `h-${i}`)}</h5>
            );
          case "para":
            return <p key={i} className="text-[13.5px] text-neutral-800 leading-[1.7]"><RichText text={b.text} citations={citations} keyPrefix={`p-${i}`} /></p>;
          case "bullets":
            return (
              <ul key={i} className="flex flex-col gap-1">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2 text-[13px] text-neutral-700 leading-relaxed">
                    <span className="w-1 h-1 rounded-full bg-violet-500 shrink-0 mt-[7px]" />
                    <span className="min-w-0">{renderInline(it, `b-${i}-${j}`)}</span>
                  </li>
                ))}
              </ul>
            );
          case "numbered":
            return (
              <ol key={i} className="flex flex-col gap-1">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2 text-[13px] text-neutral-700 leading-relaxed">
                    <span className="text-[11px] font-black text-violet-600 tabular-nums shrink-0 mt-[2px]">{j + 1}.</span>
                    <span className="min-w-0">{renderInline(it, `n-${i}-${j}`)}</span>
                  </li>
                ))}
              </ol>
            );
          case "code":
            return (
              <pre key={i} className="overflow-x-auto rounded-lg bg-neutral-900 text-neutral-100 text-[11px] font-mono p-2.5 leading-relaxed">
                {b.text}
              </pre>
            );
          case "table":
            return <ArovaTable key={i} columns={b.head} rows={b.rows} />;
          case "quote":
            return <blockquote key={i} className="border-l-2 border-violet-300 pl-2.5 text-[12px] text-neutral-600 italic leading-relaxed">{renderInline(b.text, `q-${i}`)}</blockquote>;
          case "hr":
            return <hr key={i} className="border-neutral-200 my-1" />;
        }
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Callout                                                             */
/* ------------------------------------------------------------------ */

export function CalloutBlock({ section }: { section: Extract<ArovaSection, { type: "callout" }> }) {
  const tone = section.tone === "warning"
    ? "bg-amber-50 border-amber-200 text-amber-800"
    : section.tone === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : "bg-blue-50 border-blue-200 text-blue-800";
  const Icon = section.tone === "warning" ? AlertTriangle : section.tone === "success" ? CheckCircle2 : Info;
  return (
    <div className={`flex gap-2 rounded-xl border px-3 py-2.5 ${tone}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="min-w-0">
        {section.title && <div className="text-[11px] font-bold uppercase tracking-wider mb-0.5">{section.title}</div>}
        <div className="text-[12px] leading-relaxed">{section.body}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sources / citations (cards live in ./citations)                       */
/* ------------------------------------------------------------------ */

export function SourcesBlock({ citations, compact }: { citations: ArovaCitation[]; compact?: boolean }) {
  return <SourcesSection citations={citations} compact={compact} />;
}

/* ------------------------------------------------------------------ */
/* Actions + related entities                                          */
/* ------------------------------------------------------------------ */

export function ActionsBlock({ actions }: { actions: ArovaAction[] }) {
  if (!actions || actions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {actions.slice(0, 5).map((a, i) => (
        <Link
          key={i}
          href={a.route}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-700 text-white text-[11px] font-bold transition-colors"
        >
          {a.label}
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      ))}
    </div>
  );
}

export function RelatedBlock({ related }: { related: ArovaRelatedEntity[] }) {
  if (!related || related.length === 0) return null;
  const IconFor = (kind: string) => {
    if (kind === "scheme") return FileSearch;
    if (kind === "incubator") return Building2;
    if (kind === "document") return FileText;
    if (kind === "requirement") return CheckCircle2;
    return FolderOpen;
  };
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Related</div>
      <div className="flex flex-wrap gap-1.5">
        {related.slice(0, 6).map((r, i) => {
          const Icon = IconFor(r.kind);
          return (
            <Link
              key={i}
              href={r.route}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-[11px] font-bold transition-colors max-w-full"
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span className="truncate">{r.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function UserIcon() {
  return <User className="w-3.5 h-3.5" />;
}
