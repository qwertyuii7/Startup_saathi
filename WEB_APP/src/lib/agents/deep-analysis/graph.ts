import { StateGraph, END, START } from "@langchain/langgraph";
import { DeepAnalysisState } from "./state";
import { db } from "../../db/store";
import { EligibilityEngine } from "../../eligibility/engine";
import { GroqService } from "../../ai/groq";
import { v4 as uuidv4 } from "uuid";
import { DeepAnalysisRecord, ActionItemRecord } from "../../db/models";

// Step 1: Load Startup Context
async function loadStartupContext(state: DeepAnalysisState): Promise<Partial<DeepAnalysisState>> {
  const startup = await db.getStartupById(state.startupId) || await db.getStartupByUserId(state.userId);
  if (!startup) {
    return { errors: [...state.errors, "Startup profile not found for user."] };
  }
  return { startupProfile: startup };
}

// Step 2: Retrieve Candidate Schemes based on scope & geography
async function retrieveCandidateSchemes(state: DeepAnalysisState): Promise<Partial<DeepAnalysisState>> {
  const allSchemes = await db.getAllSchemes();
  const startup = state.startupProfile;

  const candidateSchemes = allSchemes.filter(s => {
    // Geography Filter
    if (state.scope.geography === "central" && s.governmentLevel !== "Central") return false;
    if (state.scope.geography === "state" && s.governmentLevel !== "State") return false;
    if (s.governmentLevel === "State" && s.state && startup && s.state.toLowerCase() !== startup.state.toLowerCase()) {
      return false;
    }
    return true;
  });

  return { candidateSchemes };
}

// Step 3: Evaluate Eligibility condition-by-condition
async function evaluateEligibility(state: DeepAnalysisState): Promise<Partial<DeepAnalysisState>> {
  if (!state.startupProfile) return {};
  const findings = [];

  for (const scheme of state.candidateSchemes) {
    const finding = await EligibilityEngine.evaluateScheme(state.startupProfile, scheme);
    findings.push(finding);
  }

  return { findings };
}

// Step 4: Generate Prioritized Path-to-Eligibility Action Plan.
// Derived ONLY from the actual blocking factors found in this run —
// no invented tasks. Each blocker becomes an actionable item.
async function generateActionPlan(state: DeepAnalysisState): Promise<Partial<DeepAnalysisState>> {
  const analysisId = `analysis_${uuidv4().substring(0, 8)}`;
  const actionItems: ActionItemRecord[] = [];

  const blockers = state.findings.flatMap((f) =>
    f.blockingFactors.map((b) => ({ ...b, schemeName: f.schemeName }))
  );

  const actionFor = (category: string): { actionLabel: string; actionType: ActionItemRecord["actionType"]; category: string } => {
    if (category === "financial") {
      return { actionLabel: "Upload Document", actionType: "upload", category: "Financial" };
    }
    if (category === "infrastructure") {
      return { actionLabel: "Connect Incubator", actionType: "incubator", category: "Incubation" };
    }
    if (category === "dpiit" || category === "incorporation" || category === "location" || category === "industry") {
      return { actionLabel: "Complete Profile", actionType: "profile", category: "Profile" };
    }
    return { actionLabel: "Review Requirement", actionType: "external", category: "Compliance" };
  };

  // Group identical resolutions across schemes so the plan stays concise.
  const grouped = new Map<string, { schemes: string[]; sample: (typeof blockers)[number] }>();
  for (const b of blockers) {
    const key = b.resolutionAction;
    const entry = grouped.get(key);
    if (entry) {
      if (!entry.schemes.includes(b.schemeName)) entry.schemes.push(b.schemeName);
    } else {
      grouped.set(key, { schemes: [b.schemeName], sample: b });
    }
  }

  // Resolution text is produced per requirement category by the
  // eligibility engine, so the action type follows from it.
  const categoryOf = (resolution: string): string => {
    const r = resolution.toLowerCase();
    if (r.includes("financial") || r.includes("tax") || r.includes("audit") || r.includes("bank")) return "financial";
    if (r.includes("incubator") || r.includes("accelerator")) return "infrastructure";
    if (r.includes("dpiit")) return "dpiit";
    if (r.includes("incorporation") || r.includes("cin")) return "incorporation";
    if (r.includes("address") || r.includes("state") || r.includes("registered")) return "location";
    if (r.includes("industry") || r.includes("sector") || r.includes("pitch deck") || r.includes("innovation")) return "innovation";
    return "other";
  };

  let step = 1;
  for (const [resolution, g] of grouped) {
    const cat = categoryOf(resolution);
    const action = actionFor(cat);
    actionItems.push({
      id: `act_${uuidv4().substring(0, 6)}`,
      analysisId,
      stepNumber: String(step).padStart(2, "0"),
      title: resolution,
      description: `${g.sample.required} — currently: ${g.sample.current}. Required for: ${g.schemes.join(", ")}.`,
      estimatedEffort: action.actionType === "upload" ? "15 minutes" : action.actionType === "profile" ? "10 minutes" : "1–3 days",
      unlocksCount: g.schemes.length,
      unlocksDescription: `Unblocks: ${g.schemes.join(", ")}`,
      completed: false,
      actionLabel: action.actionLabel,
      actionType: action.actionType,
      category: action.category,
    });
    step += 1;
  }

  return { actionPlan: actionItems };
}

