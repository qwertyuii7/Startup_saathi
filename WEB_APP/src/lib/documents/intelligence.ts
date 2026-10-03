import { StartupProfile, StartupDocumentRecord, SchemeMatch, GovernmentScheme } from "../db/models";
import { vectorStore } from "../vector/vector-store";
import { db } from "../db/store";
import { config } from "../config";
import Groq from "groq-sdk";

export class DocumentIntelligenceService {
  static async analyzeDocument(doc: StartupDocumentRecord, startup: StartupProfile): Promise<void> {
    try {
      // 1. Extract Structured Information From Documents
      const facts = await this.extractStructuredFacts(doc);
      
      // Update Startup Profile with new facts
      startup.facts = { ...startup.facts, ...facts.fields };
      startup.factSources = { ...startup.factSources, ...facts.sources };
      await db.saveStartup(startup);

      // 2. Stage 1 & 2: Metadata Filtering + Semantic Retrieval
      const candidateSchemes = await this.retrieveCandidateSchemes(startup, doc);

      // 3. LLM Relevance Verification
      const matches = await this.evaluateSchemesWithLLM(startup, doc, candidateSchemes);

      // 4. Update Database
      const existingMatches = await db.getSchemeMatchesByUserId(startup.userId);
      const newMatches = this.mergeMatches(existingMatches, matches);
      await db.saveSchemeMatches(startup.userId, newMatches);
      
      // Mark as processed (done in processor already, but we can verify it's ready)
    } catch (error) {
      console.error("DocumentIntelligenceService failed for doc:", doc.id, error);
    }
  }

  private static async extractStructuredFacts(doc: StartupDocumentRecord) {
    const groq = new Groq({ apiKey: config.groq.apiKey });
    const prompt = `
Extract structured information from the following document.
Only extract information that is explicitly stated.
Document Text:
${doc.extractedText?.slice(0, 4000) || "No text"}

Return ONLY a JSON object:
{
  "fields": {
    "state": "...",
    "annualIncome": 0,
    "occupation": "..."
  },
  "sources": {
    "state": { "documentId": "${doc.id}", "text": "...", "confidence": 0.9 },
    "annualIncome": { "documentId": "${doc.id}", "text": "...", "confidence": 0.9 }
  }
}
`;
    const res = await groq.chat.completions.create({
      model: config.groq.fastModel,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    
    try {
      return JSON.parse(res.choices[0].message.content || "{}");
    } catch (e) {
      return { fields: {}, sources: {} };
    }
  }

  private static async retrieveCandidateSchemes(startup: StartupProfile, doc: StartupDocumentRecord): Promise<GovernmentScheme[]> {
    // Simple retrieval: get all schemes for now and filter. 
    // In production, we'd use vector matching.
    const allSchemes = await db.getAllSchemes();
    return allSchemes.slice(0, 10); // Limit to top 10 candidates
  }

  private static async evaluateSchemesWithLLM(startup: StartupProfile, doc: StartupDocumentRecord, schemes: GovernmentScheme[]): Promise<SchemeMatch[]> {
    const groq = new Groq({ apiKey: config.groq.apiKey });
    const prompt = `
You are evaluating government scheme eligibility for an applicant based on their documents.
Profile: ${JSON.stringify(startup.facts)}
Document Text: ${doc.extractedText?.slice(0, 3000) || ""}

Schemes to evaluate:
${schemes.map(s => "- " + s.name + ": " + s.description).join("\\n")}

For each scheme, determine relevance and eligibility.
Return ONLY JSON format:
{
  "matches": [
    {
      "schemeId": "...",
      "matchScore": 85,
      "eligibilityStatus": "likely_eligible",
      "matchedCriteria": ["Applicant is from UP"],
      "unmatchedCriteria": [],
      "missingInformation": [],
      "evidence": [{"documentId": "${doc.id}", "page": 1, "text": "..."}],
      "reason": "..."
    }
  ]
}
`;
    const res = await groq.chat.completions.create({
      model: config.groq.model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    try {
      const parsed = JSON.parse(res.choices[0].message.content || "{}");
      return (parsed.matches || []).map((m: any) => ({
        ...m,
        userId: startup.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      return [];
    }
  }

  private static mergeMatches(existing: SchemeMatch[], newMatches: SchemeMatch[]): SchemeMatch[] {
    const map = new Map(existing.map(m => [m.schemeId, m]));
    for (const m of newMatches) {
      map.set(m.schemeId, m);
    }
    return Array.from(map.values());
  }
}
