import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";
import { signUserToken } from "@/lib/auth/jwt";
import { config } from "@/lib/config";

// POST /api/onboarding/complete
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } },
        { status: 401 }
      );
    }

    // Confirm required onboarding data is actually persisted before
    // marking complete — never complete on frontend state alone.
    const step = typeof user.onboardingStep === "number" ? user.onboardingStep : 0;
    const startup = await db.getStartupByUserId(user.id);
    const missing: string[] = [];
    if (step < 4) missing.push("earlier onboarding steps");
    if (!startup) {
      missing.push("startup profile");
    } else {
      if (!startup.name && !startup.startupName) missing.push("startup name");
      if (!startup.founderName && !user.name) missing.push("founder name");
      if (!startup.industry) missing.push("industry");
      if (!startup.state) missing.push("registered state");
    }
    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ONBOARDING_INCOMPLETE",
            message: `Complete the remaining information first: ${missing.join(", ")}.`,
          },
        },
        { status: 400 }
      );
    }

    // Mark user onboarding as complete
    user.onboardingCompleted = true;
    user.onboardingStep = 5;
    user.onboardingCompletedAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    await db.saveUser(user);

    const token = await signUserToken(user);

    const response = NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
      },
      startup,
    });

    // Refresh secure HTTP-only cookie with updated onboarding state
    response.cookies.set(config.auth.cookieName, token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("POST /api/onboarding/complete error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to complete onboarding" } },
      { status: 500 }
    );
  }
}
