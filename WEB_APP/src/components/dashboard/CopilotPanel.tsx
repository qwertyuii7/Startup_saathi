"use client";

import { useEffect, useRef, useState } from "react";
import { useCopilot } from "./CopilotProvider";
import { Sparkles, X, ArrowRight, CornerDownLeft, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function CopilotPanel() {
  const { isOpen, closeCopilot } = useCopilot();
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const pathname = usePathname();
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Optional: reset state when closed if desired, though keeping history is nice
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setQuery("");
    setIsTyping(true);

    // Mock API response delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I've checked the rules. You need to upload your audited financials to qualify." 
      }]);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 z-50 w-full lg:w-[420px] bg-white border-l border-neutral-200 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex flex-col border-b border-neutral-100 bg-neutral-50/50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-medium text-neutral-900">Ask Saathi</span>
              </div>
              <button 
                onClick={closeCopilot}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Context Badge */}
            <div className="px-6 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-violet-50 text-violet-700 rounded-md text-[10px] uppercase font-bold tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                Analyzing: {pathname === '/dashboard' ? 'Overview' : pathname?.split('/').pop() || 'Workspace'}
              </div>
            </div>
          </div>

            {/* Chat Area / Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto opacity-70">
                  <BrainCircuit className="w-12 h-12 text-neutral-300 mb-4" />
                  <p className="text-neutral-500 mb-6">I have the context of your dashboard and profile. Ask me anything about your eligibility, gaps, or schemes.</p>
                  
                  <div className="w-full space-y-2">
                    <button onClick={() => setQuery("Why am I not eligible for Seed Fund?")} className="w-full text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 rounded-xl text-sm text-neutral-600 transition-colors flex items-center justify-between group">
                      Why am I not eligible for Seed Fund?
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button onClick={() => setQuery("Find incubators for AI startups in Delhi")} className="w-full text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 rounded-xl text-sm text-neutral-600 transition-colors flex items-center justify-between group">
                      Find incubators for AI startups in Delhi
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-neutral-900 text-white rounded-br-sm' 
                          : 'bg-neutral-100 text-neutral-800 rounded-bl-sm border border-neutral-200/50'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-neutral-100 border border-neutral-200/50 rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-neutral-100 bg-white">
              <form 
                onSubmit={handleSubmit}
                className="relative flex items-center bg-white border border-neutral-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 rounded-2xl shadow-sm transition-all overflow-hidden"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Saathi anything..."
                  className="flex-1 bg-transparent py-4 pl-4 pr-12 outline-none text-neutral-900 placeholder:text-neutral-400"
                />
                <button 
                  type="submit"
                  disabled={!query.trim()}
                  className="absolute right-2 p-2 bg-neutral-900 disabled:bg-neutral-200 text-white disabled:text-neutral-400 rounded-xl transition-colors flex items-center justify-center"
                >
                  <CornerDownLeft className="w-4 h-4" />
                </button>
              </form>
            </div>
            
          </motion.div>
      )}
    </AnimatePresence>
  );
}
