import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { toSafeUser } from "@/lib/auth/google";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: toSafeUser(user),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal error" } },
      { status: 500 }
    );
  }
}
