import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";
import { StartupProfile } from "@/lib/db/models";
import { v4 as uuidv4 } from "uuid";

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

    return NextResponse.json({
      success: true,
      startup,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } },
        { status: 401 }
      );
    }
    const body = await req.json().catch(() => ({}));

    // Never trust a userId/startupId sent by the client — the owner is
    // always derived from the server-side session.
    const existing = await db.getStartupByUserId(user.id);

    const updatedStartup: StartupProfile = {
      ...existing,
      ...body,
      id: existing?.id || `startup_${uuidv4().substring(0, 8)}`,
      userId: user.id,
      updatedAt: new Date().toISOString(),
    };

    const saved = await db.saveStartup(updatedStartup);

    return NextResponse.json({
      success: true,
      startup: saved,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_FAILED", message } },
      { status: 500 }
    );
  }
}
