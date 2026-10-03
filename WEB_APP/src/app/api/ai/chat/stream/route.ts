import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";
import { vectorStore } from "@/lib/vector/vector-store";
import Groq from "groq-sdk";
import { config } from "@/lib/config";
import { v4 as uuidv4 } from "uuid";
import { TavilyService } from "@/lib/services/tavily";
import { classifyIntent, needsWebSearch, buildWebSearchQuery, deriveFollowUps } from "@/lib/chat/intent";

const AROVA_VOICE = [
  "You are AROVA, a polished startup research assistant (original AROVA voice).",
  "Write conversationally and directly: answer the question first, no throat-clearing, no repeating the question.",
  "Keep the chat text SHORT (a few paragraphs + at most one compact list). Schemes, incubators, steps, and evidence render as UI cards — never dump giant Markdown tables.",
  "Name schemes/incubators ONLY from the provided context or web results. Never invent organizations, amounts, URLs, criteria, or evidence.",
  "Distinguish provenance: \"Your document X indicates …\" (user evidence) vs \"According to [Source] …\" (web/official).",
  "Cite web/official facts inline as [1], [2] matching the numbered WEB SEARCH RESULTS, and name the source in prose.",
  "Cite user documents as [Document name, Page N]. If evidence is missing, say what is missing and how to fix it. Say \"I don't have enough evidence to verify this yet\" rather than guessing.",
  "Today is 2026. Prefer the freshest official source when results conflict.",
].join("\n");

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return new Response("Unauthorized", { status: 401 });

    const startup = await db.getStartupByUserId(user.id);
    if (!startup) return new Response("Onboarding required", { status: 400 });

    const body = await req.json();
    const query: string = body.query || "";
    let conversationId: string | undefined = body.conversationId;
    const pageCtx = body.pageContext || {};

    if (!query.trim()) return new Response("Empty query", { status: 400 });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          if (!conversationId) {
            conversationId = `conv_${uuidv4().substring(0, 8)}`;
            await db.saveConversation({
              id: conversationId,
              userId: user.id,
              startupId: startup.id,
              title: query.length > 40 ? `${query.substring(0, 37)}...` : query,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
          sendEvent("metadata", { conversationId });

          await db.saveMessage({
            id: `msg_${uuidv4().substring(0, 8)}`,
            conversationId,
            userId: user.id,
            role: "user",
            content: query,
            createdAt: new Date().toISOString(),
          });

          // ── Intent + research plan (real states only, §9/§11) ──
          const intents = classifyIntent(query, pageCtx.pageName);
          const wantWeb = needsWebSearch(intents);
          sendEvent("status", { stage: "understanding", label: "Understanding your question" });

          const docs = await db.getDocumentsByStartupId(startup.id);
          const analyses = await db.getAnalysesByUserId(user.id);

          sendEvent("status", { stage: "retrieving", label: "Checking your documents" });
          const [docEvidence, govEvidence] = await Promise.all([
            vectorStore.search(
              query,
              {
                startupId: startup.id,
                userId: user.id,
                sourceType: "user_upload",
                ...(pageCtx.documentId ? { documentId: pageCtx.documentId } : {}),
              },
              6
            ).catch(() => []),
            vectorStore.search(query, { sourceType: "official_gazette" }, 4).catch(() => []),
          ]);

          // ── Web search (first-class, only real completions emitted) ──
          let webEvidence: Awaited<ReturnType<typeof TavilyService.searchWeb>>["results"] = [];
          let searchedWeb = false;
          let webError: string | null = null;
          if (wantWeb) {
            sendEvent("status", { stage: "searching", label: "Searching official government sources" });
            try {
              const s = startup as unknown as Record<string, string | undefined>;
              const enriched = buildWebSearchQuery(
                query,
                { industry: s.industry, state: s.state, city: s.city, stage: s.stage || s.startupStage, entityType: s.entityType || s.legalEntity },
                { selectedSchemeName: pageCtx.selectedSchemeName, pageName: pageCtx.pageName }
              );
              const res = await TavilyService.searchWeb(enriched, 6);
              webEvidence = res.results;
              searchedWeb = webEvidence.length > 0;
              if (searchedWeb) {
                sendEvent("status", {
                  stage: "sources_found",
                  label: `Found ${webEvidence.length} source${webEvidence.length === 1 ? "" : "s"}`,
                  sources: webEvidence.slice(0, 4).map((w) => ({ title: w.title, domain: w.domain })),
                });
              }
            } catch (e) {
              webError = e instanceof Error ? e.message : "Web search unavailable";
              console.warn("Stream Tavily failed:", webError);
            }
          }

          // ── Citations: only real retrieved items, never invented ──
          const citations: Record<string, unknown>[] = [
            ...docEvidence.slice(0, 4).map((r) => ({
              type: "document",
              title: r.chunk.fileName,
              ref: `Page ${r.chunk.pageNumber} · ${r.chunk.section}`,
              sourceName: r.chunk.fileName,
              documentId: r.chunk.documentId,
              page: r.chunk.pageNumber,
              section: r.chunk.section,
              snippet: r.chunk.content.slice(0, 160),
              relevance: r.score,
            })),
            ...govEvidence.slice(0, 3).map((r) => ({
              type: "official_source",
              title: r.chunk.fileName,
              ref: `Page ${r.chunk.pageNumber}`,
              sourceName: r.chunk.fileName,
              page: r.chunk.pageNumber,
              section: r.chunk.section,
              snippet: r.chunk.content.slice(0, 160),
              relevance: r.score,
            })),
            ...webEvidence.map((w) => ({
              type: w.sourceType === "official" || w.sourceType === "official_scheme" || w.sourceType === "gazette" ? "official_source" : "web",
              title: w.title,
              ref: w.domain || "Web source",
              url: w.url,
              domain: w.domain,
              snippet: (w.content || "").slice(0, 160),
              sourceName: w.title,
              sourceType: w.sourceType || "web",
              favicon: w.favicon,
              relevance: w.score,
            })),
          ];
          sendEvent("citations", citations);
          sendEvent("status", { stage: "analyzing", label: "Analyzing requirements" });

          // ── Grounded generation, streamed ──
          const webLines =
            webEvidence.length > 0
              ? webEvidence.map((w, i) => `[${i + 1}] ${w.title} (${w.url}): "${(w.content || "").slice(0, 500)}"`).join("\n")
              : wantWeb
                ? "(web search was attempted but returned no usable results)"
                : "(no web search needed for this question)";
          const systemMsg = [
            AROVA_VOICE,
            "",
            `STARTUP: ${(startup as { name?: string })?.name || "startup"} | ${(startup as { industry?: string })?.industry || "industry not provided"} | ${(startup as { state?: string })?.state || "location not provided"} | ${(startup as { stage?: string })?.stage || "stage not provided"}`,
            `DOCUMENTS: ${docs.map((d) => d.name).join(", ") || "(none uploaded)"}`,
            `DOC EVIDENCE:\n${docEvidence.map((r, i) => `[D${i + 1}] ${r.chunk.fileName} p${r.chunk.pageNumber}: "${r.chunk.content.slice(0, 400)}"`).join("\n") || "(none)"}`,
            `GOV EVIDENCE:\n${govEvidence.map((r, i) => `[G${i + 1}] ${r.chunk.fileName}: "${r.chunk.content.slice(0, 400)}"`).join("\n") || "(none)"}`,
            `WEB SEARCH RESULTS:\n${webLines}`,
            `PAGE: ${pageCtx.pageName || pageCtx.pathname || "unknown"}`,
          ].join("\n");

          const groq = new Groq({ apiKey: config.groq.apiKey });
          let fullReply = "";
          try {
            const responseStream = await groq.chat.completions.create({
              model: config.groq.model || "openai/gpt-oss-120b",
              messages: [
                { role: "system", content: systemMsg },
                { role: "user", content: query },
              ],
              stream: true,
              temperature: 0.3,
              max_tokens: 1500,
            });
            for await (const chunk of responseStream) {
              const token = chunk.choices[0]?.delta?.content || "";
              if (token) {
                fullReply += token;
                sendEvent("token", token);
              }
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : "AI service failed";
            throw new Error(msg);
          }

          if (!fullReply.trim()) throw new Error("Empty model response");

          // ── Structured cards from REAL records only ──
          let structured: Record<string, unknown> | null = null;
          try {
            const { deriveSections, deriveRelated } = await import("@/lib/chat/structured");
            const wantsSchemes = /scheme|fund|grant|eligible|eligibility|subsidy|loan|tax|policy|yojana/i.test(query);
            const wantsIncubators = /incubat|accelerator|\bhub\b|mentor/i.test(query) || (pageCtx.pageName || "").toLowerCase().includes("incubator");
            const sectionInput: {
              analysisId?: string;
              schemes?: { id: string; name: string; department?: string; maxBenefitDisplay?: string; officialSourceUrl?: string }[];
              incubators?: { id: string; name: string; location?: string; focusArea?: string; websiteUrl?: string; reason?: string }[];
              steps?: { title: string; description?: string; actionLabel?: string; actionRoute?: string }[];
              evidenceChunks?: { documentName: string; documentId?: string; page?: number; section?: string; excerpt?: string; status: string }[];
            } = { analysisId: pageCtx.analysisId };
            if (wantsSchemes) {
              const all = await db.getAllSchemes();
              sectionInput.schemes = all.slice(0, 5).map((s) => ({
                id: s.id, name: s.name, department: s.department,
                maxBenefitDisplay: s.maxBenefitDisplay, officialSourceUrl: s.officialSourceUrl,
              }));
            }
            if (wantsIncubators) {
              const allInc = await db.getAllIncubators();
              sectionInput.incubators = allInc.slice(0, 3).map((i) => ({
                id: i.id, name: i.name, location: i.location, focusArea: i.focusArea,
                websiteUrl: i.websiteUrl, reason: `Focus: ${i.focusArea}. Status: ${i.applicationStatus}.`,
              }));
            }
            const targetAnalysis = pageCtx.analysisId
              ? analyses.find((a) => a.id === pageCtx.analysisId)
              : analyses[0];
            if (targetAnalysis && /next|action|plan|gap|missing|todo|steps|eligible|block/i.test(query)) {
              const open = targetAnalysis.actionPlan.filter((a) => !a.completed);
              const src = open.length > 0 ? open : targetAnalysis.actionPlan;
              sectionInput.steps = src.slice(0, 6).map((a) => ({
                title: a.title,
                description: a.description,
                actionLabel: a.actionLabel,
                actionRoute: a.actionType === "upload"
                  ? `/deep-analysis/documents?id=${targetAnalysis.id}`
                  : `/deep-analysis/action-plan?id=${targetAnalysis.id}`,
              }));
              sectionInput.analysisId = targetAnalysis.id;
            }
            if (docEvidence.length > 0) {
              sectionInput.evidenceChunks = docEvidence.slice(0, 4).map((r) => ({
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
            const followUps = deriveFollowUps(intents, {
              hasAnalysis: !!targetAnalysis,
              hasScheme: !!pageCtx.selectedSchemeId,
            });
            if (sections.length > 0 || related.length > 0 || citations.length > 0) {
              structured = {
                message: "",
                sections,
                citations,
                actions: [],
                relatedEntities: related,
                evidence: sectionInput.evidenceChunks || [],
                followUps,
                webSearchUsed: searchedWeb,
                status: citations.length > 0 ? "grounded" : "needs_evidence",
              };
            }
          } catch (e) {
            console.warn("Stream structured derivation failed:", e instanceof Error ? e.message : e);
          }

          const messageId = `msg_${uuidv4().substring(0, 8)}`;
          await db.saveMessage({
            id: messageId,
            conversationId: conversationId as string,
            userId: user.id,
            role: "assistant",
            content: webError && !searchedWeb && wantWeb
              ? `${fullReply}\n\nNote: I couldn't access live web sources right now. This answer uses AROVA's available knowledge and your workspace.`
              : fullReply,
            citations: citations as never,
            structured: (structured || undefined) as never,
            createdAt: new Date().toISOString(),
          });

          if (structured) sendEvent("structured", structured);
          const followUps = (structured as { followUps?: string[] } | null)?.followUps;
          if (followUps?.length) sendEvent("followups", followUps);
          sendEvent("end", { messageId, webSearchUsed: searchedWeb, webError });
          controller.close();
        } catch (error: unknown) {
          sendEvent("error", { message: error instanceof Error ? error.message : "Streaming failed" });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
