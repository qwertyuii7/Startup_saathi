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
    const analysis = await db.getAnalysisById(id);

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Analysis not found" } },
        { status: 404 }
      );
    }

    if (analysis.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have access to this analysis" } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch analysis";
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message } },
      { status: 500 }
    );
  }
}

// PATCH /api/deep-analysis/[id] — toggle an action-plan item's completion.
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } },
        { status: 401 }
      );
    }
    const { id } = await context.params;
    const analysis = await db.getAnalysisById(id);
    if (!analysis) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Analysis not found" } },
        { status: 404 }
      );
    }
    if (analysis.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have access to this analysis" } },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { actionId, completed } = body as { actionId?: string; completed?: boolean };
    if (!actionId || typeof completed !== "boolean") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "actionId and completed are required." } },
        { status: 400 }
      );
    }
    const item = analysis.actionPlan.find((a) => a.id === actionId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Action item not found" } },
        { status: 404 }
      );
    }
    item.completed = completed;
    analysis.updatedAt = new Date().toISOString();
    await db.saveAnalysis(analysis);

    return NextResponse.json({ success: true, analysis });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update action item";
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_FAILED", message } },
      { status: 500 }
    );
  }
}
