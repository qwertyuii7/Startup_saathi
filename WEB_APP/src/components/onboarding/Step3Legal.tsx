"use client";

import React, { useState } from "react";
import { Scale, Calendar, MapPin, Award, ArrowRight, ArrowLeft } from "lucide-react";

interface Step3LegalProps {
  initialData: {
    entityType?: string;
    incorporationDate?: string;
    state?: string;
    city?: string;
    dpiitStatus?: string | boolean;
    dpiitRecognitionNumber?: string;
  };
  onBack: () => void;
  onNext: (data: {
    entityType: string;
    incorporationDate: string;
    state: string;
    city: string;
    dpiitStatus: "Yes" | "No" | "Applied / Pending" | "Not Sure";
    dpiitRecognitionNumber: string;
  }) => void;
  isSaving?: boolean;
}

export function Step3Legal({ initialData, onBack, onNext, isSaving }: Step3LegalProps) {
  const [entityType, setEntityType] = useState(initialData.entityType || "");
  const [incorporationDate, setIncorporationDate] = useState(initialData.incorporationDate || "");
  const [state, setState] = useState(initialData.state || "");
  const [city, setCity] = useState(initialData.city || "");

  // Normalize initial DPIIT status
  const normalizedDpiit =
    typeof initialData.dpiitStatus === "boolean"
      ? initialData.dpiitStatus ? "Yes" : "No"
      : (initialData.dpiitStatus as "Yes" | "No" | "Applied / Pending" | "Not Sure" | undefined) || "Not Sure";

  const [dpiitStatus, setDpiitStatus] = useState<"Yes" | "No" | "Applied / Pending" | "Not Sure">(
    normalizedDpiit
  );
  const [dpiitNumber, setDpiitNumber] = useState(initialData.dpiitRecognitionNumber || "");
  const [error, setError] = useState("");

  const entityTypes = [
    "Private Limited Company",
    "LLP",
    "Partnership",
    "Sole Proprietorship",
    "Other",
  ];

  const states = [
    "Uttar Pradesh",
    "Karnataka",
    "Maharashtra",
    "Delhi NCR",
    "Telangana",
    "Tamil Nadu",
    "Gujarat",
    "Rajasthan",
    "Kerala",
    "Haryana",
    "West Bengal",
    "Madhya Pradesh",
    "Other State / UT",
  ];

  const dpiitOptions: ("Yes" | "No" | "Applied / Pending" | "Not Sure")[] = [
    "Yes",
    "No",
    "Applied / Pending",
    "Not Sure",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityType) {
      setError("Please select your legal entity type.");
      return;
    }
    if (!incorporationDate) {
      setError("Please enter your incorporation date.");
      return;
    }
    if (!state.trim()) {
      setError("Please select the state where your startup is registered.");
      return;
    }
    if (!city.trim()) {
      setError("Please enter your registered city.");
      return;
    }
    if (dpiitStatus === "Yes" && !dpiitNumber.trim()) {
      setError("Please provide your DPIIT Certificate Recognition Number (e.g. DIPP100000).");
      return;
    }
    setError("");
    onNext({
      entityType,
      incorporationDate,
      state,
      city: city.trim(),
      dpiitStatus,
      dpiitRecognitionNumber: dpiitStatus === "Yes" ? dpiitNumber.trim() : "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">
          Your startup's legal profile
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Statutory parameters evaluated by DPIIT and State Startup policies.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Entity Type */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
            Legal Entity Structure *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {entityTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setEntityType(type)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  entityType === type
                    ? "border-violet-600 bg-violet-50 text-violet-700 shadow-2xs"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Incorporation Date & State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Incorporation Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={incorporationDate}
                onChange={(e) => setIncorporationDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-violet-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Registered State *
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 outline-none focus:border-violet-600"
            >
              <option value="" disabled>Select state…</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Registered City / District *
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Lucknow, Noida, Bengaluru"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-violet-600"
              required
            />
          </div>
        </div>

        {/* DPIIT Status */}
        <div className="pt-2 border-t border-neutral-100">
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
            DPIIT Startup India Recognition *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {dpiitOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setDpiitStatus(opt)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  dpiitStatus === opt
                    ? "border-violet-600 bg-violet-50 text-violet-700 shadow-2xs"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional DPIIT Recognition Number */}
        {dpiitStatus === "Yes" && (
          <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-100 space-y-1.5 animate-in fade-in duration-200">
            <label className="block text-xs font-semibold text-violet-950 uppercase tracking-wider">
              DPIIT Recognition Certificate Number *
            </label>
            <div className="relative">
              <Award className="w-4 h-4 text-violet-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={dpiitNumber}
                onChange={(e) => setDpiitNumber(e.target.value)}
                placeholder="e.g. DIPP followed by 6 digits"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-violet-200 bg-white text-sm font-mono text-neutral-900 outline-none focus:border-violet-600"
                required
              />
            </div>
            <p className="text-[11px] text-violet-700">
              Found on your official Certificate of Recognition issued by DPIIT.
            </p>
          </div>
        )}
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
