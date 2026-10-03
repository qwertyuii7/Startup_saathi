import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { deepAnalysisAgent } from "@/lib/agents/deep-analysis/graph";
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
          error: { code: "ONBOARDING_REQUIRED", message: "Please complete onboarding before running an analysis." },
        },
        { status: 400 }
      );
    }
    const startupId = startup.id;

    const body = await req.json().catch(() => ({}));
    const query = body.query || "Find all Central and Uttar Pradesh schemes my SaaS startup may qualify for.";
    const scope = body.scope || {
      geography: "both",
      state: startup?.state || "Uttar Pradesh",
      industry: startup?.industry || "Technology / SaaS",
      stage: startup?.stage || "Early Stage",
      schemeTypes: ["Grants", "Subsidies", "Incubation", "Tax Benefits"],
      depth: "deep",
    };

    // Execute LangGraph Agentic Workflow
    const finalState = await deepAnalysisAgent.invoke({
      userId,
      startupId,
      query,
      scope,
      candidateSchemes: [],
      findings: [],
      actionPlan: [],
      incubatorMatches: [],
      errors: [],
    });

    if (!finalState.record) {
      return NextResponse.json(
        { success: false, error: { code: "ANALYSIS_FAILED", message: "Agent failed to produce analysis record." } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: finalState.record,
      findings: finalState.findings,
      actionPlan: finalState.actionPlan,
      incubators: finalState.incubatorMatches,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Deep analysis agent encountered an error";
    console.error("Deep Analysis API Error:", message);
    return NextResponse.json(
      { success: false, error: { code: "AGENT_ERROR", message } },
      { status: 500 }
    );
  }
}
