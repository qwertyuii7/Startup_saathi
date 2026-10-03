import { StateGraph, END, START } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ArovaChatState, RetrievalPlan, ScoredChunk } from "./state";
import { db } from "../../db/store";
import { vectorStore } from "../../vector/vector-store";
import { GroqService } from "../../ai/groq";

const DOC_TOP_K = 6;
const GOV_TOP_K = 4;

function orMissing(v: unknown): string {
  return v === undefined || v === null || v === "" ? "not provided" : String(v);
}

// ── Node 1: load authenticated workspace (profile, doc inventory, history) ──
async function loadWorkspace(state: ArovaChatState): Promise<Partial<ArovaChatState>> {
  const [user, startup, convs] = await Promise.all([
    db.getUserById(state.userId),
    db.getStartupById(state.startupId).then((s) => s || db.getStartupByUserId(state.userId)),
    state.conversationId ? db.getMessagesByConversation(state.conversationId) : Promise.resolve([]),
  ]);

  const profileSnapshot = [
    `Founder: ${orMissing(startup?.founderName || user?.name)} (${orMissing(startup?.founderRole)})`,
    `Contact: ${orMissing(startup?.founderEmail || user?.email)}${startup?.founderPhone ? `, ${startup.founderPhone}` : ""}`,
    `Startup: ${orMissing(startup?.name || startup?.startupName)} — ${orMissing(startup?.description || startup?.summary)}`,
    `Industry: ${orMissing(startup?.industry)} | Stage: ${orMissing(startup?.stage || startup?.startupStage)}`,
    `Location: ${[startup?.city, startup?.state].filter(Boolean).join(", ") || "not provided"}`,
    `Legal: ${orMissing(startup?.entityType || startup?.legalEntity)} | Incorporated: ${orMissing(startup?.incorporationDate || startup?.foundedDate)}`,
    `DPIIT: ${startup?.dpiitStatus === true ? `Recognized${startup.dpiitNumber || startup.dpiitRecognitionNumber ? ` (${startup.dpiitNumber || startup.dpiitRecognitionNumber})` : ""}` : startup?.dpiitStatus === false ? "Not recognized" : String(startup?.dpiitStatus || "not provided")}`,
    `Turnover: ${typeof startup?.annualTurnover === "number" ? `₹${startup.annualTurnover.toLocaleString("en-IN")}` : orMissing(startup?.turnoverDisplay)} | Funding: ${orMissing(startup?.fundingStatus || startup?.fundingStage)}`,
  ].join("\n");

  const docs = startup ? await db.getDocumentsByStartupId(startup.id) : [];
  const docInventory =
    docs.length === 0
      ? "(no documents uploaded yet)"
      : docs
          .map(
            (d) =>
              `- ${d.name} [${d.type}] — ${d.pageCount} pages, ${d.chunksCount} chunks, status: ${d.status}${d.isVerified ? ", key terms detected" : ""}`
          )
          .join("\n");

  const historyText =
    convs.length === 0
      ? "(no prior messages)"
      : convs
          .slice(-8)
          .map((m) => `${m.role === "user" ? "Founder" : "AROVA"}: ${m.content.slice(0, 600)}`)
          .join("\n");

  return { profileSnapshot, docInventory, historyText };
}

// ── Node 2: plan what to retrieve (Groq JSON, deterministic fallback) ──
async function planRetrieval(state: ArovaChatState): Promise<Partial<ArovaChatState>> {
  const fallback: RetrievalPlan = {
    intents: ["general"],
    needsDocs: true,
    needsGov: true,
    needsSchemes: false,
    needsAnalysis: false,
    docQuery: state.query,
    govQuery: state.query,
  };
  try {
    const plan = await GroqService.generateJSON<RetrievalPlan>(
      [
        {
          role: "system",
          content:
            "You are a retrieval planner for a startup scheme assistant. Classify the founder's question and decide which knowledge sources are needed.",
        },
        {
          role: "user",
          content: `Question: "${state.query}"\nCurrent page: ${state.pageContext.pageName || state.pageContext.pathname || "unknown"}\nSelected scheme: ${state.pageContext.selectedSchemeName || state.selectedSchemeId || "none"}`,
        },
      ],
      `{
        "intents": ["documents" | "profile" | "schemes" | "eligibility" | "analysis" | "general"],
        "needsDocs": "boolean",
        "needsGov": "boolean",
        "needsSchemes": "boolean",
        "needsAnalysis": "boolean",
        "docTarget": "string (document filename hint from the question, or empty)",
        "schemeHint": "string (scheme name hint from the question, or empty)",
        "docQuery": "string (keyword-rich retrieval query for startup documents)",
        "govQuery": "string (keyword-rich retrieval query for government scheme rules)"
      }`
    );
    if (!plan || !Array.isArray(plan.intents)) return { plan: fallback };
    return {
      plan: {
        intents: plan.intents,
        needsDocs: !!plan.needsDocs,
        needsGov: !!plan.needsGov,
        needsSchemes: !!plan.needsSchemes,
        needsAnalysis: !!plan.needsAnalysis,
        docTarget: plan.docTarget || undefined,
        schemeHint: plan.schemeHint || undefined,
        docQuery: plan.docQuery || state.query,
        govQuery: plan.govQuery || state.query,
      },
    };
  } catch {
    return { plan: fallback };
  }
}

