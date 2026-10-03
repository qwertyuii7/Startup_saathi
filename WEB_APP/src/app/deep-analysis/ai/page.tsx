"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, Sparkles, Send, BrainCircuit, Lightbulb, Target, AlertTriangle, FileText, RefreshCw } from "lucide-react";
import { api } from "@/lib/api-client";
import { buildPageContext } from "@/lib/chat-page-context";

interface ChatMsg {
  role: "user" | "assistant" | "system";
  text: string;
  citations?: { type: string; title: string; ref: string; url?: string }[];
  actions?: { type: string; label: string; route: string; entityId?: string }[];
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
            res.messages.map((m: { role: string; content: string; citations?: ChatMsg["citations"] }) => ({
              role: m.role === "user" ? "user" : "assistant",
              text: m.content,
              citations: m.citations,
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

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setSending(true);

    try {
      const pageContext = buildPageContext(pathname, { analysisId: analysis.id });
      const res = await api.chat.send(q, conversationId, undefined, pageContext);
      const content = res.message?.content || "I couldn't generate a grounded answer. Please try again.";
      const citations = res.citations || res.message?.sources || [];
      const actions = res.actions || [];
      setMessages((prev) => [...prev, { role: "assistant", text: content, citations, actions }]);
      // Persist conversation id from history endpoint ordering: re-list to capture new conv.
      const list = await api.chat.listConversations().catch(() => null);
      const latest = list?.conversations?.[0]?.id;
      if (latest) {
        setConversationId(latest);
        try { localStorage.setItem("arova_conversation_id", latest); } catch { /* ignore */ }
      }
    } catch (err: unknown) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: err instanceof Error ? `Unable to reach AROVA: ${err.message}` : "Unable to reach AROVA. Please retry.",
        isError: true,
      }]);
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

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-neutral-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex max-w-[85%] ${msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 mr-3 shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-neutral-900 text-white rounded-tr-sm'
                    : msg.isError
                      ? 'bg-red-50 border border-red-200 text-red-800 rounded-tl-sm'
                      : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-sm'
                }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-neutral-200 space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Evidence</span>
                      {msg.citations.slice(0, 4).map((c, ci) => (
                        <div key={ci} className="flex items-center gap-1.5 text-[11px] text-neutral-600">
                          <FileText className="w-3 h-3 shrink-0 text-violet-500" />
                          <span className="font-semibold truncate">{c.title}</span>
                          <span className="text-neutral-400 shrink-0">({c.ref})</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {msg.actions.slice(0, 4).map((a, ai) => (
                        <Link key={ai} href={a.route} className="px-2.5 py-1 text-[11px] font-bold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg transition-colors">
                          {a.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex mr-auto justify-start">
                <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 mr-3 shadow-md">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 text-sm text-neutral-500 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Retrieving evidence and reasoning…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
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
