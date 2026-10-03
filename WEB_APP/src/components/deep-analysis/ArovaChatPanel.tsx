"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Sparkles, Send, X, FileText, ChevronRight, Loader2, Bot, User, RefreshCw, Briefcase, CornerDownLeft, CircleSlash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { buildPageContext } from "@/lib/chat-page-context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: { type: string; title: string; ref: string; url?: string }[];
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchHistory = async (cid: string) => {
      try {
        const res = await api.chat.getHistory(cid);
        if (res.success && res.messages && res.messages.length > 0) {
          setMessages(res.messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            citations: m.citations
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
      const storedCid = localStorage.getItem("arova_conversation_id");
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
            content: `I'm analyzing ${pageContext}. I can explain your blockers, evidence coverage, scheme matches, or recommended next steps.`,
          }
        ]);
      }
    };

    init();
  }, [pathname]);

  // Persist conversationId
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem("arova_conversation_id", conversationId);
    }
  }, [conversationId]);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isTyping) return;

    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: "user", content: q }]);
    setInputQuery("");
    setIsTyping(true);

    try {
      const pageContext = buildPageContext(pathname, {
        analysisId: analysis?.id,
      });

      const response = await fetch("/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, conversationId, pageContext })
      });

      if (!response.ok) throw new Error("Stream failed");
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantMessageId = Date.now().toString();
      let streamContent = "";
      
      setMessages(prev => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" }
      ]);

      while (!done && reader) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const events = chunk.split('\\n\\n').filter(Boolean);
          
          for (const ev of events) {
            const lines = ev.split('\\n');
            const eventType = lines[0].replace('event: ', '').trim();
            const dataStr = lines[1]?.replace('data: ', '')?.trim();
            if (!dataStr) continue;
            
            const data = JSON.parse(dataStr);
            
            if (eventType === 'metadata') {
              if (data.conversationId) setConversationId(data.conversationId);
            } else if (eventType === 'citations') {
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId ? { ...m, citations: data } : m
              ));
            } else if (eventType === 'token') {
              streamContent += data;
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId ? { ...m, content: streamContent } : m
              ));
            } else if (eventType === 'end') {
              if (data.messageId) {
                setMessages(prev => prev.map(m => 
                  m.id === assistantMessageId ? { ...m, id: data.messageId } : m
                ));
              }
            } else if (eventType === 'error') {
              throw new Error(data.message);
            }
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && !last.content) {
          // Remove empty assistant message and push error
          return [...prev.slice(0, -1), {
            id: Date.now().toString(),
            role: "assistant",
            content: "AROVA couldn't complete the response. Please try again.",
            isError: true
          }];
        }
        return [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: "AROVA couldn't complete the response. Please try again.",
          isError: true
        }];
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 bg-white border-b border-neutral-100 shrink-0 shadow-xs z-10 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2 text-neutral-900 tracking-tight">
            <Sparkles className="w-4 h-4 text-violet-600" /> AROVA Intelligence
          </h3>
          <p className="text-[10px] text-neutral-500 mt-1 font-medium">Context-aware reasoning for your startup</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-md transition-colors lg:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 bg-neutral-50/50 relative">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mr-3 mt-1 shadow-xs border border-violet-200">
                <Sparkles className="w-3.5 h-3.5 text-violet-700" />
              </div>
            )}
            
            <div className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div 
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                  msg.role === "user" 
                    ? "bg-neutral-900 text-white rounded-br-sm" 
                    : msg.isError 
                      ? "bg-red-50 text-red-900 border border-red-100 rounded-tl-sm"
                      : "bg-white border border-neutral-200/80 text-neutral-800 rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2.5 space-y-2 w-full">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-1">Sources & Evidence</div>
                  <div className="flex flex-col gap-1.5">
                    {msg.citations.map((cit, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-white border border-neutral-200/60 rounded-lg hover:border-violet-200 transition-colors shadow-2xs group cursor-default">
                        {cit.type === "document" ? (
                          <FileText className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                        ) : (
                          <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-neutral-700 truncate">{cit.title}</span>
                          <span className="text-[10px] text-neutral-500 truncate">{cit.ref}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mr-3 mt-1 border border-violet-200">
              <Sparkles className="w-3.5 h-3.5 text-violet-700" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-neutral-200/80 shadow-xs flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Suggested Questions (only show if no messages or just welcome) */}
      {messages.length <= 1 && !isTyping && (
        <div className="px-4 pb-2 bg-neutral-50/50 flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
          {["Why am I not eligible?", "What is my biggest blocker?", "What should I do next?"].map(q => (
            <button 
              key={q} 
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-[11px] font-semibold text-violet-700 hover:bg-violet-50 hover:border-violet-200 whitespace-nowrap transition-colors shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-neutral-200 shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-end gap-2">
          <div className="relative flex-1">
            <textarea 
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask AROVA..." 
              className="w-full bg-neutral-100 border border-neutral-200 rounded-xl pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none min-h-[44px] max-h-[120px] shadow-inner"
              rows={1}
            />
          </div>
          <button 
            type="submit" 
            disabled={!inputQuery.trim() || isTyping}
            className="p-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0 h-[44px] w-[44px] flex items-center justify-center"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="text-[9px] text-neutral-400 font-medium">
            <CornerDownLeft className="inline w-3 h-3 mr-1" /> Return to send
          </div>
          <div className="text-[9px] text-neutral-400 font-medium">
            Responses use authenticated workspace data.
          </div>
        </div>
      </div>
    </div>
  );
}
