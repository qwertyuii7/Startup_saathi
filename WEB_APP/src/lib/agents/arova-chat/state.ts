import type { DocumentChunk } from "../../db/models";
import type { TavilySearchResult } from "../../services/tavily";
import type { ArovaStructured } from "../../chat/structured";

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

export interface RetrievalPlan {
  /** What the user is asking about (legacy coarse set, kept for compat). */
  intents: ("documents" | "profile" | "schemes" | "eligibility" | "analysis" | "general")[];
  /** Explicit fine-grained intents (§15). */
  fineIntents?: string[];
  needsDocs: boolean;
  needsGov: boolean;
  needsSchemes: boolean;
  needsAnalysis: boolean;
  needsWebSearch: boolean;
  /** Filename/document hint extracted from the query, if any. */
  docTarget?: string;
  /** Scheme name hint extracted from the query, if any. */
  schemeHint?: string;
  /** Rewritten retrieval queries. */
  docQuery: string;
  govQuery: string;
  webSearchQuery?: string;
}

export interface ScoredChunk {
  chunk: DocumentChunk;
  score: number;
}

export interface ArovaChatState {
  userId: string;
  startupId: string;
  query: string;
  conversationId?: string;
  selectedSchemeId?: string;
  pageContext: ChatPageContext;
  // Workspace snapshot
  profileSnapshot: string;
  docInventory: string;
  historyText: string;
  // Retrieval
  plan: RetrievalPlan | null;
  docEvidence: ScoredChunk[];
  govEvidence: ScoredChunk[];
  webEvidence: TavilySearchResult[];
  schemeContext: string;
  analysisContext: string;
  searchedWeb?: boolean;
  // Output
  reply: string;
  structured: ArovaStructured | null;
  citations: {
    type: "document" | "official_source" | "web";
    title: string;
    ref: string;
    url?: string;
    domain?: string;
    snippet?: string;
    sourceName?: string;
    sourceType?: string;
    favicon?: string;
    documentId?: string;
    page?: number;
    section?: string;
    relevance?: number;
  }[];
  errors: string[];
}
