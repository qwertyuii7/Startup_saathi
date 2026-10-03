import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";
import { calculateProfileHealth } from "@/lib/profile/health";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const [founder, startup, documents] = await Promise.all([
      db.getFounderProfileByUserId(user.id),
      db.getStartupByUserId(user.id),
      db.getDocumentsByUserId(user.id),
    ]);

    // If no FounderProfile exists, create a default one from User model
    const founderProfile = founder || {
      id: user.id,
      userId: user.id,
      fullName: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.avatar,
      updatedAt: new Date().toISOString(),
    };

    const health = calculateProfileHealth(founderProfile as any, startup, documents);

    return NextResponse.json({
      success: true,
      data: {
        founder: founderProfile,
        startup: startup || {},
        documents: documents || [],
        health,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}
