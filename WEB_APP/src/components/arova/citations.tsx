"use client";

import React from "react";
import { ArrowUpRight, FileText, Globe, Landmark, Check, Loader2, Search } from "lucide-react";
import type { ArovaCitation } from "@/lib/chat/structured";
import { renderInline } from "./Markdown";

export function isOfficial(c: ArovaCitation): boolean {
  if (c.type === "official_source") return true;
  const t = (c.sourceType || "").toLowerCase();
  const d = (c.domain || "").toLowerCase();
  return (
    t === "official" || t === "official_scheme" || t === "gazette" ||
    /\.gov\.in$|\.gov\.in\/|\.nic\.in/.test(d)
  );
}

export function sourceLabel(c: ArovaCitation): string {
  if (c.type === "document") return "Your document";
  return isOfficial(c) ? "Official source" : "Web source";
}

function Favicon({ c }: { c: ArovaCitation }) {
  const [failed, setFailed] = React.useState(false);
  const src = c.favicon || (c.domain ? `https://www.google.com/s2/favicons?domain=${c.domain}&sz=64` : null);
  if (!src || failed) {
    return c.type === "document" ? (
      <FileText className="w-3.5 h-3.5 text-violet-500 shrink-0" />
    ) : isOfficial(c) ? (
      <Landmark className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
    ) : (
      <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={14} height={14} className="w-3.5 h-3.5 rounded-sm shrink-0" onError={() => setFailed(true)} loading="lazy" />;
}

/** Small reusable web/official source card (§20). Never renders a URL as raw text. */
export function WebSourceCard({ citation, index }: { citation: ArovaCitation; index?: number }) {
  const official = isOfficial(citation);
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 bg-white border border-neutral-200/80 rounded-xl min-w-0 hover:border-violet-200 hover:shadow-xs transition-all">
      <div className="mt-0.5 shrink-0"><Favicon c={citation} /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {typeof index === "number" && (
            <span className="text-[10px] font-black text-neutral-400 tabular-nums shrink-0">{index + 1}.</span>
          )}
          <span className="text-[12px] font-bold text-neutral-900 truncate leading-snug">{citation.title}</span>
        </div>
        <div className="text-[10px] text-neutral-500 truncate mt-0.5">
          {citation.domain || citation.ref}
          {citation.ref && citation.domain && citation.ref !== citation.domain ? ` · ${citation.ref}` : ""}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`inline-flex items-center px-1.5 py-px rounded text-[9px] font-bold uppercase tracking-wider border ${official ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
            {official ? "Official source" : "Web source"}
          </span>
          {citation.url && (
            <a href={citation.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[10px] font-bold text-violet-700 hover:text-violet-900 hover:underline">
              Open <ArrowUpRight className="w-3 h-3" />
            </a>
          )}
        </div>
        {citation.snippet && <p className="text-[10px] text-neutral-500 leading-snug mt-1 line-clamp-2">{citation.snippet}</p>}
      </div>
    </div>
  );
}

/** User-evidence card — always visually distinct from web sources (§7, §21). */
export function DocumentSourceCard({ citation }: { citation: ArovaCitation }) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 bg-violet-50/60 border border-violet-200/70 rounded-xl min-w-0">
      <FileText className="w-3.5 h-3.5 text-violet-600 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-bold text-neutral-900 truncate">{citation.title}</div>
        <div className="text-[10px] text-neutral-500 mt-0.5">
          Your document{citation.page ? ` · Page ${citation.page}` : citation.ref ? ` · ${citation.ref}` : ""}
          {citation.section ? ` · ${citation.section}` : ""}
        </div>
        <span className="inline-flex items-center px-1.5 py-px rounded text-[9px] font-bold uppercase tracking-wider border bg-violet-100 text-violet-700 border-violet-200 mt-1">
          Your document
        </span>
        {citation.snippet && <p className="text-[10px] text-neutral-600 leading-snug mt-1 italic border-l-2 border-violet-300 pl-2 line-clamp-2">“{citation.snippet}”</p>}
      </div>
    </div>
  );
}

/** End-of-answer sources section: documents first, then official, then web (§5, §7). */
export function SourcesSection({ citations, compact }: { citations: ArovaCitation[]; compact?: boolean }) {
  if (!citations || citations.length === 0) return null;
  const docs = citations.filter((c) => c.type === "document");
  const rest = citations.filter((c) => c.type !== "document");
  const official = rest.filter(isOfficial);
  const web = rest.filter((c) => !isOfficial(c));
  const shownRest = compact ? [...official, ...web].slice(0, 4) : [...official, ...web];
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Sources</div>
      <div className="flex flex-col gap-1.5 min-w-0">
        {docs.slice(0, compact ? 2 : 4).map((c, i) => <DocumentSourceCard key={`d-${i}`} citation={c} />)}
        {shownRest.map((c, i) => <WebSourceCard key={`w-${i}`} citation={c} index={i} />)}
      </div>
    </div>
  );
}

/**
 * Inline citation pill: [Source Name ↗]. Clickable, compact, never a raw URL (§4).
 * Numeric markers [1], [2] from the model resolve against the web citations list.
 */
export function InlineCitation({ citation }: { citation: ArovaCitation }) {
  const label = citation.sourceName || citation.domain || citation.title;
  if (citation.url) {
    return (
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        title={`${citation.title}${citation.domain ? ` — ${citation.domain}` : ""}`}
        className="inline-flex items-center gap-0.5 mx-0.5 px-1.5 py-px rounded-md bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-[10px] font-bold no-underline hover:underline align-baseline whitespace-nowrap transition-colors"
      >
        <span className="max-w-[140px] truncate">{label}</span>
        <ArrowUpRight className="w-3 h-3 shrink-0" />
      </a>
    );
  }
  return (
    <span
      title={citation.title}
      className="inline-flex items-center gap-0.5 mx-0.5 px-1.5 py-px rounded-md bg-neutral-100 border border-neutral-200 text-neutral-600 text-[10px] font-bold whitespace-nowrap"
    >
      <span className="max-w-[140px] truncate">{label}</span>
    </span>
  );
}

/** Resolve [1]/[2] markers and [Doc, Page N] markers against citations for inline rendering. */
export function splitInlineCitations(text: string): { kind: "text" | "num"; value: string }[] {  const parts: { kind: "text" | "num"; value: string }[] = [];
  const re = /\[(\d{1,2})\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ kind: "text", value: text.slice(last, m.index) });
    parts.push({ kind: "num", value: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ kind: "text", value: text.slice(last) });
  return parts;
}

/** Subtle clickable follow-up suggestions (§17). */
export function FollowUpChips({ items, onAsk }: { items: string[]; onAsk: (q: string) => void }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">You can ask</div>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 4).map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onAsk(q)}
            className="px-2.5 py-1.5 bg-white hover:bg-violet-50 text-neutral-700 hover:text-violet-700 text-[11px] font-medium rounded-lg border border-neutral-200 hover:border-violet-200 transition-colors text-left max-w-full truncate"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

export type ResearchStage = "understanding" | "retrieving" | "searching" | "sources_found" | "analyzing" | "streaming" | "done";

export interface ResearchState {
  stage: ResearchStage;
  label: string;
  sources?: { title: string; domain?: string }[];
}

/** Honest research indicator: only shows stages that actually happened (§9, §11). */
export function ResearchStatus({ state }: { state: ResearchState }) {
  const steps: { key: ResearchStage; label: string }[] = [
    { key: "searching", label: "Searching official government sources" },
    { key: "analyzing", label: "Analyzing relevant requirements" },
  ];
  const order: ResearchStage[] = ["understanding", "retrieving", "searching", "sources_found", "analyzing", "streaming"];
  const idx = order.indexOf(state.stage);
  return (
    <div className="flex flex-col gap-1.5 py-1" aria-live="polite">
      {steps.map((s) => {
        const sIdx = order.indexOf(s.key === "searching" ? "searching" : "analyzing");
        const done = idx > sIdx || state.stage === "sources_found" && s.key === "searching";
        const active = (state.stage === s.key) || (s.key === "searching" && state.stage === "sources_found");
        if (!done && !active) return null;
        return (
          <div key={s.key} className="flex items-center gap-2 text-[11px] text-neutral-500">
            {done ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin shrink-0" />
            )}
            <span className={done ? "text-neutral-600" : "text-neutral-700 font-medium"}>{s.label}{active && !done ? "…" : ""}</span>
          </div>
        );
      })}
      {state.stage === "sources_found" && state.sources && state.sources.length > 0 && (
        <div className="flex flex-col gap-1 mt-0.5">
          {state.sources.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-neutral-600">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate font-medium">{s.title}</span>
              {s.domain && <span className="text-neutral-400 truncate shrink-0">· {s.domain}</span>}
            </div>
          ))}
        </div>
      )}
      {state.stage === "understanding" || state.stage === "retrieving" ? (
        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
          <Search className="w-3.5 h-3.5 text-violet-500 animate-pulse shrink-0" />
          <span>{state.label}…</span>
        </div>
      ) : null}
    </div>
  );
}

/** Paragraph text with numeric [n] citations resolved to clickable pills. */
export function RichText({ text, citations, keyPrefix }: { text: string; citations?: ArovaCitation[]; keyPrefix: string }) {
  const webCites = (citations || []).filter((c) => c.type !== "document");
  const parts = splitInlineCitations(text);
  // No numeric markers → plain safe markdown inline rendering.
  if (parts.length <= 1) return <>{renderInline(text, keyPrefix)}</>;
  return (
    <>
      {parts.map((p, i) => {
        if (p.kind === "text") return <React.Fragment key={`${keyPrefix}-t${i}`}>{renderInline(p.value, `${keyPrefix}-t${i}`)}</React.Fragment>;
        const n = parseInt(p.value, 10);
        const cite = webCites[n - 1];
        if (!cite) return <span key={`${keyPrefix}-n${i}`}>[{p.value}]</span>;
        return <InlineCitation key={`${keyPrefix}-n${i}`} citation={cite} />;
      })}
    </>
  );
}
