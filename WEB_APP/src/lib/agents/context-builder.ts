export class ContextBuilder {
  private startupProfile: any = null;
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
