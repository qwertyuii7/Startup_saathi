import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";
import { vectorStore } from "@/lib/vector/vector-store";
import Groq from "groq-sdk";
import { config } from "@/lib/config";
import { v4 as uuidv4 } from "uuid";

// Simple helper to stream events over SSE
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return new Response("Unauthorized", { status: 401 });

    const startup = await db.getStartupByUserId(user.id);
    if (!startup) return new Response("Onboarding required", { status: 400 });

    const body = await req.json();
    const query = body.query || "";
    let conversationId = body.conversationId;

    if (!query) return new Response("Empty query", { status: 400 });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // 1. Create or verify conversation
          if (!conversationId) {
            conversationId = `conv_${uuidv4().substring(0, 8)}`;
            await db.saveConversation({
              id: conversationId,
              userId: user.id,
              startupId: startup.id,
              title: query.substring(0, 37) + "...",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
          sendEvent("metadata", { conversationId });

          // 2. Save User Message
          await db.saveMessage({
            id: `msg_${uuidv4().substring(0, 8)}`,
            conversationId,
            userId: user.id,
            role: "user",
            content: query,
            createdAt: new Date().toISOString(),
          });

          // 3. Gather Context
          const [docs, analyses] = await Promise.all([
            db.getDocumentsByStartupId(startup.id),
            db.getAnalysesByUserId(user.id),
          ]);
          
          const docInventory = docs.map(d => `- ${d.name} [${d.type}]`).join("\n") || "No documents";
          
          // Basic retrieval
          const docEvidence = await vectorStore.search(query, { startupId: startup.id, userId: user.id, sourceType: "user_upload" }, 6);
          const govEvidence = await vectorStore.search(query, { sourceType: "official_gazette" }, 4);

          const pageCtx = body.pageContext || {};
          const pageLine = `Current page: ${pageCtx.pageName || pageCtx.pathname || "unknown"}`;
          
          const { ContextBuilder } = await import("@/lib/agents/context-builder");
          const contextBuilder = new ContextBuilder();
          contextBuilder
            .setStartupProfile(startup)
            .setDocumentInventory(docs)
            .setDocumentChunks(docEvidence)
            .setGovernmentKnowledge(govEvidence)
            .setPageContext(pageLine);
            
          const systemMsg = contextBuilder.build();

          // 4. Send Citations Early
          const citations = [
            ...docEvidence.slice(0, 4).map(r => ({ type: "document" as const, title: r.chunk.fileName, ref: `Page ${r.chunk.pageNumber}` })),
            ...govEvidence.slice(0, 3).map(r => ({ type: "official_source" as const, title: r.chunk.fileName, ref: `Page ${r.chunk.pageNumber}` }))
          ];
          sendEvent("citations", citations);

          // 5. Generate and Stream
          const groq = new Groq({ apiKey: config.groq.apiKey });
          const responseStream = await groq.chat.completions.create({
            model: config.groq.model || "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: systemMsg },
              { role: "user", content: query }
            ],
            stream: true,
            temperature: 0.2
          });

          let fullReply = "";
          for await (const chunk of responseStream) {
            const token = chunk.choices[0]?.delta?.content || "";
            fullReply += token;
            if (token) {
              sendEvent("token", token);
            }
          }

          // 6. Save Assistant Message
          const messageId = `msg_${uuidv4().substring(0, 8)}`;
          await db.saveMessage({
            id: messageId,
            conversationId,
            userId: user.id,
            role: "assistant",
            content: fullReply,
            citations,
            createdAt: new Date().toISOString(),
          });
          
          sendEvent("end", { messageId });
          controller.close();
        } catch (error: any) {
          sendEvent("error", { message: error.message || "Streaming failed" });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
