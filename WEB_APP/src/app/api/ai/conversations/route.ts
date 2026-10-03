import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } },
      { status: 401 }
    );
  }
  const conversations = await db.getConversationsByUserId(user.id);
  return NextResponse.json({ success: true, conversations });
}