// ── Node 3: retrieve (user docs scoped, gov knowledge, schemes, analyses) ──
async function retrieve(state: ArovaChatState): Promise<Partial<ArovaChatState>> {
  const plan = state.plan;
  const tasks: Promise<unknown>[] = [];
  let docEvidence: ScoredChunk[] = [];
  let govEvidence: ScoredChunk[] = [];
  let schemeContext = "";
  let analysisContext = "";

  if (!plan || plan.needsDocs) {
    tasks.push(
      (async () => {
        const q = plan?.docQuery || state.query;
        const filter: { startupId: string; userId: string; sourceType: "user_upload"; documentId?: string } = {
          startupId: state.startupId,
          userId: state.userId,
          sourceType: "user_upload",
        };
        // If the question names a document, scope retrieval to it.
        if (plan?.docTarget) {
          const docs = await db.getDocumentsByStartupId(state.startupId);
          const match = docs.find((d) => d.name.toLowerCase().includes(plan.docTarget!.toLowerCase().slice(0, 20)));
          if (match) filter.documentId = match.id;
        }
        if (state.pageContext.documentId) filter.documentId = state.pageContext.documentId;
        docEvidence = await vectorStore.search(q, filter, DOC_TOP_K);
      })()
    );
  }

  if (!plan || plan.needsGov) {
    tasks.push(
      (async () => {
        govEvidence = await vectorStore.search(plan?.govQuery || state.query, { sourceType: "official_gazette" }, GOV_TOP_K);
      })()
    );
  }

  const schemeId =
    state.selectedSchemeId || state.pageContext.selectedSchemeId || undefined;
  if (schemeId || plan?.needsSchemes || plan?.schemeHint) {
    tasks.push(
      (async () => {
        if (schemeId) {
          const s = await db.getSchemeById(schemeId);
          if (s) {
            schemeContext = [
              `Selected scheme: ${s.name} (${s.maxBenefitDisplay})`,
              `Department: ${s.department} | Level: ${s.governmentLevel}${s.state ? `, ${s.state}` : ""}`,
              `Guidelines: ${s.guidelineClause} — ${s.officialSourceTitle} (${s.officialSourceUrl})`,
              `Requirements:`,
              ...s.requirements.map((r) => `  - ${r.description} [${r.sourceCitation.clause}]`),
            ].join("\n");
            return;
          }
        }
        const all = await db.getAllSchemes();
        const hint = (plan?.schemeHint || "").toLowerCase();
        const relevant = hint
          ? all.filter((s) => s.name.toLowerCase().includes(hint.slice(0, 15)) || hint.includes(s.slug.split("-")[0]))
          : all.slice(0, 5);
        schemeContext =
          relevant.length === 0
            ? ""
            : ["Relevant schemes in catalog:", ...relevant.map((s) => `- ${s.name} (${s.maxBenefitDisplay}) — ${s.department}`)].join("\n");
      })()
    );
  }

  if (state.pageContext.analysisId || plan?.needsAnalysis) {
    tasks.push(
      (async () => {
        const analyses = await db.getAnalysesByUserId(state.userId);
        const target = state.pageContext.analysisId
          ? analyses.find((a) => a.id === state.pageContext.analysisId)
          : analyses[0];
        if (!target) {
          analysisContext = "(no analyses run yet)";
          return;
        }
        analysisContext = [
          `Analysis: "${target.title}" (${target.status}, ${new Date(target.createdAt).toLocaleDateString("en-IN")})`,
          `Schemes analyzed: ${target.schemesAnalyzedCount} | Eligible: ${target.eligibleCount} | Potential: ${target.potentialCount} | Missing: ${target.missingCount} | Not eligible: ${target.notEligibleCount}`,
          ...target.findings.slice(0, 6).map(
            (f) => `- ${f.schemeName}: ${f.fitLabel} (${f.criteriaMetCount}/${f.totalCriteriaCount})`
          ),
          target.actionPlan.length > 0
            ? `Open action items: ${target.actionPlan.filter((a) => !a.completed).length}/${target.actionPlan.length}`
            : "No action items",
        ].join("\n");
      })()
    );
  }

  await Promise.all(tasks);
  return { docEvidence, govEvidence, schemeContext, analysisContext };
}

