"use client";

import React, { useMemo } from "react";
import type {
  ArovaStructured,
  ArovaCitation,
  ArovaAction,
  ArovaRelatedEntity,
} from "@/lib/chat/structured";
import { parseMarkdown } from "./Markdown";
import {
  MatchesBlock,
  StepsBlock,
  EligibilityBlock,
  EvidenceBlock,
  ArovaTable,
  CalloutBlock,
  SourcesBlock,
  ActionsBlock,
  RelatedBlock,
  MarkdownBlocks,
} from "./blocks";
import { FollowUpChips, RichText } from "./citations";

export interface ArovaMessageProps {
  /** Validated structured payload (new responses + persisted history). */
  structured?: ArovaStructured | null;
  /** Raw markdown text (streaming + legacy history). */
  markdown: string;
  citations?: ArovaCitation[];
  actions?: ArovaAction[];
  related?: ArovaRelatedEntity[];
  followUps?: string[];
  onFollowUp?: (q: string) => void;
  /** Compact mode for the narrow right sidebar. */
  compact?: boolean;
  /** True while tokens are still streaming in. */
  streaming?: boolean;
}

/**
 * Single renderer for every AROVA surface (sidebar, Copilot, drawer, AI page).
 * ChatGPT-like: borderless natural text, inline citations, small source cards,
 * actions, follow-ups. Structured sections win; otherwise safe Markdown fallback.
 */
export function ArovaMessage({ structured, markdown, citations, actions, related, followUps, onFollowUp, compact, streaming }: ArovaMessageProps) {
  const fallbackBlocks = useMemo(
    () => (structured && structured.sections.length > 0 ? [] : parseMarkdown(markdown)),
    [structured, markdown]
  );

  const effCitations = structured?.citations?.length ? structured.citations : citations || [];
  const effActions = structured?.actions?.length ? structured.actions : actions || [];
  const effRelated = structured?.relatedEntities?.length ? structured.relatedEntities : related || [];
  const effFollowUps = structured?.followUps?.length ? structured.followUps : followUps || [];
  const intro = structured?.message || "";

  return (
    <div className="flex flex-col gap-3 min-w-0 w-full max-w-[44rem]">
      {intro ? (
        <p className="text-[13.5px] text-neutral-800 leading-[1.7]"><RichText text={intro} citations={effCitations} keyPrefix="intro" /></p>
      ) : null}

      {structured && structured.sections.length > 0 ? (
        <>
          {structured.sections.map((s, i) => {
            switch (s.type) {
              case "matches":
                return <MatchesBlock key={i} section={s} />;
              case "steps":
                return <StepsBlock key={i} section={s} />;
              case "eligibility":
                return <EligibilityBlock key={i} section={s} />;
              case "evidence":
                return <EvidenceBlock key={i} section={s} />;
              case "comparison":
                return (
                  <div key={i} className="flex flex-col gap-1.5 min-w-0">
                    {s.title && (
                      <div className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider">{s.title}</div>
                    )}
                    <ArovaTable columns={s.table.columns} rows={s.table.rows} caption={s.table.caption} />
                  </div>
                );
              case "callout":
                return <CalloutBlock key={i} section={s} />;
              case "bullets":
                return (
                  <div key={i} className="flex flex-col gap-1.5 min-w-0">
                    {s.title && (
                      <div className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider">{s.title}</div>
                    )}
                    <ul className="flex flex-col gap-1.5">
                      {s.items.map((it, j) => (
                        <li key={j} className="flex gap-2 text-[13.5px] text-neutral-800 leading-[1.7]">
                          <span className="w-1 h-1 rounded-full bg-violet-500 shrink-0 mt-[9px]" />
                          <span className="min-w-0"><RichText text={it} citations={effCitations} keyPrefix={`sb-${i}-${j}`} /></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              case "text":
                return <p key={i} className="text-[13.5px] text-neutral-800 leading-[1.7]"><RichText text={s.body} citations={effCitations} keyPrefix={`st-${i}`} /></p>;
            }
          })}
        </>
      ) : (
        <div className="flex flex-col gap-2.5 min-w-0">
          <MarkdownBlocks blocks={fallbackBlocks} citations={effCitations} />
          {streaming && <span className="inline-block w-1.5 h-4 bg-violet-400 animate-pulse rounded-sm" aria-hidden />}
        </div>
      )}

      {(!structured || structured.sections.length === 0) && streaming && !markdown ? null : null}

      <SourcesBlock citations={effCitations} compact={compact} />
      <ActionsBlock actions={effActions} />
      <RelatedBlock related={effRelated} />
      {onFollowUp && effFollowUps.length > 0 && !streaming && (
        <FollowUpChips items={effFollowUps} onAsk={onFollowUp} />
      )}
    </div>
  );
}
