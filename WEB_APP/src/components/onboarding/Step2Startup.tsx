"use client";

import React, { useState } from "react";
import { Building2, Globe, FileText, ArrowRight, ArrowLeft } from "lucide-react";

interface Step2StartupProps {
  initialData: {
    startupName?: string;
    description?: string;
    industry?: string;
    stage?: string;
    website?: string;
  };
  onBack: () => void;
  onNext: (data: {
    startupName: string;
    description: string;
    industry: string;
    stage: string;
    website: string;
  }) => void;
  isSaving?: boolean;
}

export function Step2Startup({ initialData, onBack, onNext, isSaving }: Step2StartupProps) {
  const [startupName, setStartupName] = useState(initialData.startupName || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [industry, setIndustry] = useState(initialData.industry || "");
  const [stage, setStage] = useState(initialData.stage || "");
  const [website, setWebsite] = useState(initialData.website || "");
  const [error, setError] = useState("");

  const industries = [
    "Technology",
    "FinTech",
    "HealthTech",
    "EdTech",
    "AgriTech",
    "SaaS",
    "E-commerce",
    "DeepTech",
    "AI / ML",
    "ClimateTech",
    "Manufacturing",
    "Social Impact",
    "Other",
  ];

  const stages = [
    { id: "Idea", label: "Idea", desc: "Concept & discovery" },
    { id: "MVP", label: "MVP", desc: "Prototype built" },
    { id: "Early Revenue", label: "Early Revenue", desc: "First paying users" },
    { id: "Growth", label: "Growth", desc: "Scaling traction" },
    { id: "Scaling", label: "Scaling", desc: "Established scale" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupName.trim()) {
      setError("Please enter your startup name.");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a short description of what your startup does.");
      return;
    }
    if (!industry) {
      setError("Please select your industry / sector.");
      return;
    }
    if (!stage) {
      setError("Please select your current startup stage.");
      return;
    }
    setError("");
    onNext({
      startupName: startupName.trim(),
      description: description.trim(),
      industry,
      stage,
      website: website.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">
          Tell us about your startup
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          These details are matched against sector-specific grants and innovation incentives.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Startup Name */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Startup / Company Name *
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              placeholder="e.g. AI-powered logistics platform for SMEs"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            What does your company do? *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Briefly explain your product, target market, and technological innovation..."
            className="w-full p-3.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 resize-none transition-all"
            required
          />
        </div>

        {/* Industry & Sector Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Industry / Sector *
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 outline-none focus:border-violet-600"
            >
              <option value="" disabled>Select industry…</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Website (Optional)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourstartup.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Startup Stage Radio Cards */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
            Current Stage of Startup *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {stages.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStage(st.id)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  stage === st.id
                    ? "border-violet-600 bg-violet-50 text-violet-900 shadow-2xs"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <div className="font-bold text-xs">{st.label}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5 leading-tight">{st.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-xs transition-all disabled:opacity-50"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
