"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Building2, 
  Scale, 
  IndianRupee, 
  FileText, 
  CheckCircle2, 
  Save, 
  Loader2, 
  Award,
  Globe,
  MapPin,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

const EMPTY_FORM = {
  founderName: "",
  founderEmail: "",
  founderPhone: "",
  founderRole: "",
  name: "",
  description: "",
  industry: "",
  sector: "",
  stage: "",
  website: "",
  entityType: "",
  incorporationDate: "",
  state: "",
  city: "",
  dpiitStatus: "Not Sure",
  dpiitNumber: "",
  annualTurnover: 0,
  turnoverDisplay: "",
  revenueRange: "",
  fundingStatus: "",
  previousGovernmentFunding: "Not Sure",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"founder" | "startup" | "legal" | "financials">("startup");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Form State — starts empty; hydrated ONLY from the backend record.
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const res = await api.startup.getProfile();
        if (cancelled) return;
        if (res.success && res.startup) {
          const s = res.startup;
          setFormData({
            // Editable profile fields — real persisted values only.
            founderName: s.founderName || "",
            founderEmail: s.founderEmail || "",
            founderPhone: s.founderPhone || "",
            founderRole: s.founderRole || "",
            name: s.name || s.startupName || "",
            description: s.description || s.summary || "",
            industry: s.industry || "",
            sector: s.sector || "",
            stage: s.stage || s.startupStage || "",
            website: s.website || "",
            entityType: s.entityType || s.legalEntity || "",
            incorporationDate: s.incorporationDate || "",
            state: s.state || "",
            city: s.city || "",
            dpiitStatus: typeof s.dpiitStatus === "boolean" ? (s.dpiitStatus ? "Yes" : "No") : s.dpiitStatus || "Not Sure",
            dpiitNumber: s.dpiitNumber || s.dpiitRecognitionNumber || "",
            annualTurnover: typeof s.annualTurnover === "number" ? s.annualTurnover : 0,
            turnoverDisplay: s.turnoverDisplay || "",
            revenueRange: s.revenueRange || "",
            fundingStatus: s.fundingStatus || s.fundingStage || "",
            previousGovernmentFunding: typeof s.previousGovernmentFunding === "boolean" ? (s.previousGovernmentFunding ? "Yes" : "No") : s.previousGovernmentFunding || "Not Sure",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setSaveError(err instanceof Error ? err.message : "Could not load your profile.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
    setSaveError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    setSaveError("");

    try {
      const res = await api.startup.updateProfile({
        ...formData,
        dpiitStatus: formData.dpiitStatus === "Yes",
        dpiitRecognitionNumber: formData.dpiitNumber,
      });
      if (!res.success) {
        throw new Error("Profile update was not saved.");
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Could not save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
        <span className="text-xs font-semibold">Loading startup profile dossier...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Startup Profile Dossier</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Deterministic ground-truth parameters evaluated by statutory eligibility engines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in duration-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved Successfully</span>
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Google identity vs editable profile fields */}
      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="text-xs text-neutral-600">
          <span className="font-bold text-neutral-900">Signed in with Google as </span>
          <span className="font-semibold">{user?.name || "—"}</span>
          <span className="text-neutral-400"> ({user?.email || "—"})</span>
          <span className="block text-[11px] text-neutral-400 mt-0.5">
            Google identity fields are read-only. Founder display fields below are editable profile fields.
          </span>
        </div>
      </div>

      {saveError && (
        <div role="alert" className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
          {saveError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        {[
          { id: "startup", label: "Startup Basics", icon: Building2 },
          { id: "legal", label: "Legal & DPIIT", icon: Scale },
          { id: "financials", label: "Funding & Financials", icon: IndianRupee },
          { id: "founder", label: "Founder Details", icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-violet-600 text-white shadow-2xs"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200/90 shadow-2xs space-y-6">
        {/* Startup Basics Tab */}
        {activeTab === "startup" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Startup / Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-900 outline-none focus:border-violet-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Company Description & Summary *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full p-4 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-violet-600 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Industry / Sector
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Startup Stage
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleChange("stage", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 outline-none focus:border-violet-600"
                >
                  <option value="" disabled>Select stage…</option>
                  <option value="Idea">Idea / Pre-Seed</option>
                  <option value="Early Stage">Early Stage</option>
                  <option value="Seed Stage">Seed Stage</option>
                  <option value="Growth Stage">Growth Stage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Website URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-violet-600"
              />
            </div>
          </div>
        )}

        {/* Legal & DPIIT Tab */}
        {activeTab === "legal" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Legal Entity Structure
                </label>
                <select
                  value={formData.entityType}
                  onChange={(e) => handleChange("entityType", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 outline-none focus:border-violet-600"
                >
                  <option value="" disabled>Select entity type…</option>
                  <option value="Private Limited Company">Private Limited Company</option>
                  <option value="LLP">LLP</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Incorporation Date
                </label>
                <input
                  type="date"
                  value={formData.incorporationDate}
                  onChange={(e) => handleChange("incorporationDate", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-violet-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Registered State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Registered City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-violet-600"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-violet-950 uppercase tracking-wider">
                    DPIIT Startup India Recognition
                  </h4>
                  <p className="text-[11px] text-violet-700 mt-0.5">
                    Certified recognition under Department for Promotion of Industry and Internal Trade.
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  formData.dpiitStatus === "Yes" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-600"
                }`}>
                  {formData.dpiitStatus === "Yes" ? "Recognized" : formData.dpiitStatus}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Recognition Number (DIPP)
                </label>
                <input
                  type="text"
                  value={formData.dpiitNumber}
                  onChange={(e) => handleChange("dpiitNumber", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-violet-200 bg-white font-mono text-xs font-bold text-neutral-900 outline-none focus:border-violet-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Funding & Financials Tab */}
        {activeTab === "financials" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Revenue Range
                </label>
                <select
                  value={formData.revenueRange}
                  onChange={(e) => handleChange("revenueRange", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 outline-none focus:border-violet-600"
                >
                  <option value="" disabled>Select range…</option>
                  <option value="Pre-revenue">Pre-revenue</option>
                  <option value="Below ₹10L">Below ₹10L</option>
                  <option value="₹10L–₹50L">₹10L–₹50L</option>
                  <option value="₹50L–₹1Cr">₹50L–₹1Cr</option>
                  <option value="₹1Cr–₹5Cr">₹1Cr–₹5Cr</option>
                  <option value="₹5Cr+">₹5Cr+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  External Funding Status
                </label>
                <select
                  value={formData.fundingStatus}
                  onChange={(e) => handleChange("fundingStatus", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 outline-none focus:border-violet-600"
                >
                  <option value="" disabled>Select status…</option>
                  <option value="Bootstrapped">Bootstrapped</option>
                  <option value="Angel">Angel / Pre-Seed</option>
                  <option value="Seed">Seed Funded</option>
                  <option value="VC">VC / Series A+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Annual Turnover (in INR ₹)
              </label>
              <input
                type="number"
                value={formData.annualTurnover}
                onChange={(e) => handleChange("annualTurnover", Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-violet-600"
              />
            </div>
          </div>
        )}

        {/* Founder Details Tab */}
        {activeTab === "founder" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Founder Full Name *
              </label>
              <input
                type="text"
                value={formData.founderName}
                onChange={(e) => handleChange("founderName", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-violet-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Founder Email
                </label>
                <input
                  type="email"
                  value={formData.founderEmail}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-600 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Founder Phone
                </label>
                <input
                  type="tel"
                  value={formData.founderPhone}
                  onChange={(e) => handleChange("founderPhone", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-violet-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Designation / Role
              </label>
              <input
                type="text"
                value={formData.founderRole}
                onChange={(e) => handleChange("founderRole", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-violet-600"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
