"use client";

import { useEffect, useRef, useState } from "react";
import { useCopilot } from "./CopilotProvider";
import { Sparkles, X, ArrowRight, CornerDownLeft, BrainCircuit, FileText, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api-client";
import { buildPageContext } from "@/lib/chat-page-context";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: { type: "document" | "official_source" | "web"; title: string; ref: string; url?: string; domain?: string; snippet?: string }[];
}

export function CopilotPanel() {
  const { isOpen, closeCopilot } = useCopilot();
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I am AROVA Intelligence. Ask me about your schemes, eligibility, documents, or action plan — I answer from your workspace data with citations.",
    },
  ]);
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const q = presetQuery || query;
    if (!q.trim() || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuery("");
    setIsTyping(true);

    try {
      const res = await api.chat.send(q, conversationId, undefined, buildPageContext(pathname));
      if (res.success && res.message) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.message.content,
            citations: res.message.sources as any,
          },
        ]);
      } else {
        throw new Error("Chat response unsuccessful");
      }
    } catch (err: unknown) {
      // Honest error state — never a fabricated answer with fake citations.
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I couldn't reach the analysis service just now (${err instanceof Error ? err.message : "network error"}). Please try again in a moment.`,
        },
      ]);
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
          className="fixed right-0 top-0 bottom-0 z-50 w-full lg:w-[420px] bg-white border-l border-neutral-200/90 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex flex-col border-b border-neutral-100 bg-neutral-50/50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 leading-tight">Ask AROVA</h3>
                  <p className="text-[10px] text-neutral-400">Contextual Scheme Intelligence</p>
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
            
            {/* Context Badge */}
            <div className="px-6 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-lg text-[10px] uppercase font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                <span>Context: {pathname === '/dashboard' ? 'Overview' : pathname?.split('/').pop() || 'Workspace'}</span>
              </div>
            </div>
          </div>

          {/* Chat Message Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-neutral-900 text-white rounded-br-xs' 
                    : 'bg-neutral-50 text-neutral-800 rounded-bl-xs border border-neutral-200/70 shadow-2xs'
                }`}>
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {/* Evidentiary Citations Box */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-200 space-y-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        Verified Sources & Evidence:
                      </span>
                      {msg.citations.map((cit, idx) => {
                        const isWeb = cit.type === "web";
                        const Icon = isWeb ? Sparkles : FileText;
                        const colorClass = isWeb ? "text-blue-500" : "text-violet-500";
                        const wrapperClass = isWeb ? "text-blue-700 bg-blue-50 border-blue-200" : "text-violet-700 bg-white border-neutral-200";
                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded border ${wrapperClass}`}
                          >
                            <Icon className={`w-3 h-3 shrink-0 ${colorClass}`} />
                            {isWeb ? (
                              <a href={cit.url} target="_blank" rel="noopener noreferrer" className="font-semibold truncate hover:underline">
                                {cit.title}
                              </a>
                            ) : (
                              <span className="font-semibold truncate">{cit.title}</span>
                            )}
                            <span className="text-neutral-400 shrink-0">({cit.ref})</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl rounded-bl-xs px-4 py-3 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggested Questions */}
          <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Suggested Queries
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Why am I eligible for Seed Fund?",
                "What documents are missing?",
                "Matched UP incubators",
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSubmit(undefined, q)}
                  className="px-2.5 py-1 bg-white hover:bg-violet-50 text-neutral-700 hover:text-violet-700 text-[11px] font-medium rounded-lg border border-neutral-200 hover:border-violet-200 transition-colors shadow-2xs text-left"
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
                placeholder="Ask AROVA about schemes, eligibility..."
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
