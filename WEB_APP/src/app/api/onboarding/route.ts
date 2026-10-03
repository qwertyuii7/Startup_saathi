import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { signUserToken } from "@/lib/auth/jwt";
import { config } from "@/lib/config";
import { db } from "@/lib/db/store";
import { StartupProfile } from "@/lib/db/models";
import { v4 as uuidv4 } from "uuid";

const PHONE_RE = /^[+\d][\d\s\-()]{5,29}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const founderDataSchema = z
  .object({
    name: z.string().trim().min(1, "Founder name is required.").max(200).optional(),
    email: z.string().trim().toLowerCase().email("Founder email is invalid.").max(320).optional(),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine((v) => v === "" || PHONE_RE.test(v), "Phone number format is invalid.")
      .optional(),
    role: z.string().trim().min(1).max(50).optional(),
  })
  .strict();

const startupDataSchema = z
  .object({
    startupName: z.string().trim().min(1, "Startup name is required.").max(200).optional(),
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).optional(),
    industry: z.string().trim().min(1).max(100).optional(),
    stage: z.string().trim().min(1).max(100).optional(),
    website: z
      .string()
      .trim()
      .max(500)
      .refine((v) => v === "" || /^https?:\/\/.+\..+/.test(v), "Website must be a valid URL.")
      .optional(),
    entityType: z.string().trim().min(1).max(100).optional(),
    incorporationDate: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || (DATE_RE.test(v) && !isNaN(new Date(v).getTime()) && new Date(v) <= new Date()),
        "Incorporation date must be a valid past date (YYYY-MM-DD)."
      )
      .optional(),
    state: z.string().trim().min(1).max(100).optional(),
    city: z.string().trim().min(1).max(100).optional(),
    dpiitStatus: z
      .union([z.enum(["Yes", "No", "Applied / Pending", "Not Sure"]), z.boolean()])
      .optional(),
    dpiitNumber: z.string().trim().max(50).optional(),
    dpiitRecognitionNumber: z.string().trim().max(50).optional(),
    revenueRange: z.string().trim().max(50).optional(),
    annualTurnover: z.coerce.number().min(0, "Turnover cannot be negative.").max(1e13).optional(),
    turnoverRange: z.string().trim().max(50).optional(),
    fundingStatus: z.string().trim().max(100).optional(),
    previousGovernmentFunding: z.union([z.enum(["Yes", "No", "Not Sure"]), z.boolean()]).optional(),
    governmentFundingDetails: z.string().trim().max(2000).optional(),
    assistanceInterests: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  })
  .strict();

const patchSchema = z.object({
  step: z.number().int().min(0).max(5).optional(),
  startupData: startupDataSchema.optional(),
  founderData: founderDataSchema.optional(),
});

// GET /api/onboarding
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
      completed: user.onboardingCompleted || false,
      // 0 = not started; 1..5 = current step. Preserve 0 (don't use ||).
      currentStep: typeof user.onboardingStep === "number" ? user.onboardingStep : 0,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      startup: startup || null,
    });
  } catch (error: any) {
    console.error("GET /api/onboarding error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to load onboarding status" } },
      { status: 500 }
    );
  }
}

// PATCH /api/onboarding
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: issue?.message || "Invalid onboarding data." } },
        { status: 400 }
      );
    }
    const { step, startupData, founderData } = parsed.data;

    // Update user onboarding step — only forward-by-one or re-save allowed.
    if (typeof step === "number") {
      const current = typeof user.onboardingStep === "number" ? user.onboardingStep : 0;
      if (step !== current && step !== current + 1) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_STEP", message: "Steps must be completed in order." } },
          { status: 400 }
        );
      }
      user.onboardingStep = step;
      user.updatedAt = new Date().toISOString();
      await db.saveUser(user);
    }

    // Get or initialize startup record for this user.
    // Only provided fields are written — no invented defaults.
    const startup = await db.getStartupByUserId(user.id);
    const isNew = !startup || startup.userId !== user.id;
    const sd = startupData || {};

    const startupId = isNew ? `startup_${uuidv4().substring(0, 8)}` : (startup as StartupProfile).id;

    const prev = (startup || {}) as Partial<StartupProfile>;
    const pick = <T>(next: T | undefined, fallback: T | undefined): T | undefined =>
      next !== undefined ? next : fallback;

    const updatedStartup: StartupProfile = {
      ...(prev as StartupProfile),
      id: startupId,
      userId: user.id,
      name: sd.startupName || sd.name || prev.name || `${user.name}'s Startup`,
      startupName: sd.startupName || sd.name || prev.startupName,
      description: pick(sd.description, prev.description) || "",
      summary: pick(sd.description, prev.summary) || "",
      industry: pick(sd.industry, prev.industry) || "",
      sector: sd.industry || prev.sector || "",
      stage: pick(sd.stage, prev.stage) || "",
      startupStage: sd.stage || prev.startupStage,
      website: pick(sd.website, prev.website) || "",

      // Founder Data
      founderName: founderData?.name || prev.founderName || user.name,
      founderEmail: founderData?.email || prev.founderEmail || user.email,
      founderPhone: pick(founderData?.phone, prev.founderPhone),
      founderRole: founderData?.role || prev.founderRole || "Founder",

      // Legal Data
      legalEntity: (sd.entityType || prev.legalEntity || prev.entityType || "") as StartupProfile["legalEntity"],
      entityType: sd.entityType || prev.entityType,
      incorporationDate: pick(sd.incorporationDate, prev.incorporationDate),
      state: pick(sd.state, prev.state) || "",
      city: pick(sd.city, prev.city) || "",
      dpiitStatus: sd.dpiitStatus !== undefined ? sd.dpiitStatus : (prev.dpiitStatus ?? "Not Sure"),
      dpiitNumber: sd.dpiitRecognitionNumber || sd.dpiitNumber || prev.dpiitNumber || "",
      dpiitRecognitionNumber: sd.dpiitRecognitionNumber || prev.dpiitRecognitionNumber || "",

      // Business & Funding Data
      revenueRange: pick(sd.revenueRange, prev.revenueRange) || "",
      annualTurnover: sd.annualTurnover !== undefined ? Number(sd.annualTurnover) : prev.annualTurnover || 0,
      turnoverRange: pick(sd.turnoverRange, prev.turnoverRange),
      fundingStatus: pick(sd.fundingStatus, prev.fundingStatus) || "",
      previousGovernmentFunding:
        sd.previousGovernmentFunding !== undefined ? sd.previousGovernmentFunding : (prev.previousGovernmentFunding ?? "Not Sure"),
      governmentFundingDetails: pick(sd.governmentFundingDetails, prev.governmentFundingDetails) || "",
      assistanceInterests: sd.assistanceInterests || prev.assistanceInterests || [],

      updatedAt: new Date().toISOString(),
    };

    await db.saveStartup(updatedStartup);

    // Refresh the session cookie so middleware/GET /api/auth/me see the
    // latest onboardingStep without requiring a re-login.
    const token = await signUserToken(user);
    const response = NextResponse.json({
      success: true,
      currentStep: user.onboardingStep,
      startup: updatedStartup,
    });
    response.cookies.set(config.auth.cookieName, token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error: any) {
    console.error("PATCH /api/onboarding error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to update onboarding progress" } },
      { status: 500 }
    );
  }
}
