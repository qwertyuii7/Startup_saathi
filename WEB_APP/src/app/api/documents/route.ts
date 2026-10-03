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
    const startup = await db.getStartupByUserId(user.id);
    if (!startup) {
      return NextResponse.json({ success: true, documents: [] });
    }
    const docs = await db.getDocumentsByStartupId(startup.id);

    return NextResponse.json({
      success: true,
      documents: docs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch documents";
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message } },
      { status: 500 }
    );
  }
}
