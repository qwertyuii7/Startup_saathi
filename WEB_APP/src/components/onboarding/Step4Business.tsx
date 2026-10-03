"use client";

import React, { useState } from "react";
import { IndianRupee, Landmark, TrendingUp, ArrowRight, ArrowLeft } from "lucide-react";

interface Step4BusinessProps {
  initialData: {
    revenueRange?: string;
    fundingStatus?: string;
    previousGovernmentFunding?: string | boolean;
    governmentFundingDetails?: string;
    annualTurnover?: number;
  };
  onBack: () => void;
  onNext: (data: {
    revenueRange: string;
    fundingStatus: string;
    previousGovernmentFunding: "Yes" | "No" | "Not Sure";
    governmentFundingDetails: string;
    annualTurnover: number;
  }) => void;
  isSaving?: boolean;
}

export function Step4Business({ initialData, onBack, onNext, isSaving }: Step4BusinessProps) {
  const [revenueRange, setRevenueRange] = useState(initialData.revenueRange || "");
  const [fundingStatus, setFundingStatus] = useState(initialData.fundingStatus || "");

  const normalizedPrevFunding =
    typeof initialData.previousGovernmentFunding === "boolean"
      ? initialData.previousGovernmentFunding ? "Yes" : "No"
      : (initialData.previousGovernmentFunding as "Yes" | "No" | "Not Sure" | undefined) || "Not Sure";

  const [previousGovtFunding, setPreviousGovtFunding] = useState<"Yes" | "No" | "Not Sure">(
    normalizedPrevFunding
  );
  const [fundingDetails, setFundingDetails] = useState(
    initialData.governmentFundingDetails || ""
  );
  const [turnover, setTurnover] = useState(
    initialData.annualTurnover ? String(initialData.annualTurnover) : ""
  );
  const [error, setError] = useState("");

  const revenueRanges = [
    "Pre-revenue",
    "Below ₹10L",
    "₹10L–₹50L",
    "₹50L–₹1Cr",
    "₹1Cr–₹5Cr",
    "₹5Cr+",
  ];

  const fundingStatuses = [
    "Bootstrapped",
    "Angel",
    "Seed",
    "VC",
    "Other",
    "No Funding",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revenueRange) {
      setError("Please select your revenue range.");
      return;
    }
    if (!fundingStatus) {
      setError("Please select your funding status.");
      return;
    }
    setError("");
    onNext({
      revenueRange,
      fundingStatus,
      previousGovernmentFunding: previousGovtFunding,
      governmentFundingDetails: fundingDetails.trim(),
      annualTurnover: turnover ? Number(turnover) : 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">
          Help us understand your business
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Turnover thresholds determine non-duplication compliance and scale grant eligibility.
        </p>
      </div>

      <div className="space-y-4">
        {/* Revenue Range */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
            Current Annual Revenue Range
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {revenueRanges.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setRevenueRange(range)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  revenueRange === range
                    ? "border-violet-600 bg-violet-50 text-violet-700 shadow-2xs"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Funding Stage */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
            External Funding Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {fundingStatuses.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFundingStatus(st)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  fundingStatus === st
                    ? "border-violet-600 bg-violet-50 text-violet-700 shadow-2xs"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Approximate Turnover */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Estimated Annual Turnover (in INR ₹)
          </label>
          <div className="relative">
            <IndianRupee className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="number"
              value={turnover}
              onChange={(e) => setTurnover(e.target.value)}
              placeholder="e.g. 2500000 (enter 0 if pre-revenue)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-violet-600"
            />
          </div>
        </div>

        {/* Prior Government Grants / Funding */}
        <div className="pt-2 border-t border-neutral-100">
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
            Has your startup received prior Central or State monetary support?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["Yes", "No", "Not Sure"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setPreviousGovtFunding(opt)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  previousGovtFunding === opt
                    ? "border-violet-600 bg-violet-50 text-violet-700 shadow-2xs"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional prior funding details */}
        {previousGovtFunding === "Yes" && (
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5 animate-in fade-in duration-200">
            <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              Prior Grant Scheme Name & Amount (Optional)
            </label>
            <input
              type="text"
              value={fundingDetails}
              onChange={(e) => setFundingDetails(e.target.value)}
              placeholder="e.g. State prototype grant with amount (optional)"
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 outline-none focus:border-violet-600"
            />
            <p className="text-[11px] text-neutral-500">
              Schemes like SISFS have a ₹10 Lakhs prior monetary support cap.
            </p>
          </div>
        )}
      </div>

      {/* Form Actions */}
      {error && (
        <p role="alert" className="text-xs text-red-600 font-medium">{error}</p>
      )}
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
