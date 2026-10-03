import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { ApplicationDraftEngine } from "@/lib/applications/generator";
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
          error: { code: "ONBOARDING_REQUIRED", message: "Please complete onboarding before generating a draft." },
        },
        { status: 400 }
      );
    }
    const startupId = startup.id;

    const body = await req.json().catch(() => ({}));
    const schemeId = body.schemeId || "sisfs_seed_fund";

    const draft = await ApplicationDraftEngine.generateDraft(userId, startupId, schemeId);

    return NextResponse.json({
      success: true,
      draft,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate application draft";
    console.error("Application Draft Error:", message);
    return NextResponse.json(
      { success: false, error: { code: "DRAFT_FAILED", message } },
      { status: 500 }
    );
  }
}
