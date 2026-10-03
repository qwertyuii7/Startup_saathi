import type { DocumentChunk } from "../../db/models";

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
  /** Filename/document hint extracted from the query, if any. */
  docTarget?: string;
  /** Scheme name hint extracted from the query, if any. */
  schemeHint?: string;
  /** Rewritten retrieval queries. */
  docQuery: string;
  govQuery: string;
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
  schemeContext: string;
  analysisContext: string;
  // Output
  reply: string;
  citations: {
    type: "document" | "official_source";
    title: string;
    ref: string;
    url?: string;
  }[];
  errors: string[];
}
