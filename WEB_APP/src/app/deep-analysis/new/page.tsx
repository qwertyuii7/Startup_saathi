"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";

export default function NewAnalysisPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [state, setState] = useState("Uttar Pradesh");
  const [industry, setIndustry] = useState("Technology / SaaS");
  const [schemeScope, setSchemeScope] = useState<"both" | "central" | "state">("both");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const suggestedPrompts = [
    "Find schemes I qualify for",
    "Find funding opportunities",
    "Check my eligibility",
    "Find UP startup benefits",
  ];

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuery = query.trim() || "Find government schemes my startup may qualify for";
    setIsLoading(true);
    setError("");

    try {
      // Real backend LangGraph run: loads startup context, retrieves
      // schemes + evidence, evaluates eligibility, persists the record.
      const res = await api.deepAnalysis.run(finalQuery, {
        state,
        industry,
        governmentLevel: schemeScope === "both" ? "both" : schemeScope === "central" ? "central" : "state",
      });

      const analysisId = res?.analysis?.id;
      if (!analysisId) {
        throw new Error("The analysis completed but returned no record.");
      }
      router.push(`/deep-analysis/${analysisId}/running`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Start a Deep Analysis</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Tell SchemeSense what you want to investigate.
        </p>
      </div>

      <form onSubmit={handleRunAnalysis} className="space-y-6">
        {error && (
          <div role="alert" className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {/* Main Prompt Card */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-4">
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
            Analysis Query
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            placeholder="Example: Find government schemes my SaaS startup in Uttar Pradesh may qualify for..."
            className="w-full p-4 rounded-xl border border-neutral-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-sm text-neutral-900 placeholder:text-neutral-400 resize-none outline-none transition-all"
          />

          {/* Suggested Prompts */}
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 block mb-2">
              SUGGESTED PROMPTS
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuery(prompt)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-violet-50 text-neutral-700 hover:text-violet-700 text-xs font-medium transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-5">
          <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
            Startup Context & Scope
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* State */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                State / Location
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-800 outline-none focus:border-violet-500"
              >
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="All India">All India / Pan-India</option>
              </select>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                Industry / Sector
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-800 outline-none focus:border-violet-500"
              >
                <option value="Technology / SaaS">Technology / SaaS</option>
                <option value="FinTech">FinTech</option>
                <option value="HealthTech">HealthTech</option>
                <option value="AgriTech">AgriTech</option>
                <option value="CleanTech">CleanTech / Green Energy</option>
              </select>
            </div>
          </div>

          {/* Scheme Scope */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-2">
              Scheme Scope
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "both", label: "Central + State" },
                { id: "central", label: "Central only" },
                { id: "state", label: "State only" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                    schemeScope === opt.id
                      ? "border-violet-600 bg-violet-50/60 text-violet-700 font-semibold"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    checked={schemeScope === opt.id}
                    onChange={() => setSchemeScope(opt.id as any)}
                    className="accent-violet-600 hidden"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Initializing Analysis...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Deep Analysis →</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
