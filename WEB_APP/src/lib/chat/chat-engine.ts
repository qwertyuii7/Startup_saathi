import { db } from "../db/store";
import { v4 as uuidv4 } from "uuid";
import { arovaChatAgent } from "../agents/arova-chat/graph";
import type { ChatPageContext } from "../agents/arova-chat/state";

export interface ChatRequestOptions {
  userId: string;
  startupId: string;
  conversationId?: string;
  query: string;
  selectedSchemeId?: string;
  pageContext?: ChatPageContext;
}

export interface ChatResponsePayload {
  conversationId: string;
  messageId: string;
  reply: string;
  citations: {
    type: "document" | "official_source" | "web";
    title: string;
    ref: string;
    url?: string;
    domain?: string;
    snippet?: string;
  }[];
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
      citations: [],
      errors: [],
    })) as unknown as {
      reply: string;
      citations: ChatResponsePayload["citations"];
      searchedWeb?: boolean;
      errors: string[];
    };

    if (!finalState.reply) {
      const reason = finalState.errors.join("; ") || "the AI service did not respond";
      throw new Error(`Assistant failed: ${reason}. Please try again.`);
    }

    // 4. Save Assistant Message with provenance citations
    const assistantMsgId = `msg_${uuidv4().substring(0, 8)}`;
    await db.saveMessage({
      id: assistantMsgId,
      conversationId: convId,
      userId,
      role: "assistant",
      content: finalState.reply,
      citations: finalState.citations,
      createdAt: new Date().toISOString(),
    });

    return {
      conversationId: convId,
      messageId: assistantMsgId,
      reply: finalState.reply,
      citations: finalState.citations,
      searchedWeb: finalState.searchedWeb,
    };
  }
}
