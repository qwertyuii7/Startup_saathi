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
    const history = await db.getAnalysesByUserId(user.id);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch analysis history";
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message } },
      { status: 500 }
    );
  }
}
