import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { EligibilityEngine } from "@/lib/eligibility/engine";
import { db } from "@/lib/db/store";

// GET /api/schemes/evaluate[?schemeId=]
// Real per-user eligibility fit for every scheme (or one scheme),
// computed from the authenticated user's startup profile + their own
// uploaded document evidence. No invented results.
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
      return NextResponse.json(
        {
          success: false,
          error: { code: "ONBOARDING_REQUIRED", message: "Complete onboarding to evaluate scheme eligibility." },
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const schemeId = searchParams.get("schemeId");
    const schemes = schemeId
      ? [await db.getSchemeById(schemeId)].filter((s): s is NonNullable<typeof s> => !!s)
      : await db.getAllSchemes();

    if (schemeId && schemes.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Scheme not found" } },
        { status: 404 }
      );
    }

    const evaluations = [];
    for (const scheme of schemes) {
      const finding = await EligibilityEngine.evaluateScheme(startup, scheme);
      evaluations.push(finding);
    }

    return NextResponse.json({ success: true, evaluations });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to evaluate schemes";
    console.error("Scheme evaluation error:", message);
    return NextResponse.json(
      { success: false, error: { code: "EVALUATION_FAILED", message } },
      { status: 500 }
    );
  }
}