// Step 5: Match Empaneled Incubators
async function matchIncubators(state: DeepAnalysisState): Promise<Partial<DeepAnalysisState>> {
  const allIncubators = await db.getAllIncubators();
  const startup = state.startupProfile;

  const matches = allIncubators.filter(inc => {
    if (!startup) return true;
    if (inc.state === startup.state || inc.state === "Telangana" || inc.focusArea.toLowerCase().includes("saas") || inc.focusArea.toLowerCase().includes("ai")) {
      return true;
    }
    return false;
  });

  return { incubatorMatches: matches };
}

// Step 6: Synthesize Executive Summary & Persist Record
async function synthesizeAndSave(state: DeepAnalysisState): Promise<Partial<DeepAnalysisState>> {
  const analysisId = state.actionPlan[0]?.analysisId || `analysis_${uuidv4().substring(0, 8)}`;

  const eligibleCount = state.findings.filter(f => f.fitLevel === "eligible").length;
  const potentialCount = state.findings.filter(f => f.fitLevel === "potential").length;
  const missingCount = state.findings.filter(f => f.fitLevel === "missing_requirement").length;
  const notEligibleCount = state.findings.filter(f => f.fitLevel === "not_eligible").length;

  // Documented readiness formula: satisfied=1, needs_verification=0.5, else 0.
  let totalRequirements = 0;
  let supported = 0;
  let needsVerification = 0;
  for (const f of state.findings) {
    for (const c of f.criteriaBreakdown) {
      totalRequirements += 1;
      if (c.status === "satisfied") supported += 1;
      else if (c.status === "needs_verification") needsVerification += 1;
    }
  }
  const missing = Math.max(0, totalRequirements - supported - needsVerification);
  const score = totalRequirements === 0 ? 0 : Math.round(((supported + needsVerification * 0.5) / totalRequirements) * 100);
  const readiness = {
    totalRequirements,
    supported,
    needsVerification,
    missing,
    score,
    formula: "readiness = (supported + 0.5 * needs_verification) / total_requirements",
  };

  // Grounded risks: one per distinct blocking resolution (with evidence).
  const riskMap = new Map<string, { title: string; evidence: string; schemeId?: string }>();
  for (const f of state.findings) {
    for (const b of f.blockingFactors) {
      if (!riskMap.has(b.resolutionAction)) {
        riskMap.set(b.resolutionAction, {
          title: b.issue,
          evidence: `${b.required} — currently: ${b.current} (${f.schemeName})`,
          schemeId: f.schemeId,
        });
      }
    }
  }
  const risks = Array.from(riskMap.values()).slice(0, 10);

  // Grounded opportunities: eligible + potential schemes with reasons.
  const opportunities = state.findings
    .filter((f) => f.fitLevel === "eligible" || f.fitLevel === "potential")
    .slice(0, 10)
    .map((f) => ({
      title: f.schemeName,
      reason:
        f.fitLevel === "eligible"
          ? `All ${f.totalCriteriaCount} requirements satisfied (${f.maxBenefit}).`
          : `${f.criteriaMetCount}/${f.totalCriteriaCount} requirements satisfied — close with ${f.blockingFactors.length} blocker(s).`,
      schemeId: f.schemeId,
    }));

  // Groq executive summary grounded ONLY in these computed numbers.
  let executiveSummary = `Evaluated ${state.findings.length} schemes: ${eligibleCount} eligible, ${potentialCount} potential, ${missingCount} missing evidence, ${notEligibleCount} not eligible. Readiness ${score}% across ${totalRequirements} requirements.`;
  try {
    const summary = await GroqService.chat([
      {
        role: "system",
        content: "You summarize startup scheme analyses using ONLY the numbers provided. Never invent schemes, documents, or figures. Keep it to 3 sentences, professional and actionable.",
      },
      {
        role: "user",
        content: `Schemes: ${state.findings.length}, eligible: ${eligibleCount}, potential: ${potentialCount}, missing: ${missingCount}, not eligible: ${notEligibleCount}. Readiness: ${score}% (${supported} supported, ${needsVerification} verification, ${missing} missing of ${totalRequirements}). Top blockers: ${risks.slice(0, 3).map((r) => r.title).join("; ") || "none"}.`,
      },
    ]);
    if (summary && !summary.startsWith("AROVA's AI service is temporarily unreachable")) {
      executiveSummary = summary.trim();
    }
  } catch {
    // Keep deterministic fallback — never fail analysis on Groq outage.
  }

  const record: DeepAnalysisRecord = {
    id: analysisId,
    userId: state.userId,
    startupId: state.startupId,
    title: state.query.length > 50 ? `${state.query.substring(0, 47)}...` : state.query || "Central & State Deep Scan",
    query: state.query,
    scope: state.scope,
    schemesAnalyzedCount: state.findings.length,
    eligibleCount,
    potentialCount,
    missingCount,
    notEligibleCount,
    findings: state.findings,
    actionPlan: state.actionPlan,
    incubatorMatches: state.incubatorMatches,
    executiveSummary,
    readiness,
    risks,
    opportunities,
    status: "completed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.saveAnalysis(record);
  return { record };
}

// Define LangGraph StateGraph
export function buildDeepAnalysisGraph() {
  const builder = new StateGraph<DeepAnalysisState>({
    channels: {
      userId: { value: (x, y) => y ?? x, default: () => "" },
      startupId: { value: (x, y) => y ?? x, default: () => "" },
      query: { value: (x, y) => y ?? x, default: () => "" },
      scope: { value: (x, y) => y ?? x, default: () => ({} as any) },
      startupProfile: { value: (x, y) => y ?? x },
      candidateSchemes: { value: (x, y) => y ?? x, default: () => [] },
      findings: { value: (x, y) => y ?? x, default: () => [] },
      actionPlan: { value: (x, y) => y ?? x, default: () => [] },
      incubatorMatches: { value: (x, y) => y ?? x, default: () => [] },
      finalReport: { value: (x, y) => y ?? x },
      record: { value: (x, y) => y ?? x },
      errors: { value: (x, y) => (x || []).concat(y || []), default: () => [] },
    },
  });

  builder.addNode("loadStartupContext", loadStartupContext);
  builder.addNode("retrieveCandidateSchemes", retrieveCandidateSchemes);
  builder.addNode("evaluateEligibility", evaluateEligibility);
  builder.addNode("generateActionPlan", generateActionPlan);
  builder.addNode("matchIncubators", matchIncubators);
  builder.addNode("synthesizeAndSave", synthesizeAndSave);

  const b = builder as any;
  b.addEdge(START, "loadStartupContext");
  b.addEdge("loadStartupContext", "retrieveCandidateSchemes");
  b.addEdge("retrieveCandidateSchemes", "evaluateEligibility");
  b.addEdge("evaluateEligibility", "generateActionPlan");
  b.addEdge("generateActionPlan", "matchIncubators");
  b.addEdge("matchIncubators", "synthesizeAndSave");
  b.addEdge("synthesizeAndSave", END);

  return builder.compile();
}

export const deepAnalysisAgent = buildDeepAnalysisGraph();
