import { db } from "../db/store";
import { GroqService } from "../ai/groq";
import { ApplicationDraftRecord } from "../db/models";
import { v4 as uuidv4 } from "uuid";

export class ApplicationDraftEngine {
  static async generateDraft(userId: string, startupId: string, schemeId: string): Promise<ApplicationDraftRecord> {
    const startup = await db.getStartupById(startupId) || await db.getStartupByUserId(userId);
    if (!startup || startup.userId !== userId) {
      throw new Error("Startup profile not found. Please complete onboarding first.");
    }
    const scheme = await db.getSchemeById(schemeId);
    if (!scheme) {
      throw new Error("Scheme not found.");
    }

    const draftId = `draft_${uuidv4().substring(0, 8)}`;
    const orMissing = (v: unknown) => (v === undefined || v === null || v === "" ? "not provided" : String(v));

    const prompt = `Synthesize a formal Indian government grant application draft for:
Startup: ${orMissing(startup.name || startup.startupName)}
Industry: ${orMissing(startup.industry)} - ${orMissing(startup.sector)}
Location: ${orMissing(startup.city)}, ${orMissing(startup.state)}
Turnover: ${typeof startup.annualTurnover === "number" ? `₹${startup.annualTurnover.toLocaleString("en-IN")}` : orMissing(startup.turnoverDisplay)}
DPIIT: ${startup.dpiitStatus === true ? `Recognized${startup.dpiitNumber || startup.dpiitRecognitionNumber ? ` (${startup.dpiitNumber || startup.dpiitRecognitionNumber})` : ""}` : startup.dpiitStatus === false ? "Not recognized" : "not provided"}
Description: ${orMissing(startup.description || startup.summary)}
Target Scheme: ${scheme.name} (${scheme.maxBenefitDisplay})

RULES: Only use the profile values above. For anything marked "not provided", write "To be provided by founder" instead of inventing facts. Never invent certificate numbers, dates, or financial figures.

Generate strict JSON with these 9 exact keys:
1. startupOverview
2. problem
3. solution
4. market
5. innovation
6. businessModel
7. impact
8. fundingRequirement
9. useOfFunds`;

    const schemaDesc = `{
  "startupOverview": "string",
  "problem": "string",
  "solution": "string",
  "market": "string",
  "innovation": "string",
  "businessModel": "string",
  "impact": "string",
  "fundingRequirement": "string",
  "useOfFunds": "string"
}`;

    let sections = await GroqService.generateJSON<ApplicationDraftRecord["sections"]>(
      [
        { role: "system", content: "You are an expert government grant writer for Indian startups." },
        { role: "user", content: prompt },
      ],
      schemaDesc
    );

    if (!sections || !sections.startupOverview) {
      // Deterministic fallback draft — built ONLY from the real profile,
      // with explicit gaps where data is missing.
      const sName = startup.name || startup.startupName || "Your startup";
      const location = [startup.city, startup.state].filter(Boolean).join(", ") || "location to be provided";
      sections = {
        startupOverview: `${sName} (${location}). ${startup.description || startup.summary || "Description to be provided by founder."}`,
        problem: "To be provided by founder: describe the problem your startup solves.",
        solution: "To be provided by founder: describe your product or service.",
        market: "To be provided by founder: describe your target market.",
        innovation: "To be provided by founder: describe what is innovative about your approach.",
        businessModel: startup.businessModel || "To be provided by founder.",
        impact: "To be provided by founder: describe expected impact and outcomes.",
        fundingRequirement: `Requesting monetary seed grant / assistance under ${scheme.name} (${scheme.maxBenefitDisplay}).`,
        useOfFunds: "To be provided by founder: itemize how the funds will be used.",
      };
    }

    const draftRecord: ApplicationDraftRecord = {
      id: draftId,
      userId,
      startupId: startup?.id || startupId,
      schemeId: scheme.id,
      schemeName: scheme.name,
      sections,
      isReviewedByFounder: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveDraft(draftRecord);
    return draftRecord;
  }
}
