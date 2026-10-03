"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Sparkles, Send, X, Loader2, CornerDownLeft } from "lucide-react";
import { api } from "@/lib/api-client";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { buildPageContext } from "@/lib/chat-page-context";
import { ArovaMessage } from "@/components/arova/ArovaMessage";
import { ResearchStatus, type ResearchState } from "@/components/arova/citations";
import type { ArovaStructured, ArovaAction, ArovaRelatedEntity, ArovaCitation } from "@/lib/chat/structured";
import { parseStructured } from "@/lib/chat/structured";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: ArovaCitation[];
  structured?: ArovaStructured | null;
  actions?: ArovaAction[];
  related?: ArovaRelatedEntity[];
  followUps?: string[];
  research?: ResearchState | null;
  streaming?: boolean;
  isError?: boolean;
}

export function ArovaChatPanel({ onClose }: { onClose?: () => void }) {
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { analysis } = useWorkspaceAnalysis();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchHistory = async (cid: string) => {
      try {
        const res = await api.chat.getHistory(cid);
        if (res.success && res.messages && res.messages.length > 0) {
          setMessages(res.messages.map((m: { id: string; role: string; content: string; citations?: ArovaCitation[]; structured?: ArovaStructured | null }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            citations: m.citations,
            structured: m.structured || null,
          })));
          return true;
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
      return false;
    };

    const init = async () => {
      let loaded = false;
      const storedCid = typeof window !== "undefined" ? localStorage.getItem("arova_conversation_id") : null;
      if (storedCid) {
        setConversationId(storedCid);
        loaded = await fetchHistory(storedCid);
      }

      if (!loaded && messages.length === 0) {
        let pageContext = "your startup analysis";
        if (pathname.includes("/eligibility")) pageContext = "your eligibility results";
        else if (pathname.includes("/evidence")) pageContext = "your mapped evidence";
        else if (pathname.includes("/action-plan")) pageContext = "your action plan";
        else if (pathname.includes("/requirements")) pageContext = "scheme requirements";

        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: `I'm analyzing ${pageContext}. I can explain your blockers, evidence coverage, scheme matches, or check the latest official updates.`,
          }
        ]);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (conversationId && typeof window !== "undefined") {
      localStorage.setItem("arova_conversation_id", conversationId);
    }
  }, [conversationId]);

  const patchMessage = (id: string, patch: Partial<Message>) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isTyping) return;

    const assistantMessageId = `a_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: `u_${Date.now()}`, role: "user", content: q },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        streaming: true,
        research: { stage: "understanding", label: "Understanding your question" },
      },
    ]);
    setInputQuery("");
    setIsTyping(true);

    try {
      const pageContext = buildPageContext(pathname, {
        analysisId: analysis?.id || searchParams.get("id") || undefined,
      });

      let streamContent = "";
      await api.chat.stream(q, {
        conversationId,
        pageContext,
        onEvent: (event, data) => {
          if (event === "metadata") {
            if (data.conversationId) setConversationId(data.conversationId);
          } else if (event === "status") {
            patchMessage(assistantMessageId, {
              research: { stage: data.stage, label: data.label, sources: data.sources },
            });
          } else if (event === "citations") {
            patchMessage(assistantMessageId, { citations: data as ArovaCitation[] });
          } else if (event === "token") {
            streamContent += typeof data === "string" ? data : "";
            patchMessage(assistantMessageId, { content: streamContent, research: null });
          } else if (event === "structured") {
            const s = parseStructured(data);
            patchMessage(assistantMessageId, {
              structured: s,
              citations: (s?.citations || []) as ArovaCitation[],
              actions: s?.actions || [],
              related: s?.relatedEntities || [],
              followUps: s?.followUps || [],
            });
          } else if (event === "followups") {
            patchMessage(assistantMessageId, { followUps: Array.isArray(data) ? data : [] });
          } else if (event === "end") {
            if (data.messageId) {
              patchMessage(assistantMessageId, { id: data.messageId });
            }
            patchMessage(data.messageId || assistantMessageId, { streaming: false, research: null });
          } else if (event === "error") {
            throw new Error(data?.message || "Streaming failed");
          }
        },
      });
      patchMessage(assistantMessageId, { streaming: false, research: null });
    } catch {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && !last.content) {
          return [...prev.slice(0, -1), {
            id: `e_${Date.now()}`,
            role: "assistant",
            content: "I couldn't access live sources just now. Here's what I can determine from AROVA's available knowledge and your workspace — please try again in a moment for a fully cited answer.",
            isError: true,
          }];
        }
        return [...prev, {
          id: `e_${Date.now()}`,
          role: "assistant",
          content: "AROVA couldn't complete the response. Please try again.",
          isError: true,
        }];
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div className="p-4 bg-white border-b border-neutral-100 shrink-0 z-10 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2 text-neutral-900 tracking-tight">
            <Sparkles className="w-4 h-4 text-violet-600" /> AROVA Intelligence
          </h3>
          <p className="text-[10px] text-neutral-500 mt-1 font-medium">Context-aware research with cited sources</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-md transition-colors lg:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-white">
        <div className="flex flex-col gap-6 max-w-[44rem] mx-auto w-full">
          {messages.map((msg) =>
            msg.role === "user" ? (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] bg-neutral-100 text-neutral-900 rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed">
                  <div className="whitespace-pre-line">{msg.content}</div>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className={`flex-1 min-w-0 ${msg.isError ? "bg-red-50 border border-red-100 rounded-2xl rounded-tl-md px-4 py-3 text-sm text-red-900" : ""}`}>
                  {msg.isError ? (
                    <div className="whitespace-pre-line">{msg.content}</div>
                  ) : msg.research && !msg.content && (!msg.citations || msg.citations.length === 0) ? (
                    <ResearchStatus state={msg.research} />
                  ) : (
                    <>
                      <ArovaMessage
                        structured={msg.structured}
                        markdown={msg.content}
                        citations={(msg.citations || []) as ArovaCitation[]}
                        actions={msg.actions}
                        related={msg.related}
                        followUps={msg.followUps}
                        onFollowUp={(fq) => handleSend(fq)}
                        streaming={msg.streaming}
                      />
                      {msg.research && (msg.content || (msg.citations && msg.citations.length > 0)) ? (
                        <div className="mt-1"><ResearchStatus state={msg.research} /></div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            )
          )}

          {isTyping && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex items-center gap-1.5 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {messages.length <= 1 && !isTyping && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
          {["Why am I not eligible?", "Latest official updates for this scheme?", "What should I do next?"].map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-[11px] font-semibold text-violet-700 hover:bg-violet-50 hover:border-violet-200 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 bg-white border-t border-neutral-200 shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask AROVA…"
              className="w-full bg-neutral-100 border border-neutral-200 rounded-xl pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none min-h-[44px] max-h-[120px]"
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="p-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 h-[44px] w-[44px] flex items-center justify-center"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="text-[9px] text-neutral-400 font-medium">
            <CornerDownLeft className="inline w-3 h-3 mr-1" /> Return to send
          </div>
          <div className="text-[9px] text-neutral-400 font-medium">
            Answers cite your documents and official sources.
          </div>
        </div>
      </div>
    </div>
  );
}