// ── Node 4: generate grounded reply (Groq via LangChain messages) ──
async function generate(state: ArovaChatState): Promise<Partial<ArovaChatState>> {
  const docLines = state.docEvidence.map(
    (r, i) =>
      `[D${i + 1}] ${r.chunk.fileName} — Page ${r.chunk.pageNumber} (${r.chunk.section}): "${r.chunk.content.slice(0, 500)}" [docId=${r.chunk.documentId}, relevance=${r.score.toFixed(2)}]`
  );
  const govLines = state.govEvidence.map(
    (r, i) => `[G${i + 1}] ${r.chunk.fileName} — Page ${r.chunk.pageNumber} (${r.chunk.section}): "${r.chunk.content.slice(0, 500)}"`
  );

  const pageCtx = state.pageContext;
  const pageLine = `Current page: ${pageCtx.pageName || pageCtx.pathname || "unknown"}${pageCtx.pageDescription ? ` — ${pageCtx.pageDescription}` : ""}`;

  const system = new SystemMessage(
    [
      "You are AROVA, a context-aware startup scheme intelligence assistant.",
      "Answer ONLY from the workspace context below. Distinguish verified facts (startup documents), statutory rules (official gazettes), profile data, and your own interpretation.",
      "RULES:",
      "1. NEVER invent certificate numbers, dates, financial figures, document names, page numbers, or scheme requirements.",
      "2. If evidence is missing, say exactly what is missing and how to resolve it (which document to upload or profile field to fill).",
      "3. Cite evidence inline like [DPIIT Certificate.pdf, Page 2] or [SISFS Guidelines, Clause 3.1].",
      "4. For 'what documents have I uploaded' questions, list ONLY the DOCUMENT INVENTORY below.",
      "5. Keep answers concise, professional, and actionable.",
      "",
      "=== STARTUP PROFILE ===",
      state.profileSnapshot,
      "",
      "=== DOCUMENT INVENTORY (complete list of this startup's uploads) ===",
      state.docInventory,
      "",
      "=== RETRIEVED DOCUMENT EVIDENCE ===",
      docLines.length > 0 ? docLines.join("\n") : "(no document chunks retrieved)",
      "",
      "=== RETRIEVED OFFICIAL RULES ===",
      govLines.length > 0 ? govLines.join("\n") : "(no official clauses retrieved)",
      state.schemeContext ? `\n=== SCHEME CONTEXT ===\n${state.schemeContext}\n` : "",
      state.analysisContext ? `\n=== ANALYSIS CONTEXT ===\n${state.analysisContext}\n` : "",
      `\n=== PAGE CONTEXT ===\n${pageLine}`,
      "",
      "=== RECENT CONVERSATION ===",
      state.historyText,
    ].join("\n")
  );
  const human = new HumanMessage(state.query);

  let reply = "";
  try {
    reply = await GroqService.chat(
      [
        { role: "system", content: system.content as string },
        { role: "user", content: human.content as string },
      ],
      { temperature: 0.2, maxTokens: 1500 }
    );
  } catch (e: unknown) {
    return { errors: [...state.errors, e instanceof Error ? e.message : "generation failed"] };
  }
  if (!reply.trim()) {
    return { errors: [...state.errors, "empty model response"] };
  }

  const citations: ArovaChatState["citations"] = [];
  for (const r of state.docEvidence.slice(0, 4)) {
    citations.push({
      type: "document",
      title: r.chunk.fileName,
      ref: `Page ${r.chunk.pageNumber} · ${r.chunk.section}`,
    });
  }
  for (const r of state.govEvidence.slice(0, 3)) {
    citations.push({
      type: "official_source",
      title: r.chunk.fileName,
      ref: `Page ${r.chunk.pageNumber}`,
    });
  }

  return { reply: reply.trim(), citations };
}

export function buildArovaChatGraph() {
  const builder = new StateGraph<ArovaChatState>({
    channels: {
      userId: { value: (x, y) => y ?? x, default: () => "" },
      startupId: { value: (x, y) => y ?? x, default: () => "" },
      query: { value: (x, y) => y ?? x, default: () => "" },
      conversationId: { value: (x, y) => y ?? x },
      selectedSchemeId: { value: (x, y) => y ?? x },
      pageContext: { value: (x, y) => y ?? x, default: () => ({}) },
      profileSnapshot: { value: (x, y) => y ?? x, default: () => "" },
      docInventory: { value: (x, y) => y ?? x, default: () => "" },
      historyText: { value: (x, y) => y ?? x, default: () => "" },
      plan: { value: (x, y) => y ?? x, default: () => null },
      docEvidence: { value: (x, y) => y ?? x, default: () => [] },
      govEvidence: { value: (x, y) => y ?? x, default: () => [] },
      schemeContext: { value: (x, y) => y ?? x, default: () => "" },
      analysisContext: { value: (x, y) => y ?? x, default: () => "" },
      reply: { value: (x, y) => y ?? x, default: () => "" },
      citations: { value: (x, y) => y ?? x, default: () => [] },
      errors: { value: (x, y) => (x || []).concat(y || []), default: () => [] },
    },
  });

  builder.addNode("loadWorkspace", loadWorkspace);
  builder.addNode("planRetrieval", planRetrieval);
  builder.addNode("retrieve", retrieve);
  builder.addNode("generate", generate);

  const b = builder as unknown as {
    addEdge: (a: unknown, c: unknown) => void;
  };
  b.addEdge(START, "loadWorkspace");
  b.addEdge("loadWorkspace", "planRetrieval");
  b.addEdge("planRetrieval", "retrieve");
  b.addEdge("retrieve", "generate");
  b.addEdge("generate", END);

  return builder.compile();
}

export const arovaChatAgent = buildArovaChatGraph();
