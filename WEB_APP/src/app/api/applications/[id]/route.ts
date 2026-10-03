import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } },
        { status: 401 }
      );
    }
    const { id } = await context.params;
    const draft = await db.getDraftById(id);

    if (!draft) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Draft not found" } },
        { status: 404 }
      );
    }

    if (draft.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have access to this draft" } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      draft,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch draft";
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message } },
      { status: 500 }
    );
  }
}
