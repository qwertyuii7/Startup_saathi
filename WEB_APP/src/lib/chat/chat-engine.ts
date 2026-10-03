import { db } from "../db/store";
import { v4 as uuidv4 } from "uuid";
import { arovaChatAgent } from "../agents/arova-chat/graph";
import type { ChatPageContext } from "../agents/arova-chat/state";
import type { ArovaStructured } from "./structured";

export interface ChatRequestOptions {
  userId: string;
  startupId: string;
  conversationId?: string;
  query: string;
  selectedSchemeId?: string;
  pageContext?: ChatPageContext;
}

export interface ChatAction {
  type: string;
  label: string;
  route: string;
  entityId?: string;
}

export interface ChatResponsePayload {
  conversationId: string;
  messageId: string;
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
  actions: ChatAction[];
  relatedEntities: { kind: string; id?: string; label: string; route: string }[];
  searchedWeb?: boolean;
}

export class ChatEngine {
  /**
   * Context-aware RAG agent entry point. Runs the LangGraph pipeline:
   * workspace → retrieval plan → scoped retrieval → grounded generation.
   * Same request/response contract as before; pageContext is optional
   * and only enriches grounding (never trusted for ownership).
   */
  static async handleChatMessage(options: ChatRequestOptions): Promise<ChatResponsePayload> {
    const { userId, startupId, query } = options;
    const selectedSchemeId = options.selectedSchemeId || options.pageContext?.selectedSchemeId;
    const pageContext: ChatPageContext = options.pageContext || {};

    // 1. Get or Create Conversation (ownership verified by the caller)
    let convId = options.conversationId;
    if (!convId) {
      convId = `conv_${uuidv4().substring(0, 8)}`;
      await db.saveConversation({
        id: convId,
        userId,
        startupId,
        title: query.length > 40 ? `${query.substring(0, 37)}...` : query,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 2. Save User Message
    await db.saveMessage({
      id: `msg_${uuidv4().substring(0, 8)}`,
      conversationId: convId,
      userId,
      role: "user",
      content: query,
      createdAt: new Date().toISOString(),
    });

    // 3. Run the agent graph
    const finalState = (await arovaChatAgent.invoke({
      userId,
      startupId,
      query,
      conversationId: convId,
      selectedSchemeId,
      pageContext,
      profileSnapshot: "",
      docInventory: "",
      historyText: "",
      plan: null,
      docEvidence: [],
      govEvidence: [],
      webEvidence: [],
      schemeContext: "",
      analysisContext: "",
      searchedWeb: false,
      reply: "",
      structured: null,
      citations: [],
      errors: [],
    })) as unknown as {
      reply: string;
      structured: ArovaStructured | null;
      citations: ChatResponsePayload["citations"];
      searchedWeb?: boolean;
      errors: string[];
    };

    if (!finalState.reply) {
      const reason = finalState.errors.join("; ") || "the AI service did not respond";
      throw new Error(`Assistant failed: ${reason}. Please try again.`);
    }

    // 4. Cross-page actions so chat connects to the workspace.
    const analysisId = pageContext.analysisId;
    const actions: ChatAction[] = [
      { type: "open_eligibility", label: "Open Eligibility", route: `/deep-analysis/eligibility${analysisId ? `?id=${analysisId}` : ""}` },
      { type: "view_evidence", label: "View Evidence", route: `/deep-analysis/evidence${analysisId ? `?id=${analysisId}` : ""}` },
      { type: "open_action_plan", label: "Open Action Plan", route: `/deep-analysis/action-plan${analysisId ? `?id=${analysisId}` : ""}` },
    ];
    const schemeId = selectedSchemeId || pageContext.selectedSchemeId;
    if (schemeId) {
      actions.unshift({ type: "view_scheme", label: "View Scheme", route: `/deep-analysis/schemes${analysisId ? `?id=${analysisId}` : ""}`, entityId: schemeId });
    }
    if (pageContext.documentId) {
      actions.push({ type: "open_document", label: "Open Document", route: `/deep-analysis/documents${analysisId ? `?id=${analysisId}` : ""}`, entityId: pageContext.documentId });
    } else {
      actions.push({ type: "open_documents", label: "Upload Document", route: `/deep-analysis/documents${analysisId ? `?id=${analysisId}` : ""}` });
    }

    const structured: ArovaStructured | null = finalState.structured
      ? { ...finalState.structured, actions, citations: finalState.citations }
      : null;

    // 5. Save Assistant Message with provenance citations (+ structured UI payload)
    const assistantMsgId = `msg_${uuidv4().substring(0, 8)}`;
    await db.saveMessage({
      id: assistantMsgId,
      conversationId: convId,
      userId,
      role: "assistant",
      content: finalState.reply,
      citations: finalState.citations,
      structured: structured || undefined,
      createdAt: new Date().toISOString(),
    });

    const relatedEntities =
      finalState.structured?.relatedEntities.map((r) => ({
        kind: r.kind,
        id: r.id,
        label: r.label,
        route: r.route,
      })) || [];

    return {
      conversationId: convId,
      messageId: assistantMsgId,
      reply: finalState.reply,
      structured,
      citations: finalState.citations,
      actions,
      relatedEntities,
      searchedWeb: finalState.searchedWeb,
    };
  }
}
