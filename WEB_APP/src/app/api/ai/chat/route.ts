import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { ChatEngine } from "@/lib/chat/chat-engine";
import { db } from "@/lib/db/store";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } },
        { status: 401 }
      );
    }
    const userId = user.id;
    const startup = await db.getStartupByUserId(userId);
    if (!startup) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "ONBOARDING_REQUIRED", message: "Please complete onboarding before using the assistant." },
        },
        { status: 400 }
      );
    }
    const startupId = startup.id;

    const body = await req.json();
    const query = body.query || body.message || "";
    const conversationId = body.conversationId;
    const selectedSchemeId = body.selectedSchemeId;

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: { code: "EMPTY_QUERY", message: "Query text cannot be empty." } },
        { status: 400 }
      );
    }

    // Page context enriches grounding only. Every entity id referenced
    // from the client is ownership-verified here — foreign ids are
    // dropped, never trusted.
    const rawCtx = (body.pageContext || {}) as Record<string, unknown>;
    const str = (v: unknown): string | undefined =>
      typeof v === "string" && v.length <= 500 ? v : undefined;
    const pageContext: Record<string, string | undefined> = {
      pathname: str(rawCtx.pathname),
      pageName: str(rawCtx.pageName),
      pageDescription: str(rawCtx.pageDescription),
      selectedSchemeId: str(rawCtx.selectedSchemeId) || (typeof selectedSchemeId === "string" ? selectedSchemeId : undefined),
      selectedSchemeName: str(rawCtx.selectedSchemeName),
      relevantEntityId: str(rawCtx.relevantEntityId),
    };
    const rawAnalysisId = str(rawCtx.analysisId);
    if (rawAnalysisId) {
      const a = await db.getAnalysisById(rawAnalysisId);
      if (a && a.userId === userId) pageContext.analysisId = rawAnalysisId;
    }
    const rawDocId = str(rawCtx.documentId);
    if (rawDocId) {
      const d = await db.getDocumentById(rawDocId);
      if (d && d.userId === userId) pageContext.documentId = rawDocId;
    }

    // If continuing a conversation, verify it belongs to this user.
    if (conversationId) {
      const existing = await db.getConversation(conversationId);
      if (!existing) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } },
          { status: 404 }
        );
      }
      if (existing.userId !== userId) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "You do not have access to this conversation" } },
          { status: 403 }
        );
      }
    }

    const response = await ChatEngine.handleChatMessage({
      userId,
      startupId,
      conversationId,
      query,
      selectedSchemeId,
      pageContext,
    });

    return NextResponse.json({
      success: true,
      message: {
        role: "assistant",
        content: response.reply,
        sources: response.citations,
      },
      actions: response.actions,
      citations: response.citations,
      relatedEntities: [],
      evidence: [],
      status: "ok",
      metadata: {
        webSearchUsed: !!response.searchedWeb,
        searchProvider: response.searchedWeb ? "tavily" : undefined,
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process chat query";
    console.error("Chat API Error:", message);
    return NextResponse.json(
      { success: false, error: { code: "CHAT_FAILED", message } },
      { status: 500 }
    );
  }
}
