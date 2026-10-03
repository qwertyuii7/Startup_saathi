import { z } from "zod";

/**
 * Structured AROVA chat response (§1).
 *
 * `message` is the Groq-generated natural-language intro (1–3 sentences).
 * `sections` are built SERVER-SIDE from real retrieval state (schemes,
 * incubators, eligibility findings, evidence chunks, action plan) — never
 * invented by the model. Unknown/extra keys are stripped by Zod.
 */

export const MatchItemSchema = z.object({
  kind: z.enum(["scheme", "incubator"]),
  id: z.string().optional(),
  name: z.string(),
  location: z.string().optional(),
  focus: z.string().optional(),
  eligibility: z.string().optional(),
  whyItFits: z.string().optional(),
  url: z.string().optional(),
});

export const StepItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  actionLabel: z.string().optional(),
  actionRoute: z.string().optional(),
});

export const EligibilityRowSchema = z.object({
  requirementId: z.string().optional(),
  requirement: z.string(),
  status: z.string(),
  statusLabel: z.string(),
  startupValue: z.string().optional(),
  expectedValue: z.string().optional(),
  evidence: z.string().optional(),
  source: z.string().optional(),
  explanation: z.string().optional(),
  schemeId: z.string().optional(),
  schemeName: z.string().optional(),
});

export const EvidenceItemSchema = z.object({
  documentName: z.string(),
  documentId: z.string().optional(),
  page: z.number().optional(),
  section: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.string(),
  requirement: z.string().optional(),
});

export const ComparisonSchema = z.object({
  columns: z.array(z.string()).min(2).max(8),
  rows: z.array(z.array(z.string()).min(2).max(8)).max(12),
  caption: z.string().optional(),
});

const BaseSection = z.object({
  title: z.string().optional(),
});

export const ArovaSectionSchema = z.discriminatedUnion("type", [
  BaseSection.extend({ type: z.literal("text"), body: z.string() }),
  BaseSection.extend({ type: z.literal("bullets"), items: z.array(z.string()).max(10) }),
  BaseSection.extend({ type: z.literal("steps"), items: z.array(StepItemSchema).max(8) }),
  BaseSection.extend({ type: z.literal("matches"), items: z.array(MatchItemSchema).max(6) }),
  BaseSection.extend({ type: z.literal("comparison"), table: ComparisonSchema }),
  BaseSection.extend({ type: z.literal("eligibility"), rows: z.array(EligibilityRowSchema).max(10) }),
  BaseSection.extend({ type: z.literal("evidence"), items: z.array(EvidenceItemSchema).max(6) }),
  BaseSection.extend({
    type: z.literal("callout"),
    tone: z.enum(["warning", "success", "info"]),
    body: z.string(),
  }),
]);

export const CitationSchema = z.object({
  type: z.enum(["document", "official_source", "web"]),
  title: z.string(),
  ref: z.string(),
  url: z.string().optional(),
  domain: z.string().optional(),
  snippet: z.string().optional(),
  sourceName: z.string().optional(),
  sourceType: z.string().optional(),
  favicon: z.string().optional(),
  documentId: z.string().optional(),
  page: z.number().optional(),
  section: z.string().optional(),
  relevance: z.number().optional(),
});

export const ActionSchema = z.object({
  type: z.string(),
  label: z.string(),
  route: z.string(),
  entityId: z.string().optional(),
});

export const RelatedEntitySchema = z.object({
  kind: z.enum(["scheme", "incubator", "requirement", "document", "analysis"]),
  id: z.string().optional(),
  label: z.string(),
  route: z.string(),
});

export const ArovaStructuredSchema = z.object({
  message: z.string(),
  sections: z.array(ArovaSectionSchema).max(8).default([]),
  citations: z.array(CitationSchema).default([]),
  actions: z.array(ActionSchema).default([]),
  relatedEntities: z.array(RelatedEntitySchema).default([]),
  evidence: z.array(EvidenceItemSchema).default([]),
  followUps: z.array(z.string()).default([]),
  webSearchUsed: z.boolean().default(false),
  status: z.enum(["grounded", "partial", "needs_evidence"]).default("partial"),
});

export type ArovaSection = z.infer<typeof ArovaSectionSchema>;
export type ArovaStructured = z.infer<typeof ArovaStructuredSchema>;
export type ArovaCitation = z.infer<typeof CitationSchema>;
export type ArovaAction = z.infer<typeof ActionSchema>;
export type ArovaRelatedEntity = z.infer<typeof RelatedEntitySchema>;

