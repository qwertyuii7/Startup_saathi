"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  X,
  CornerDownLeft
} from "lucide-react";
import { Scheme, StartupContext } from "@/types/deep-analysis";
import { api } from "@/lib/api-client";
import { buildPageContext } from "@/lib/chat-page-context";
import { ArovaMessage } from "@/components/arova/ArovaMessage";
import { ResearchStatus, type ResearchState } from "@/components/arova/citations";
import type { ArovaStructured, ArovaAction, ArovaRelatedEntity, ArovaCitation } from "@/lib/chat/structured";
import { parseStructured } from "@/lib/chat/structured";

interface AskSchemeSenseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScheme?: Scheme | null;
  startupContext?: StartupContext | null;
}

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
      id: "welcome",
      role: "assistant",
      content: `I am AROVA Investigator. I answer from your startup profile (${greetingName}), your uploaded documents, and official scheme sources — with citations. Ask me anything about eligibility or latest updates.`,
    },
  ]);

  const suggestedQuestions = [
    "Why am I not eligible for this scheme?",
    "Latest official updates for this scheme?",
    "Which document is missing?",
    "What should I do next?",
  ];

  const [conversationId, setConversationId] = useState<string | undefined>();
  const pathname = usePathname();

  const patchMessage = (id: string, patch: Partial<Message>) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
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
    setInputQuery("");
    setIsTyping(true);

    try {
      let streamContent = "";
      await api.chat.stream(q, {
        conversationId,
        pageContext: buildPageContext(pathname, {
          selectedSchemeId: selectedScheme?.id,
          selectedSchemeName: selectedScheme?.name || selectedScheme?.shortName,
        }),
        onEvent: (event, data) => {
          if (event === "metadata") {
            if (data.conversationId) setConversationId(data.conversationId);
          } else if (event === "status") {
            patchMessage(assistantId, { research: { stage: data.stage, label: data.label, sources: data.sources } });
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
        content: `I couldn't reach the analysis service just now (${err instanceof Error ? err.message : "network error"}). Your question is saved in this thread — please try again in a moment.`,
      });
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
                Cited research on your dossier and official sources
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

        {/* Message Stream — ChatGPT-like */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-5">
            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[85%] bg-neutral-100 text-neutral-900 rounded-2xl rounded-br-md px-3.5 py-2.5 text-xs leading-relaxed">
                    <div className="whitespace-pre-line">{msg.content}</div>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {msg.research && !msg.content && (!msg.citations || msg.citations.length === 0) ? (
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
                          compact
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
          </div>
        </div>

        {/* Suggested Queries Chips */}
        <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
          <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 bg-white hover:bg-violet-50 text-neutral-700 hover:text-violet-700 text-[11px] font-medium rounded-lg border border-neutral-200 hover:border-violet-200 transition-colors whitespace-nowrap text-left"
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
