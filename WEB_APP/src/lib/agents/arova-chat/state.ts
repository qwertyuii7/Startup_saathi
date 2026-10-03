import type { DocumentChunk } from "../../db/models";
import type { TavilySearchResult } from "../../services/tavily";

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
  /** What the user is asking about. */
  intents: ("documents" | "profile" | "schemes" | "eligibility" | "analysis" | "general")[];
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
  citations: {
    type: "document" | "official_source" | "web";
    title: string;
    ref: string;
    url?: string;
    domain?: string;
    snippet?: string;
  }[];
  errors: string[];
}