/** Lenient parse: extra keys stripped, failure returns null (caller falls back to markdown). */
export function parseStructured(input: unknown): ArovaStructured | null {
  if (!input || typeof input !== "object") return null;
  const direct = ArovaStructuredSchema.safeParse(input);
  if (direct.success) return direct.data;
  // Tolerant path: keep the message and every individually-valid element.
  // One malformed card must never discard the whole response.
  const obj = input as Record<string, unknown>;
  if (typeof obj.message !== "string" || obj.message.trim() === "") return null;
  const pick = <T>(arr: unknown, schema: z.ZodType<T>): T[] =>
    Array.isArray(arr)
      ? arr.flatMap((el) => {
          const p = schema.safeParse(el);
          return p.success ? [p.data] : [];
        })
      : [];
  return {
    message: obj.message,
    sections: pick(obj.sections, ArovaSectionSchema),
    citations: pick(obj.citations, CitationSchema),
    actions: pick(obj.actions, ActionSchema),
    relatedEntities: pick(obj.relatedEntities, RelatedEntitySchema),
    evidence: pick(obj.evidence, EvidenceItemSchema),
    followUps: Array.isArray(obj.followUps)
      ? obj.followUps.filter((f): f is string => typeof f === "string").slice(0, 4)
      : [],
    webSearchUsed: obj.webSearchUsed === true,
    status: obj.status === "grounded" || obj.status === "needs_evidence" ? obj.status : "partial",
  };
}

// ---------------------------------------------------------------------------
// Deterministic section derivation from REAL retrieval state.
// No LLM invention: every item comes from a DB record or retrieved chunk.
// ---------------------------------------------------------------------------

export interface SectionInput {
  analysisId?: string;
  schemes?: { id: string; name: string; department?: string; maxBenefitDisplay?: string; officialSourceUrl?: string; reason?: string }[];
  incubators?: { id: string; name: string; location?: string; focusArea?: string; websiteUrl?: string; reason?: string }[];
  eligibilityRows?: {
    requirementId?: string; requirement: string; status: string; statusLabel: string;
    startupValue?: string; expectedValue?: string; evidence?: string; source?: string;
    explanation?: string; schemeId?: string; schemeName?: string;
  }[];
  evidenceChunks?: {
    documentName: string; documentId?: string; page?: number; section?: string;
    excerpt?: string; status: string; requirement?: string;
  }[];
  steps?: { title: string; description?: string; actionLabel?: string; actionRoute?: string }[];
}

function withId(path: string, id?: string): string {
  return id ? `${path}?id=${id}` : path;
}

export function deriveSections(input: SectionInput): ArovaSection[] {
  const sections: ArovaSection[] = [];
  const aid = input.analysisId;

  if (input.schemes && input.schemes.length > 0) {
    sections.push({
      type: "matches",
      title: "Relevant schemes",
      items: input.schemes.slice(0, 6).map((s) => ({
        kind: "scheme" as const,
        id: s.id,
        name: s.name,
        location: s.department,
        focus: s.maxBenefitDisplay,
        whyItFits: s.reason,
        url: s.officialSourceUrl,
      })),
    });
  }

  if (input.incubators && input.incubators.length > 0) {
    sections.push({
      type: "matches",
      title: input.schemes && input.schemes.length > 0 ? "Matching incubators" : "Profile-based matches",
      items: input.incubators.slice(0, 6).map((i) => ({
        kind: "incubator" as const,
        id: i.id,
        name: i.name,
        location: i.location,
        focus: i.focusArea,
        whyItFits: i.reason,
        url: i.websiteUrl,
      })),
    });
  }

  if (input.eligibilityRows && input.eligibilityRows.length > 0) {
    sections.push({
      type: "eligibility",
      title: "Eligibility breakdown",
      rows: input.eligibilityRows.slice(0, 8).map((r) => ({ ...r })),
    });
  }

  if (input.evidenceChunks && input.evidenceChunks.length > 0) {
    sections.push({
      type: "evidence",
      title: "Supporting evidence",
      items: input.evidenceChunks.slice(0, 4).map((e) => ({ ...e })),
    });
  }

  if (input.steps && input.steps.length > 0) {
    sections.push({
      type: "steps",
      title: "Recommended next steps",
      items: input.steps.slice(0, 6).map((s, idx) => ({
        title: s.title,
        description: s.description,
        actionLabel: s.actionLabel || (idx === 0 ? "Open Action Plan" : undefined),
        actionRoute: s.actionRoute || (idx === 0 && aid ? withId("/deep-analysis/action-plan", aid) : undefined),
      })),
    });
  }

  return sections;
}

export function deriveRelated(input: SectionInput): ArovaRelatedEntity[] {
  const related: ArovaRelatedEntity[] = [];
  const aid = input.analysisId;
  for (const s of (input.schemes || []).slice(0, 4)) {
    related.push({ kind: "scheme", id: s.id, label: s.name, route: withId("/deep-analysis/schemes", aid) });
  }
  for (const i of (input.incubators || []).slice(0, 3)) {
    related.push({ kind: "incubator", id: i.id, label: i.name, route: withId("/deep-analysis/incubators", aid) });
  }
  for (const e of (input.evidenceChunks || []).slice(0, 3)) {
    if (e.documentId) {
      related.push({ kind: "document", id: e.documentId, label: e.documentName, route: withId("/deep-analysis/documents", aid) });
    }
  }
  if (aid) {
    related.push({ kind: "analysis", id: aid, label: "Current analysis", route: `/deep-analysis?id=${aid}` });
  }
  return related;
}
