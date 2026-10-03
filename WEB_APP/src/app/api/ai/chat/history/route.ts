import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_ID", message: "conversationId query parameter is required" } },
        { status: 400 }
      );
    }

    const conversation = await db.getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } },
        { status: 404 }
      );
    }
    if (conversation.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have access to this conversation" } },
        { status: 403 }
      );
    }

    const messages = await db.getMessagesByConversation(conversationId);

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch chat history";
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message } },
      { status: 500 }
    );
  }
}
