export class ContextBuilder {  private startupProfile: any = null;
  private founderProfile: any = null;
  private documentInventory: any[] = [];
  private documentChunks: any[] = [];
  private governmentKnowledge: any[] = [];
  private schemeContext: string = "";
  private requirements: any[] = [];
  private eligibilityResults: any[] = [];
  private currentAnalysis: any = null;
  private actionPlan: any[] = [];
  private pageContext: string = "";

  setStartupProfile(profile: any) { this.startupProfile = profile; return this; }
  setFounderProfile(profile: any) { this.founderProfile = profile; return this; }
  setDocumentInventory(docs: any[]) { this.documentInventory = docs; return this; }
  setDocumentChunks(chunks: any[]) { this.documentChunks = chunks; return this; }
  setGovernmentKnowledge(chunks: any[]) { this.governmentKnowledge = chunks; return this; }
  setSchemeContext(text: string) { this.schemeContext = text; return this; }
  setRequirements(reqs: any[]) { this.requirements = reqs; return this; }
  setEligibilityResults(results: any[]) { this.eligibilityResults = results; return this; }
  setCurrentAnalysis(analysis: any) { this.currentAnalysis = analysis; return this; }
  setActionPlan(plan: any[]) { this.actionPlan = plan; return this; }
  setPageContext(ctx: string) { this.pageContext = ctx; return this; }

  build(): string {
    const parts = [];
    
    parts.push("You are AROVA, a context-aware startup scheme intelligence assistant.");
    parts.push("Answer ONLY from the workspace context below. Distinguish verified facts (startup documents) and statutory rules (official gazettes).");
    parts.push("RULES: NEVER invent facts, certificates, dates, or scheme requirements.");
    parts.push("Cite evidence inline like [DPIIT Certificate.pdf, Page 2] or [SISFS Guidelines].");
    parts.push("If evidence is insufficient, state: 'I don't have enough verified information to answer this confidently.'");

    if (this.startupProfile) {
      parts.push("\n=== STARTUP PROFILE ===");
      parts.push(JSON.stringify(this.startupProfile, null, 2));
    }

    if (this.founderProfile) {
      parts.push("\n=== FOUNDER PROFILE ===");
      parts.push(JSON.stringify(this.founderProfile, null, 2));
    }

    if (this.documentInventory && this.documentInventory.length > 0) {
      parts.push("\n=== DOCUMENT INVENTORY ===");
      parts.push(this.documentInventory.map(d => `- ${d.name} [${d.type}]`).join("\n"));
    }

    if (this.documentChunks && this.documentChunks.length > 0) {
      parts.push("\n=== DOCUMENT EVIDENCE ===");
      parts.push(this.documentChunks.map((r, i) => `[D${i + 1}] ${r.chunk.fileName}: "${r.chunk.content.slice(0, 500)}"`).join("\n"));
    }

    if (this.governmentKnowledge && this.governmentKnowledge.length > 0) {
      parts.push("\n=== OFFICIAL RULES ===");
      parts.push(this.governmentKnowledge.map((r, i) => `[G${i + 1}] ${r.chunk.fileName}: "${r.chunk.content.slice(0, 500)}"`).join("\n"));
    }

    if (this.schemeContext) {
      parts.push(`\n=== SCHEME CONTEXT ===\n${this.schemeContext}`);
    }

    if (this.requirements && this.requirements.length > 0) {
      parts.push("\n=== REQUIREMENTS ===");
      parts.push(JSON.stringify(this.requirements, null, 2));
    }

    if (this.currentAnalysis) {
      parts.push("\n=== CURRENT ANALYSIS ===");
      parts.push(JSON.stringify({
        status: this.currentAnalysis.status,
        schemesAnalyzed: this.currentAnalysis.schemesAnalyzedCount,
        eligible: this.currentAnalysis.eligibleCount
      }, null, 2));
    }

    if (this.actionPlan && this.actionPlan.length > 0) {
      parts.push("\n=== ACTION PLAN ===");
      parts.push(JSON.stringify(this.actionPlan, null, 2));
    }

    if (this.pageContext) {
      parts.push(`\n=== PAGE CONTEXT ===\n${this.pageContext}`);
    }

    return parts.join("\n");
  }
}

export interface AROVAContextParams {
  userId: string;
  startupId?: string;
  pathname?: string;
  pageName?: string;
  schemeId?: string;
  analysisId?: string;
  documentId?: string;
}

/**
 * Central AROVA context builder (spec §10). Single source of truth reused by
 * Deep Analysis, Ask AROVA, scheme/eligibility/evidence/action-plan pages.
 * Ownership is enforced: everything is scoped to the authenticated user.
 */
export async function buildAROVAContext(params: AROVAContextParams) {
  const { db } = await import("../db/store");
  const { userId } = params;

  const user = await db.getUserById(userId);
  const startup = params.startupId
    ? (await db.getStartupById(params.startupId)) || (await db.getStartupByUserId(userId))
    : await db.getStartupByUserId(userId);
  const startupId = startup?.id || params.startupId || "";

  const [founder, documents, analyses] = await Promise.all([
    db.getFounderProfileByUserId(userId),
    startupId ? db.getDocumentsByStartupId(startupId) : Promise.resolve([]),
    db.getAnalysesByUserId(userId),
  ]);

  const activeAnalysis = params.analysisId
    ? analyses.find((a) => a.id === params.analysisId) || analyses[0] || null
    : analyses[0] || null;

  const findings = activeAnalysis?.findings || [];
  const eligibility = findings.map((f) => ({
    schemeId: f.schemeId,
    schemeName: f.schemeName,
    fitLevel: f.fitLevel,
    criteriaMetCount: f.criteriaMetCount,
    totalCriteriaCount: f.totalCriteriaCount,
  }));
  const requirements = findings.flatMap((f) =>
    f.criteriaBreakdown.map((c) => ({ ...c, schemeId: f.schemeId, schemeName: f.schemeName }))
  );
  const evidence = requirements.filter((r) => r.evidenceDocumentName);
  const gaps = findings.flatMap((f) => f.blockingFactors.map((b) => ({ ...b, schemeId: f.schemeId, schemeName: f.schemeName })));

  return {
    user: user ? { id: user.id, name: user.name, email: user.email } : null,
    startup,
    founder,
    business: startup
      ? { industry: startup.industry, stage: startup.stage, businessModel: startup.businessModel, turnoverDisplay: startup.turnoverDisplay }
      : null,
    legal: startup
      ? { entityType: startup.entityType || startup.legalEntity, dpiitStatus: startup.dpiitStatus, state: startup.state, city: startup.city }
      : null,
    documents: documents.map((d) => ({ id: d.id, name: d.name, type: d.type, status: d.status, pageCount: d.pageCount, chunksCount: d.chunksCount })),
    activeAnalysis,
    eligibility,
    requirements,
    evidence,
    gaps,
    risks: activeAnalysis?.risks || [],
    opportunities: activeAnalysis?.opportunities || [],
    incubators: activeAnalysis?.incubatorMatches || [],
    actionPlan: activeAnalysis?.actionPlan || [],
    readiness: activeAnalysis?.readiness || null,
    currentPage: params.pageName || params.pathname || null,
    currentEntity: {
      schemeId: params.schemeId || null,
      analysisId: params.analysisId || activeAnalysis?.id || null,
      documentId: params.documentId || null,
    },
  };
}

export type AROVAContext = Awaited<ReturnType<typeof buildAROVAContext>>;
