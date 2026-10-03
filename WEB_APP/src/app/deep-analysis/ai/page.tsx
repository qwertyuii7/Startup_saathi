"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, Sparkles, Send, BrainCircuit, Lightbulb, Target, AlertTriangle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api-client";
import { buildPageContext } from "@/lib/chat-page-context";
import { ArovaMessage } from "@/components/arova/ArovaMessage";
import { ResearchStatus, type ResearchState } from "@/components/arova/citations";
import type { ArovaStructured, ArovaRelatedEntity, ArovaCitation } from "@/lib/chat/structured";
import { parseStructured } from "@/lib/chat/structured";

interface ChatMsg {
  id?: string;
  role: "user" | "assistant" | "system";
  text: string;
  citations?: ArovaCitation[];
  actions?: { type: string; label: string; route: string; entityId?: string }[];
  structured?: ArovaStructured | null;
  related?: ArovaRelatedEntity[];
  followUps?: string[];
  research?: ResearchState | null;
  streaming?: boolean;
  isError?: boolean;
}

export default function AIIntelligenceWorkspace() {
  const { analysis, isLoading, error } = useWorkspaceAnalysis();
  const pathname = usePathname();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "system", text: "I am AROVA. I have deeply analyzed your startup against current scheme knowledge bases. You can ask me anything about your eligibility, missing evidence, gaps, risks, or get a personalized action plan. Where would you like to start?" }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("arova_conversation_id") : null;
    if (stored) {
      setConversationId(stored);
      api.chat.getHistory(stored).then((res) => {
        if (res.success && res.messages?.length) {
          setMessages(
            res.messages.map((m: { role: string; content: string; citations?: ChatMsg["citations"]; structured?: ArovaStructured | null }) => ({
              role: m.role === "user" ? "user" : "assistant",
              text: m.content,
              citations: m.citations,
              structured: m.structured || null,
            }))
          );
        }
      }).catch(() => undefined);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Initializing AI Workspace...</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Analysis Unavailable</h2>
        <p className="text-sm text-neutral-500">Please start a new Deep Analysis.</p>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || sending) return;

    const assistantIdxRef = { current: -1 };
    setMessages((prev) => {
      assistantIdxRef.current = prev.length + 1;
      return [
        ...prev,
        { role: "user", text: q },
        { role: "assistant", text: "", streaming: true, research: { stage: "understanding", label: "Understanding your question" } },
      ];
    });
    setInput("");
    setSending(true);

    const patchAssistant = (patch: Partial<ChatMsg>) =>
      setMessages((prev) => {
        const idx = assistantIdxRef.current;
        if (idx < 0 || idx >= prev.length) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], ...patch };
        return next;
      });

    try {
      const pageContext = buildPageContext(pathname, { analysisId: analysis.id });
      let streamContent = "";
      await api.chat.stream(q, {
        conversationId,
        pageContext,
        onEvent: (event, data) => {
          if (event === "metadata") {
            if (data.conversationId) {
              setConversationId(data.conversationId);
              try { localStorage.setItem("arova_conversation_id", data.conversationId); } catch { /* ignore */ }
            }
          } else if (event === "status") {
            patchAssistant({ research: { stage: data.stage, label: data.label, sources: data.sources } });
          } else if (event === "citations") {
            patchAssistant({ citations: data as ArovaCitation[] });
          } else if (event === "token") {
            streamContent += typeof data === "string" ? data : "";
            patchAssistant({ text: streamContent, research: null });
          } else if (event === "structured") {
            const s = parseStructured(data);
            patchAssistant({
              structured: s,
              citations: (s?.citations || []) as ArovaCitation[],
              actions: s?.actions || [],
              related: s?.relatedEntities || [],
              followUps: s?.followUps || [],
            });
          } else if (event === "followups") {
            patchAssistant({ followUps: Array.isArray(data) ? data : [] });
          } else if (event === "end") {
            patchAssistant({ streaming: false, research: null });
          } else if (event === "error") {
            throw new Error(data?.message || "Streaming failed");
          }
        },
      });
      patchAssistant({ streaming: false, research: null });
    } catch (err: unknown) {
      patchAssistant({
        streaming: false,
        research: null,
        text: err instanceof Error ? `I couldn't access live sources just now (${err.message}). Please try again in a moment.` : "Unable to reach AROVA. Please retry.",
        isError: true,
      });
    } finally {
      setSending(false);
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-full pb-8">
      <div className="shrink-0 mb-6">
        <AnalysisPageHeader
          title="AROVA Intelligence"
          description="A dedicated space to interact with your personalized startup analysis model."
          status={analysis.status}
          updatedAt={analysis.updatedAt}
        />
      </div>

      <div className="flex-1 flex gap-6 min-h-0">

        {/* Left Side: Context Summary */}
        <div className="w-[320px] shrink-0 hidden lg:flex flex-col gap-4 overflow-y-auto pr-2 pb-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
             <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-violet-600" /> Active Context</h3>

             <div className="space-y-4">
               <div>
                 <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Evaluated Scope</div>
                 <div className="text-sm font-bold text-neutral-900">{analysis.schemesAnalyzedCount} Schemes</div>
               </div>
               <div>
                 <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Top Opportunity</div>
                 <div className="text-sm font-medium text-emerald-600 leading-tight">
                   {analysis.findings[0]?.schemeName || "No schemes matched"}
                 </div>
               </div>
               <div>
                 <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Critical Blockers</div>
                 <div className="text-sm font-medium text-red-600">
                   {analysis.findings.flatMap(f => f.blockingFactors).length} unresolved gaps
                 </div>
               </div>
             </div>
          </div>

          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 shadow-sm">
             <h3 className="text-xs font-bold text-violet-900 uppercase tracking-wider mb-4">Suggested Topics</h3>
             <div className="flex flex-col gap-2">
               <button onClick={() => handleSuggestion("Summarize my biggest risks")} className="text-left px-3 py-2 bg-white rounded-lg text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors border border-violet-100 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> Biggest Risks</button>
               <button onClick={() => handleSuggestion("How do I become eligible for DPIIT?")} className="text-left px-3 py-2 bg-white rounded-lg text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors border border-violet-100 flex items-center gap-2"><Target className="w-3.5 h-3.5" /> Eligibility Steps</button>
               <button onClick={() => handleSuggestion("Show me funding opportunities")} className="text-left px-3 py-2 bg-white rounded-lg text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors border border-violet-100 flex items-center gap-2"><Lightbulb className="w-3.5 h-3.5" /> Funding Options</button>
             </div>
          </div>
        </div>

        {/* Right Side: Chat Interface */}
        <div className="flex-1 bg-white border border-neutral-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">

          <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
            <div className="flex flex-col gap-6 max-w-[44rem] mx-auto w-full">
            {messages.map((msg, i) => (
              msg.role === "system" ? (
                <div key={i} className="text-center text-[11px] text-neutral-400 font-medium">{msg.text}</div>
              ) : (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} min-w-0`}>
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mr-3 mt-0.5">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                {msg.role === "user" ? (
                  <div className="max-w-[85%] bg-neutral-900 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed">
                    <div className="whitespace-pre-line">{msg.text}</div>
                  </div>
                ) : msg.isError ? (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed">
                    <div className="whitespace-pre-line">{msg.text}</div>
                  </div>
                ) : msg.research && !msg.text && (!msg.citations || msg.citations.length === 0) ? (
                  <ResearchStatus state={msg.research} />
                ) : (
                  <div className="flex-1 min-w-0">
                    <ArovaMessage
                      structured={msg.structured}
                      markdown={msg.text}
                      citations={(msg.citations || []) as ArovaCitation[]}
                      actions={msg.actions}
                      related={msg.related}
                      followUps={msg.followUps}
                      onFollowUp={(fq) => { setInput(fq); }}
                      streaming={msg.streaming}
                    />
                    {msg.research && (msg.text || (msg.citations && msg.citations.length > 0)) ? (
                      <div className="mt-1"><ResearchStatus state={msg.research} /></div>
                    ) : null}
                  </div>
                )}
              </div>
              )
            ))}
            {sending && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mr-3">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="text-sm text-neutral-500 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Researching…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
            </div>
          </div>

          <div className="p-4 bg-white border-t border-neutral-200 shrink-0">
            <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask AROVA about your startup analysis..."
                className="w-full bg-neutral-100 border border-neutral-200 rounded-xl pl-4 pr-12 py-3.5 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:bg-white transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-center mt-3 text-[10px] text-neutral-400 font-medium">
              AROVA answers only from your workspace evidence and official sources. Unverified claims are labeled.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
