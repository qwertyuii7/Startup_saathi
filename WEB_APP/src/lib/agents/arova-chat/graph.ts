import { StateGraph, END, START } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ArovaChatState, RetrievalPlan, ScoredChunk } from "./state";
import { db } from "../../db/store";
import { vectorStore } from "../../vector/vector-store";
import { GroqService } from "../../ai/groq";
import { TavilyService, TavilySearchResult } from "../../services/tavily";
import { deriveSections, deriveRelated, type SectionInput } from "../../chat/structured";

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

// ── Node 2: plan what to retrieve (explicit intent + Groq refinement) ──
async function planRetrieval(state: ArovaChatState): Promise<Partial<ArovaChatState>> {
  const { classifyIntent, needsWebSearch } = await import("../../chat/intent");
  const fineIntents = classifyIntent(state.query, state.pageContext.pageName);
  const heuristicWeb = needsWebSearch(fineIntents);
  const fallback: RetrievalPlan = {
    intents: ["general"],
    fineIntents,
    needsDocs: true,
    needsGov: /scheme|eligib|fund|grant|policy|requirement|criteria|document/i.test(state.query),
    needsSchemes: /scheme|fund|grant|eligible|eligibility|subsidy|loan|tax|policy|yojana/i.test(state.query),
    needsAnalysis: !!state.pageContext.analysisId || /analysis|eligible|missing|action|plan|why/i.test(state.query),
    needsWebSearch: heuristicWeb,
    docQuery: state.query,
    govQuery: state.query,
    webSearchQuery: state.query,
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
        "needsWebSearch": "boolean (true if question asks for current rules, latest schemes, recent updates, or general web info not in docs)",
        "docTarget": "string (document filename hint from the question, or empty)",
        "schemeHint": "string (scheme name hint from the question, or empty)",
        "docQuery": "string (keyword-rich retrieval query for startup documents)",
        "govQuery": "string (keyword-rich retrieval query for government scheme rules)",
        "webSearchQuery": "string (search engine query if web search is needed)"
      }`
    );
    if (!plan || !Array.isArray(plan.intents)) return { plan: fallback };
    // Heuristic web-search need always wins: "latest/current/recent" must hit the web.
    const webNeed = !!plan.needsWebSearch || heuristicWeb;
    return {
      plan: {
        intents: plan.intents,
        fineIntents,
        needsDocs: !!plan.needsDocs,
        needsGov: !!plan.needsGov,
        needsSchemes: !!plan.needsSchemes,
        needsAnalysis: !!plan.needsAnalysis,
        needsWebSearch: webNeed,
        docTarget: plan.docTarget || undefined,
        schemeHint: plan.schemeHint || undefined,
        docQuery: plan.docQuery || state.query,
        govQuery: plan.govQuery || state.query,
        webSearchQuery: plan.webSearchQuery || state.query,
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
  let webEvidence: TavilySearchResult[] = [];
  let schemeContext = "";
  let analysisContext = "";
  let searchedWeb = false;

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

  if (plan?.needsWebSearch) {
    tasks.push(
      (async () => {
        try {
          const { buildWebSearchQuery } = await import("../../chat/intent");
          let enriched = plan.webSearchQuery || state.query;
          try {
            const startup = await db.getStartupById(state.startupId).then((s) => s || db.getStartupByUserId(state.userId));
            enriched = buildWebSearchQuery(state.query, {
              industry: (startup as { industry?: string })?.industry,
              state: (startup as { state?: string })?.state,
              city: (startup as { city?: string })?.city,
              stage: (startup as { stage?: string; startupStage?: string })?.stage || (startup as { startupStage?: string })?.startupStage,
              entityType: (startup as { entityType?: string; legalEntity?: string })?.entityType || (startup as { legalEntity?: string })?.legalEntity,
            }, { selectedSchemeName: state.pageContext.selectedSchemeName, pageName: state.pageContext.pageName });
          } catch { /* fall back to planner query */ }
          const res = await TavilyService.searchWeb(enriched, 6);
          webEvidence = res.results;
          searchedWeb = webEvidence.length > 0;
        } catch (e) {
          console.warn("Tavily search failed, continuing without web context:", e);
        }
      })()
    );
  }

  await Promise.all(tasks);
  return { docEvidence, govEvidence, webEvidence, schemeContext, analysisContext, searchedWeb };
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
      "You are AROVA, a polished startup research assistant (original AROVA voice — not ChatGPT, not Perplexity).",
      "Write like a smart analyst explaining results to a founder: conversational, direct, decision-oriented.",
      "",
      "ANSWER SHAPE (decide dynamically, do not force a template):",
      "- Simple question → short answer in 2-4 sentences.",
      "- Research question → Key takeaway first, then short sections with findings, then what to do next.",
      "- Eligibility question → requirement-by-requirement analysis, each tied to evidence or a stated gap.",
      "- Document question → answer from the founder's uploads; name the document and page.",
      "- Current-information question → answer from WEB SEARCH RESULTS; every factual claim needs an inline citation.",
      "Keep the reply SHORT in the chat text itself (a few paragraphs + at most one compact list). Detailed schemes, incubators, eligibility rows, evidence, and steps are rendered as UI cards from verified records — do NOT dump giant Markdown tables.",
      "",
      "VOICE RULES:",
      "1. Answer the actual question first. No throat-clearing intro, no repeating the user's question.",
      "2. Natural paragraphs. Bullets only when they help. Headings only when the answer is long.",
      "3. Name schemes/incubators ONLY from SCHEME CONTEXT, ANALYSIS CONTEXT, or WEB SEARCH RESULTS. Never invent organizations, amounts, URLs, criteria, or evidence.",
      "4. If evidence is missing, say exactly what is missing and how to fix it (which document to upload or profile field to fill). Say \"I don't have enough evidence to verify this yet\" rather than guessing.",
      "5. Distinguish provenance in prose: \"Your document X indicates …\" (user evidence) vs \"According to [Source] …\" (web/official). Never mix them silently.",
      "6. Uncertainty: mark it plainly (\"appears relevant\", \"may be worth checking\", \"verify current requirements before applying\").",
      "7. Inline citations: cite web/official facts as [1], [2] matching the numbered WEB SEARCH RESULTS below, AND name the source in prose (\"According to Startup India [1] …\"). Cite user documents as [Document name, Page N].",
      "8. Current date awareness: today is 2026. Prefer the freshest official source when results conflict, and note recency.",
      "",
      "EVIDENCE DISCIPLINE:",
      "- NEVER invent certificate numbers, dates, financial figures, document names, page numbers, scheme requirements, or URLs.",
      "- Never claim a source says something unless the retrieved snippet supports it.",
      "- Official sources outrank blogs. For scheme questions prefer startupindia.gov.in, dpiit.gov.in, gov.in / nic.in, gazettes/PDFs, then incubator/university pages.",
      "- If web search was performed but returned nothing useful, say: \"I couldn't access live web sources right now. Here's what I can determine from AROVA's available knowledge and your workspace.\"",
      "",
      "EXAMPLE TONE (do not copy content, match the feel):",
      "\"Based on your startup profile, I found several incubators that appear relevant. Your strongest matches are in Uttar Pradesh, particularly programs focused on technology-driven and early-stage startups. … It may be worth checking the current eligibility requirements before applying.\"",
      "",
      "=== STARTUP PROFILE ===",
      state.profileSnapshot,
      "",
      "=== DOCUMENT INVENTORY (complete list of this startup's uploads) ===",
      state.docInventory,
      "",
      "=== RETRIEVED DOCUMENT EVIDENCE (USER evidence — cite as [name, Page N]) ===",
      docLines.length > 0 ? docLines.join("\n") : "(no document chunks retrieved)",
      "",
      "=== RETRIEVED OFFICIAL RULES (stored knowledge — may be stale, prefer web for current info) ===",
      govLines.length > 0 ? govLines.join("\n") : "(no official clauses retrieved)",
      "",
      "=== WEB SEARCH RESULTS (cite as [1], [2] … only URLs listed here exist — never invent others) ===",
      state.webEvidence?.length > 0
        ? state.webEvidence
            .map((w, i) => `[${i + 1}] ${w.title} (${w.url}): "${w.content.slice(0, 500)}"`)
            .join("\n")
        : "(no web search performed/results)",
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
      sourceName: r.chunk.fileName,
      documentId: r.chunk.documentId,
      page: r.chunk.pageNumber,
      section: r.chunk.section,
      snippet: r.chunk.content.slice(0, 160),
      relevance: r.score,
    });
  }
  for (const r of state.govEvidence.slice(0, 3)) {
    citations.push({
      type: "official_source",
      title: r.chunk.fileName,
      ref: `Page ${r.chunk.pageNumber}`,
      sourceName: r.chunk.fileName,
      page: r.chunk.pageNumber,
      section: r.chunk.section,
      snippet: r.chunk.content.slice(0, 160),
      relevance: r.score,
    });
  }
  if (state.webEvidence && state.webEvidence.length > 0) {
    for (const w of state.webEvidence) {
      const domain = w.domain || (() => { try { return new URL(w.url).hostname; } catch { return ""; } })();
      citations.push({
        type: w.sourceType === "official" || w.sourceType === "official_scheme" || w.sourceType === "gazette" ? "official_source" : "web",
        title: w.title,
        ref: domain || "Web source",
        url: w.url,
        domain,
        snippet: w.content.slice(0, 160),
        sourceName: w.title,
        sourceType: w.sourceType || "web",
        favicon: w.favicon,
        relevance: w.score,
      });
    }
  }

  // Structured sections from REAL retrieval state (never model-invented).
  const sectionInput: SectionInput = {
    analysisId: state.pageContext.analysisId,
  };
  try {
    const intents = state.plan?.intents || [];
    const wantsSchemes = !!state.plan?.needsSchemes || intents.includes("schemes") || intents.includes("eligibility");
    const wantsIncubators = /incubat|accelerator|\bhub\b|mentor/i.test(state.query) ||
      (state.pageContext.pageName || "").toLowerCase().includes("incubator");
    const wantsAnalysis = !!state.plan?.needsAnalysis || !!state.pageContext.analysisId ||
      intents.includes("analysis") || intents.includes("eligibility");

    if (wantsSchemes || state.selectedSchemeId || state.pageContext.selectedSchemeId) {
      const sid = state.selectedSchemeId || state.pageContext.selectedSchemeId;
      if (sid) {
        const s = await db.getSchemeById(sid);
        if (s) {
          sectionInput.schemes = [{
            id: s.id, name: s.name, department: s.department,
            maxBenefitDisplay: s.maxBenefitDisplay, officialSourceUrl: s.officialSourceUrl,
            reason: `${s.governmentLevel} scheme via ${s.department}.`,
          }];
        }
      } else {
        const all = await db.getAllSchemes();
        const hint = (state.plan?.schemeHint || "").toLowerCase();
        const relevant = hint
          ? all.filter((s) => s.name.toLowerCase().includes(hint.slice(0, 15)))
          : all;
        sectionInput.schemes = relevant.slice(0, 5).map((s) => ({
          id: s.id, name: s.name, department: s.department,
          maxBenefitDisplay: s.maxBenefitDisplay, officialSourceUrl: s.officialSourceUrl,
        }));
      }
    }

    if (wantsIncubators) {
      const allInc = await db.getAllIncubators();
      sectionInput.incubators = allInc.slice(0, 3).map((i) => ({
        id: i.id, name: i.name, location: i.location, focusArea: i.focusArea,
        websiteUrl: i.websiteUrl,
        reason: `Focus: ${i.focusArea}. Status: ${i.applicationStatus}.`,
      }));
    }

    if (wantsAnalysis) {
      const analyses = await db.getAnalysesByUserId(state.userId);
      const target = state.pageContext.analysisId
        ? analyses.find((a) => a.id === state.pageContext.analysisId)
        : analyses[0];
      if (target) {
        const wantsEligibility = intents.includes("eligibility") || intents.includes("schemes") ||
          /eligib|qualif|requirement|criteria|satisf|reject|approv|evidence|missing|gap|document/i.test(state.query) ||
          (state.pageContext.pageName || "").toLowerCase().includes("eligib") ||
          (state.pageContext.pageName || "").toLowerCase().includes("evidence") ||
          (state.pageContext.pageName || "").toLowerCase().includes("requirement");
        const sid = state.selectedSchemeId || state.pageContext.selectedSchemeId;
        const findings = sid ? target.findings.filter((f) => f.schemeId === sid) : target.findings.slice(0, 2);
        const rows = findings.flatMap((f) =>
          f.criteriaBreakdown.map((c) => ({
            requirementId: c.requirementId,
            requirement: c.requirement,
            status: c.status,
            statusLabel: c.statusLabel,
            evidence: c.evidenceDocumentName
              ? `${c.evidenceDocumentName}${c.evidencePage ? ` — Page ${c.evidencePage}` : ""}`
              : undefined,
            source: `${c.sourceCitation.title} (${c.sourceCitation.clause})`,
            explanation: c.aiReasoning,
            schemeId: f.schemeId,
            schemeName: f.schemeName,
          }))
        );
        if (wantsEligibility && rows.length > 0) sectionInput.eligibilityRows = rows;
        const open = target.actionPlan.filter((a) => !a.completed);
        const stepsSource = open.length > 0 ? open : target.actionPlan;
        if (stepsSource.length > 0) {
          sectionInput.steps = stepsSource.slice(0, 6).map((a) => ({
            title: a.title,
            description: a.description,
            actionLabel: a.actionLabel,
            actionRoute: a.actionType === "upload"
              ? `/deep-analysis/documents?id=${target.id}`
              : a.actionType === "profile"
                ? `/deep-analysis/profile?id=${target.id}`
                : a.actionType === "incubator"
                  ? `/deep-analysis/incubators?id=${target.id}`
                  : `/deep-analysis/action-plan?id=${target.id}`,
          }));
        }
      }
    }
  } catch (e) {
    console.warn("Structured section derivation failed, continuing with reply only:", e);
  }

  if (state.docEvidence.length > 0) {
    sectionInput.evidenceChunks = state.docEvidence.slice(0, 4).map((r) => ({
      documentName: r.chunk.fileName,
      documentId: r.chunk.documentId,
      page: r.chunk.pageNumber,
      section: r.chunk.section,
      excerpt: r.chunk.content.slice(0, 300),
      status: r.score >= 0.6 ? "SUPPORTED" : "PARTIALLY_SUPPORTED",
    }));
  }

  const sections = deriveSections(sectionInput);
  const related = deriveRelated(sectionInput);
  const { deriveFollowUps, classifyIntent } = await import("../../chat/intent");
  const fine = state.plan?.fineIntents || classifyIntent(state.query, state.pageContext.pageName);
  const followUps = deriveFollowUps(fine as never, {
    hasAnalysis: !!state.pageContext.analysisId || !!state.analysisContext,
    hasScheme: !!state.selectedSchemeId || !!state.pageContext.selectedSchemeId,
  });
  const structured = {
    message: reply.trim(),
    sections,
    citations,
    actions: [],
    relatedEntities: related,
    evidence: sectionInput.evidenceChunks || [],
    followUps,
    webSearchUsed: !!state.searchedWeb,
    status: (citations.length > 0 ? "grounded" : "needs_evidence") as "grounded" | "needs_evidence",
  };

  return { reply: reply.trim(), structured, citations };
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
      webEvidence: { value: (x, y) => y ?? x, default: () => [] },
      searchedWeb: { value: (x, y) => y ?? x, default: () => false },
      schemeContext: { value: (x, y) => y ?? x, default: () => "" },
      analysisContext: { value: (x, y) => y ?? x, default: () => "" },
      reply: { value: (x, y) => y ?? x, default: () => "" },
      structured: { value: (x, y) => y ?? x, default: () => null },
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
