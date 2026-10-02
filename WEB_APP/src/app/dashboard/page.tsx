"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, CornerDownLeft, BrainCircuit } from "lucide-react";
import { useCopilot } from "@/components/dashboard/CopilotProvider";

export default function DashboardHome() {
  const { openCopilot } = useCopilot();
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleChatSubmit = (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const q = presetQuery || query;
    if (!q.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setQuery("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I checked your profile. You are fully eligible for the Seed Fund since you have a valid DPIIT certificate and are under 24 months old. Shall we begin drafting the application?" 
      }]);
    }, 1500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col pt-12 min-h-screen">
      
      {messages.length === 0 ? (
        <>
          {/* Greeting */}
      <div className="mb-12">
        <h2 className="text-3xl font-medium tracking-tight text-neutral-900 mb-2">
          Good afternoon, Aaftab.
        </h2>
        <p className="text-neutral-500 text-lg">
          You have <strong className="text-emerald-600 font-medium">2 strong schemes</strong> and <strong className="text-orange-500 font-medium">3 things to finish</strong>.
        </p>
      </div>

      {/* Next Step Card (Only one primary action) */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm mb-12 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <span className="font-bold">!</span>
          </div>
          <div>
            <h3 className="font-medium text-neutral-900 text-lg mb-1">Missing Financials</h3>
            <p className="text-neutral-500 text-sm">Upload your audited financials to unlock 1 more scheme.</p>
          </div>
        </div>
        <button className="shrink-0 w-full sm:w-auto px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium transition-colors">
          Upload
        </button>
      </div>

      {/* Top Schemes List */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Top Matches</h3>
        
        {/* Mock Scheme Row 1 */}
        <div className="group bg-white border border-neutral-200 hover:border-violet-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] uppercase font-bold tracking-wider rounded-md">Central</span>
              <h4 className="font-medium text-neutral-900 group-hover:text-violet-600 transition-colors">Startup India Seed Fund Scheme</h4>
            </div>
            <p className="text-sm text-neutral-500">Provides financial assistance to startups for proof of concept.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Strong Fit</span>
            <span className="text-[11px] text-neutral-400 font-medium">3 of 3 criteria met</span>
          </div>
        </div>

        {/* Mock Scheme Row 2 */}
        <div className="group bg-white border border-neutral-200 hover:border-violet-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] uppercase font-bold tracking-wider rounded-md">State</span>
              <h4 className="font-medium text-neutral-900 group-hover:text-violet-600 transition-colors">UP Startup Policy 2020</h4>
            </div>
            <p className="text-sm text-neutral-500">Sustenance allowance and marketing assistance.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">Possible</span>
            <span className="text-[11px] text-neutral-400 font-medium">2 of 3 criteria met</span>
          </div>
        </div>

      </div>

      <button className="text-violet-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all self-start mb-8">
        See all schemes <ArrowRight className="w-4 h-4" />
      </button>
      </>
      ) : (
        <div className="flex-1 space-y-6 pb-24 px-4 sm:px-0">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-neutral-900 text-white rounded-br-sm' 
                  : 'bg-white border border-neutral-200 shadow-sm text-neutral-800 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Copilot Composer Mock & Suggestion Chips */}
      <div className="sticky bottom-0 pt-8 pb-8 mt-auto w-full bg-white z-20">
        
        {/* Gradient Fade Top */}
        <div className="absolute -top-12 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />

        {/* Suggestion Chips (Only show if no messages yet) */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-3 relative z-10">
            <button onClick={() => handleChatSubmit(undefined, "Am I eligible for Seed Fund?")} className="px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-xs text-neutral-600 hover:border-violet-300 hover:text-violet-700 transition-colors shadow-sm">
              Am I eligible for Seed Fund?
            </button>
            <button onClick={() => handleChatSubmit(undefined, "What am I missing?")} className="px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-xs text-neutral-600 hover:border-violet-300 hover:text-violet-700 transition-colors shadow-sm">
              What am I missing?
            </button>
            <button onClick={() => handleChatSubmit(undefined, "Find incubators")} className="px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-xs text-neutral-600 hover:border-violet-300 hover:text-violet-700 transition-colors shadow-sm hidden sm:block">
              Find incubators
            </button>
          </div>
        )}

        <form 
          onSubmit={handleChatSubmit}
          className="relative z-10 bg-white border border-neutral-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 rounded-2xl shadow-sm flex items-center transition-all overflow-hidden"
        >
          <div className="w-12 h-full flex items-center justify-center text-violet-500 shrink-0 absolute left-0 top-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Saathi anything... (Press ⌘K for quick panel)"
            className="flex-1 py-4 pl-12 pr-12 outline-none text-neutral-900 placeholder:text-neutral-400 bg-transparent"
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

    </div>
  );
}
