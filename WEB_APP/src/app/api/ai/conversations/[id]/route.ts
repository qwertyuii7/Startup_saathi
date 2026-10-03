import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } },
      { status: 401 }
    );
  }
  const conv = await db.getConversation(id);
  if (!conv) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } },
      { status: 404 }
    );
  }
  if (conv.userId !== user.id) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "You do not have access to this conversation" } },
      { status: 403 }
    );
  }
  const messages = await db.getMessagesByConversation(id);
  return NextResponse.json({ success: true, conversation: conv, messages });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } },
      { status: 401 }
    );
  }
  const conv = await db.getConversation(id);
  if (!conv) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } },
      { status: 404 }
    );
  }
  if (conv.userId !== user.id) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "You do not have access to this conversation" } },
      { status: 403 }
    );
  }
  await db.deleteConversation(id);
  return NextResponse.json({ success: true, message: "Conversation deleted" });
}
