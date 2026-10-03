"use client";

import React from "react";

/**
 * Minimal SAFE Markdown renderer for AROVA chat (§10).
 * No dependencies, no dangerouslySetInnerHTML — React escapes all text nodes.
 * Links allow only http(s) and site-relative URLs; everything else renders as text.
 */

export type MdBlock =
  | { kind: "heading"; level: number; text: string }
  | { kind: "para"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "numbered"; items: string[] }
  | { kind: "code"; text: string }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "quote"; text: string }
  | { kind: "hr" };

function isTableSep(line: string): boolean {
  return /^\|?[\s:|-]+\|?[\s:|-]*$/.test(line.trim()) && line.includes("-");
}

function splitRow(line: string): string[] {
  let t = line.trim();
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|")) t = t.slice(0, -1);
  return t.split("|").map((c) => c.trim());
}

export function parseMarkdown(src: string): MdBlock[] {
  const lines = (src || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code
    if (line.trim().startsWith("```")) {
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ kind: "code", text: buf.join("\n") });
      continue;
    }

    // Table: header + separator + rows
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      isTableSep(lines[i + 1])
    ) {
      const head = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim().length > 0) {
        rows.push(splitRow(lines[i]));
        i += 1;
        if (rows.length >= 12) break;
      }
      blocks.push({ kind: "table", head, rows });
      continue;
    }

    // Heading
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      blocks.push({ kind: "heading", level: Math.min(h[1].length, 3), text: h[2].trim() });
      i += 1;
      continue;
    }

    // HR
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      blocks.push({ kind: "hr" });
      i += 1;
      continue;
    }

    // Quote
    if (line.trim().startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ kind: "quote", text: buf.join(" ") });
      continue;
    }

    // Bullets
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, "").trim());
        i += 1;
        if (items.length >= 12) break;
      }
      blocks.push({ kind: "bullets", items });
      continue;
    }

    // Numbered
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, "").trim());
        i += 1;
        if (items.length >= 12) break;
      }
      blocks.push({ kind: "numbered", items });
      continue;
    }

    // Blank
    if (line.trim() === "") {
      i += 1;
      continue;
    }

    // Paragraph (merge consecutive text lines)
    const buf = [line.trim()];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,4}\s|```|>|\s*[-*+]\s+|\s*\d+[.)]\s+)/.test(lines[i]) &&
      !(lines[i].includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1]))
    ) {
      buf.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ kind: "para", text: buf.join(" ") });
  }

  return blocks;
}

function safeUrl(url: string): string | null {
  const u = url.trim();
  if (u.startsWith("/") && !u.startsWith("//")) return u;
  if (/^https?:\/\//i.test(u)) return u;
  return null;
}

/** Inline: `code`, **bold**, *italic*, [link](url). Returns React nodes (auto-escaped). */
export function renderInline(text: string, keyPrefix: string): React.ReactNode[] {  const out: React.ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) {
      out.push(
        <code key={`${keyPrefix}-${k++}`} className="px-1 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[0.85em] font-mono text-neutral-700">
          {tok.slice(1, -1)}
        </code>
      );
    } else if (tok.startsWith("**")) {
      out.push(<strong key={`${keyPrefix}-${k++}`} className="font-semibold text-neutral-900">{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("*")) {
      out.push(<em key={`${keyPrefix}-${k++}`}>{tok.slice(1, -1)}</em>);
    } else {
      const lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (lm) {
        const href = safeUrl(lm[2]);
        if (href) {
          const external = /^https?:\/\//i.test(href);
          out.push(
            <a key={`${keyPrefix}-${k++}`} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="text-violet-700 hover:text-violet-800 hover:underline font-medium break-all">
              {lm[1]}
            </a>
          );
        } else {
          out.push(`${lm[1]}`);
        }
      } else {
        out.push(tok);
      }
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
