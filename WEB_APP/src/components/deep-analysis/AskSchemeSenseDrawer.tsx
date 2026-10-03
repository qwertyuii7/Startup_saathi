"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Scale,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CornerDownLeft
} from "lucide-react";
import { Scheme, StartupContext } from "@/types/deep-analysis";
import { api } from "@/lib/api-client";
import { buildPageContext } from "@/lib/chat-page-context";

interface AskSchemeSenseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScheme?: Scheme | null;
  startupContext?: StartupContext | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: { type: string; title: string; ref: string; url?: string }[];
}

export function AskSchemeSenseDrawer({
  isOpen,
  onClose,
  selectedScheme,
  startupContext,
}: AskSchemeSenseDrawerProps) {
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const greetingName = startupContext?.name || "your startup";
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `I am AROVA Investigator. I answer from your startup profile (${greetingName}), your uploaded documents, and official scheme clauses — with citations. Ask me anything about eligibility or missing evidence.`,
    },
  ]);

  const suggestedQuestions = [
    "Why am I not eligible for this scheme?",
    "Which document is missing?",
    "Show me the evidence.",
    "What should I do next?",
    "Find similar schemes.",
    "Explain this requirement.",
  ];

  const [conversationId, setConversationId] = useState<string | undefined>();
  const pathname = usePathname();

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isTyping) return;

    setMessages(prev => [...prev, { role: "user", content: q }]);
    setInputQuery("");
    setIsTyping(true);

    try {
      const data = await api.chat.send(
        q,
        conversationId,
        selectedScheme?.id,
        buildPageContext(pathname, {
          selectedSchemeId: selectedScheme?.id,
          selectedSchemeName: selectedScheme?.name || selectedScheme?.shortName,
        })
      );

      if (data.success && data.message) {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: data.message.content,
            citations: data.message.sources,
          },
        ]);
      } else {
        throw new Error("Chat failed");
      }
    } catch (err: unknown) {
      // Honest error — never a fabricated grounded answer.
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `I couldn't reach the analysis service just now (${err instanceof Error ? err.message : "network error"}). Your question is saved in this thread — please try again in a moment.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/30 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">
                Ask AROVA Investigator
              </h3>
              <p className="text-[11px] text-neutral-400">
                Grounded on current startup dossier & gazette rules
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Context Banner */}
        {selectedScheme && (
          <div className="bg-violet-50/70 border-b border-violet-100 px-4 py-2 flex items-center justify-between text-xs">
            <span className="text-violet-800 font-medium truncate">
              Active Context: <strong>{selectedScheme.shortName}</strong>
            </span>
            <span className="px-1.5 py-0.2 bg-violet-200/70 text-violet-900 rounded text-[10px] font-bold uppercase">
              {selectedScheme.fitLabel}
            </span>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-neutral-900 text-white rounded-br-xs"
                    : "bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-bl-xs shadow-2xs"
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Citations Box */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-neutral-200/60 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                      Evidentiary Citations:
                    </span>
                    {msg.citations.map((c, idx) => {
                      const isWeb = c.type === "web";
                      const Icon = isWeb ? Sparkles : FileText;
                      const colorClass = isWeb ? "text-blue-500" : "text-violet-500";
                      const wrapperClass = isWeb ? "text-blue-700 bg-blue-50 border-blue-200" : "text-violet-700 bg-white border-neutral-200";
                      return (
                        <div key={idx} className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded border ${wrapperClass}`}>
                          <Icon className={`w-3 h-3 shrink-0 ${colorClass}`} />
                          {isWeb ? (
                            <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-semibold truncate hover:underline">
                              {c.title}
                            </a>
                          ) : (
                            <span className="font-semibold truncate">{c.title}</span>
                          )}
                          <span className="text-neutral-400 shrink-0">({c.ref})</span>
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
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries Chips */}
        <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
            Suggested Inquiries
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 bg-white hover:bg-violet-50 text-neutral-700 hover:text-violet-700 text-[11px] font-medium rounded-lg border border-neutral-200 hover:border-violet-200 transition-colors shadow-2xs text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-neutral-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-neutral-50 border border-neutral-300 focus-within:border-violet-500 rounded-xl p-1.5 transition-colors"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about this analysis or scheme..."
              className="flex-1 bg-transparent px-2.5 py-1 text-xs text-neutral-900 outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </>
  );
}
