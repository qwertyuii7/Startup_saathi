"use client";

export interface ChatPageContext {
  pathname?: string;
  pageName?: string;
  pageDescription?: string;
  selectedSchemeId?: string;
  selectedSchemeName?: string;
  analysisId?: string;
  documentId?: string;
  relevantEntityId?: string;
}

const PAGE_MAP: { match: RegExp; name: string; description: string }[] = [
  { match: /^\/dashboard$/, name: "Dashboard Overview", description: "Workspace summary: profile, matches, documents, action items." },
  { match: /^\/dashboard\/schemes$/, name: "Scheme Discovery", description: "Browsing the official scheme catalog with personal fit scores." },
  { match: /^\/dashboard\/schemes\/.+/, name: "Scheme Detail", description: "Reading a single scheme dossier with eligibility breakdown." },
  { match: /^\/dashboard\/plan$/, name: "Action Plan", description: "Working through prioritized eligibility next steps." },
  { match: /^\/dashboard\/incubators/, name: "Incubators", description: "Exploring matched incubators and accelerators." },
  { match: /^\/dashboard\/alerts/, name: "Alerts", description: "Reviewing missing-evidence and verification alerts." },
  { match: /^\/dashboard\/profile/, name: "Startup Profile", description: "Viewing or editing the startup profile dossier." },
  { match: /^\/dashboard\/settings/, name: "Settings", description: "Managing workspace preferences and session." },
  { match: /^\/documents/, name: "Documents", description: "Managing uploaded evidence documents for RAG." },
  { match: /^\/deep-analysis$/, name: "Deep Analysis Home", description: "Overview of past eligibility analyses." },
  { match: /^\/deep-analysis\/new/, name: "New Analysis", description: "Configuring a new deep eligibility analysis." },
  { match: /^\/deep-analysis\/history/, name: "Analysis History", description: "Reviewing past analysis runs." },
  { match: /^\/deep-analysis\/.+\/results/, name: "Analysis Results", description: "Reading scheme-by-scheme eligibility results." },
  { match: /^\/deep-analysis\/.+\/evidence/, name: "Analysis Evidence", description: "Inspecting cited document evidence." },
  { match: /^\/deep-analysis\/.+\/action-plan/, name: "Analysis Action Plan", description: "Working through analysis-derived next steps." },
  { match: /^\/deep-analysis\/.+\/incubators/, name: "Analysis Incubators", description: "Reviewing incubators matched in this analysis." },
  { match: /^\/deep-analysis\/.+\/scheme\/.+/, name: "Scheme Eligibility", description: "Reading per-requirement eligibility for one scheme." },
  { match: /^\/onboarding/, name: "Onboarding", description: "Setting up the startup profile." },
];

/** Build page-awareness context for the assistant from the current route. */
export function buildPageContext(
  pathname: string | null,
  extra?: Partial<ChatPageContext>
): ChatPageContext {
  const path = pathname || "";
  const found = PAGE_MAP.find((p) => p.match.test(path));
  // Extract analysis/scheme ids from deep-analysis routes when present.
  const analysisMatch = path.match(/^\/deep-analysis\/([^/]+)/);
  const schemeMatch = path.match(/\/scheme\/([^/]+)/);
  return {
    pathname: path || undefined,
    pageName: found?.name,
    pageDescription: found?.description,
    analysisId:
      extra?.analysisId ||
      (analysisMatch && !["new", "history"].includes(analysisMatch[1]) ? analysisMatch[1] : undefined),
    selectedSchemeId: extra?.selectedSchemeId || schemeMatch?.[1],
    ...extra,
  };
}
