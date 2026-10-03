"use client";

import { useEffect, useRef, useState } from "react";
import { useCopilot } from "./CopilotProvider";
import { Sparkles, X, CornerDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api-client";
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
}

export function CopilotPanel() {
  const { isOpen, closeCopilot } = useCopilot();
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "I am AROVA Intelligence. Ask me about schemes, eligibility, documents, or current government updates — I research official sources and cite them.",
    },
  ]);
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const patchMessage = (id: string, patch: Partial<Message>) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const handleSubmit = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const q = presetQuery || query;
    if (!q.trim() || isTyping) return;

    const assistantId = `a_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: `u_${Date.now()}`, role: "user", content: q },
      {
        id: assistantId,
        role: "assistant",
        content: "",
        streaming: true,
        research: { stage: "understanding", label: "Understanding your question" },
      },
    ]);
    setQuery("");
    setIsTyping(true);

    try {
      let streamContent = "";
      await api.chat.stream(q, {
        conversationId,
        pageContext: buildPageContext(pathname),
        onEvent: (event, data) => {
          if (event === "metadata") {
            if (data.conversationId) setConversationId(data.conversationId);
          } else if (event === "status") {
            patchMessage(assistantId, {
              research: {
                stage: data.stage,
                label: data.label,
                sources: data.sources,
              },
            });
          } else if (event === "citations") {
            patchMessage(assistantId, { citations: data as ArovaCitation[] });
          } else if (event === "token") {
            streamContent += typeof data === "string" ? data : "";
            patchMessage(assistantId, { content: streamContent, research: null });
          } else if (event === "structured") {
            const s = parseStructured(data);
            patchMessage(assistantId, {
              structured: s,
              citations: (s?.citations || []) as ArovaCitation[],
              actions: s?.actions || [],
              related: s?.relatedEntities || [],
              followUps: s?.followUps || [],
            });
          } else if (event === "followups") {
            patchMessage(assistantId, { followUps: Array.isArray(data) ? data : [] });
          } else if (event === "end") {
            patchMessage(assistantId, { streaming: false, research: null });
          } else if (event === "error") {
            throw new Error(data?.message || "Streaming failed");
          }
        },
      });
      patchMessage(assistantId, { streaming: false, research: null });
      if (!conversationId) {
        api.chat.listConversations().then((list) => {
          const latest = list?.conversations?.[0]?.id;
          if (latest) setConversationId(latest);
        }).catch(() => null);
      }
    } catch (err: unknown) {
      patchMessage(assistantId, {
        streaming: false,
        research: null,
        content: `I couldn't reach the analysis service just now (${err instanceof Error ? err.message : "network error"}). Please try again in a moment.`,
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-white border-l border-neutral-200/90 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex flex-col border-b border-neutral-100 bg-neutral-50/50">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 leading-tight">Ask AROVA</h3>
                  <p className="text-[10px] text-neutral-400">Research assistant with cited sources</p>
                </div>
              </div>
              <button
                onClick={closeCopilot}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-lg text-[10px] uppercase font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                <span>Context: {pathname === "/dashboard" ? "Overview" : pathname?.split("/").pop() || "Workspace"}</span>
              </div>
            </div>
          </div>

          {/* Chat Message Stream — ChatGPT-like: user bubble right, assistant plain left */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-6 max-w-[44rem] mx-auto w-full">
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[85%] bg-neutral-100 text-neutral-900 rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-relaxed">
                      <div className="whitespace-pre-line">{msg.content}</div>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {msg.research && !msg.content && (!msg.citations || msg.citations.length === 0) ? (
                        <ResearchStatus state={msg.research} />
                      ) : (
                        <ArovaMessage
                          structured={msg.structured}
                          markdown={msg.content}
                          citations={(msg.citations || []) as ArovaCitation[]}
                          actions={msg.actions}
                          related={msg.related}
                          followUps={msg.followUps}
                          onFollowUp={(fq) => handleSubmit(undefined, fq)}
                          streaming={msg.streaming}
                        />
                      )}
                      {msg.research && (msg.content || (msg.citations && msg.citations.length > 0)) ? (
                        <div className="mt-1"><ResearchStatus state={msg.research} /></div>
                      ) : null}
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
                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Suggested Queries */}
          <div className="px-4 pt-2 pb-1 border-t border-neutral-100 bg-neutral-50/50">
            <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {[
                "Latest startup schemes in Uttar Pradesh",
                "Am I eligible for this scheme?",
                "What documents am I missing?",
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSubmit(undefined, q)}
                  className="px-2.5 py-1.5 bg-white hover:bg-violet-50 text-neutral-700 hover:text-violet-700 text-[11px] font-medium rounded-lg border border-neutral-200 hover:border-violet-200 transition-colors whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-neutral-200 bg-white">
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center bg-neutral-50 border border-neutral-200 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 rounded-xl p-1.5 transition-all overflow-hidden"
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask AROVA — schemes, eligibility, latest updates…"
                className="flex-1 bg-transparent px-2.5 py-1 text-xs text-neutral-900 outline-none placeholder:text-neutral-400"
              />
              <button
                type="submit"
                disabled={!query.trim() || isTyping}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
