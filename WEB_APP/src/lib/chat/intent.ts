/**
 * Explicit query-intent classification for AROVA chat (§15).
 *
 * Deterministic regex first (no latency, no cost), Groq JSON as an
 * optional refinement done by the graph planner. The UI + retrieval
 * decisions must be able to run on this alone.
 */

export type ArovaIntent =
  | "GENERAL_QUESTION"
  | "SCHEME_DISCOVERY"
  | "SCHEME_DETAILS"
  | "ELIGIBILITY"
  | "DOCUMENT_ANALYSIS"
  | "MISSING_REQUIREMENTS"
  | "ACTION_PLAN"
  | "INCUBATOR_SEARCH"
  | "CURRENT_INFORMATION"
  | "WEB_RESEARCH"
  | "ANALYSIS_EXPLANATION";

const RULES: { intent: ArovaIntent; re: RegExp }[] = [
  { intent: "INCUBATOR_SEARCH", re: /incubat|accelerator|\bhub\b|mentor|co-?work/i },
  { intent: "MISSING_REQUIREMENTS", re: /missing|gap|what.*(need|require|lack)|incomplete|pending document|blocker|blocking/i },
  { intent: "DOCUMENT_ANALYSIS", re: /document|upload|certificate|incorporat|dpiit.*(pdf|file|upload)|my (file|pdf|doc)/i },
  { intent: "ACTION_PLAN", re: /next step|action plan|checklist|todo|to-?do|roadmap|what should i do|apply/i },
  { intent: "ELIGIBILITY", re: /eligib|qualif|criteria|requirement|am i eligible|do i qualify|why.*(not|reject|ineligib)/i },
  { intent: "SCHEME_DETAILS", re: /tell me about|details of|explain .*scheme|guideline|clause \d|benefit.*scheme/i },
  { intent: "SCHEME_DISCOVERY", re: /scheme|fund|grant|subsidy|loan|seed fund|sisfs|psf|policy|yojana/i },
  { intent: "ANALYSIS_EXPLANATION", re: /why.*(result|score|finding)|explain.*(analysis|result|finding)|analysis/i },
  {
    intent: "CURRENT_INFORMATION",
    re: /latest|current|recent|new|update[sd]?|change[sd]?|202[4-9]|this (year|month|week)|as of today|right now/i,
  },
  {
    intent: "WEB_RESEARCH",
    re: /search( the web)?|on the internet|official source|government (site|website|portal|notification)|gazette|dpiit.*(rule|notification|requirement)/i,
  },
];

export function classifyIntent(query: string, pageName?: string): ArovaIntent[] {
  const intents: ArovaIntent[] = [];
  for (const r of RULES) {
    if (r.re.test(query)) intents.push(r.intent);
  }

  // Page context hints (user should not have to repeat context — §16).
  const page = (pageName || "").toLowerCase();
  if (/eligib/.test(page) && !intents.includes("ELIGIBILITY")) intents.push("ELIGIBILITY");
  if (/evidence|requirement/.test(page) && !intents.includes("DOCUMENT_ANALYSIS"))
    intents.push("DOCUMENT_ANALYSIS");
  if (/action-plan|action plan/.test(page) && !intents.includes("ACTION_PLAN")) intents.push("ACTION_PLAN");
  if (/incubator/.test(page) && !intents.includes("INCUBATOR_SEARCH")) intents.push("INCUBATOR_SEARCH");

  // Follow-up shorthand that only makes sense against a scheme/analysis page.
  if (/^(why|why not|explain|show me|what about)/i.test(query.trim()) && page.includes("scheme")) {
    if (!intents.includes("ELIGIBILITY")) intents.push("ELIGIBILITY");
  }

  if (intents.length === 0) intents.push("GENERAL_QUESTION");
  return [...new Set(intents)];
}

/** Web search is needed for freshness, official verification, or open research. */
export function needsWebSearch(intents: ArovaIntent[]): boolean {
  return intents.some((i) =>
    ["CURRENT_INFORMATION", "WEB_RESEARCH", "SCHEME_DISCOVERY", "SCHEME_DETAILS", "INCUBATOR_SEARCH"].includes(i)
  );
}

export interface StartupSearchContext {
  industry?: string;
  state?: string;
  city?: string;
  stage?: string;
  entityType?: string;
  dpiitStatus?: string | boolean;
  sector?: string;
}

/**
 * Build a Tavily query from question + startup context + page context (§14).
 * Never includes PII (names, emails, phones).
 */
export function buildWebSearchQuery(
  query: string,
  startup?: StartupSearchContext,
  page?: { selectedSchemeName?: string; pageName?: string }
): string {
  const parts: string[] = [];
  // Core question, trimmed of chat filler.
  const core = query
    .replace(/^(please\s+)?(can you|could you|arova,?)\s+/i, "")
    .replace(/\s+for (my|our) startup\??$/i, "")
    .trim();
  parts.push(core);

  if (page?.selectedSchemeName) parts.push(`"${page.selectedSchemeName}"`);

  const ctx: string[] = [];
  if (startup?.industry || startup?.sector) ctx.push(startup.industry || startup.sector || "");
  if (startup?.state) ctx.push(startup.state);
  if (startup?.stage) ctx.push(`${startup.stage} startup`);
  if (startup?.entityType) ctx.push(startup.entityType);
  const ctxStr = ctx.filter(Boolean).join(" ");
  if (ctxStr && !core.toLowerCase().includes(ctxStr.toLowerCase().split(" ")[0] || "§")) {
    parts.push(ctxStr);
  }

  // Freshness anchor for "latest/current" questions.
  if (/latest|current|recent|new|202[4-9]/i.test(query)) {
    parts.push("official government site:india 2026");
  } else if (/scheme|fund|grant|incubat|dpiit|startup india/i.test(query)) {
    parts.push("site:startupindia.gov.in OR site:dpiit.gov.in OR site:gov.in");
  }

  return parts.filter(Boolean).join(" ").slice(0, 400);
}

/** 2–4 contextual follow-ups that send real chat messages (§17). */
export function deriveFollowUps(intents: ArovaIntent[], opts?: { hasAnalysis?: boolean; hasScheme?: boolean }): string[] {
  const followUps: string[] = [];
  const push = (q: string) => {
    if (!followUps.includes(q) && followUps.length < 4) followUps.push(q);
  };

  if (intents.includes("ELIGIBILITY")) {
    push("Which requirement is currently blocking me?");
    push("Show me the evidence for this decision.");
  }
  if (intents.includes("SCHEME_DISCOVERY") || intents.includes("CURRENT_INFORMATION")) {
    push("Check my eligibility for the top match.");
    push("Show me the official source for this requirement.");
  }
  if (intents.includes("MISSING_REQUIREMENTS")) {
    push("Create my application checklist.");
  }
  if (intents.includes("ACTION_PLAN")) {
    push("What documents am I missing?");
  }
  if (intents.includes("INCUBATOR_SEARCH")) {
    push("Find another incubator with fewer requirements.");
  }
  if (intents.includes("DOCUMENT_ANALYSIS")) {
    push("Explain my eligibility using my uploaded documents.");
  }
  if (opts?.hasScheme) push("What changed recently in this scheme?");
  if (opts?.hasAnalysis) push("Create my next steps.");

  // Generic fallbacks so every research answer ends with something useful.
  if (followUps.length < 2) push("What government schemes are relevant to my startup?");
  if (followUps.length < 2) push("What documents am I missing?");

  return followUps.slice(0, 4);
}
