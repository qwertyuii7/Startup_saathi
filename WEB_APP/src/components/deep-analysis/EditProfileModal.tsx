"use client";

import { useState } from "react";
import { X, Building2, Check, ShieldCheck, Save } from "lucide-react";
import { StartupContext } from "@/types/deep-analysis";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: StartupContext;
  onSave: (updated: StartupContext) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  context,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<StartupContext>(context);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/startup/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } catch (err) {
      console.warn("Profile update error:", err);
    }
    onSave({
      ...formData,
      missingDetailsCount: 0,
    });
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50"
        onClick={onClose} 
      />

      <div className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[600px] max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50 border border-neutral-200 p-6 animate-in fade-in-50 zoom-in-95">
        
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">
                Edit Startup Profile
              </h3>
              <p className="text-xs text-neutral-400">
                Data used by SchemeSense to cross-check statutory eligibility rules
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Legal Entity Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Registered Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Industry / Sector
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Startup Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:border-violet-400 focus:bg-white"
              >
                <option value="Idea / Pre-Seed">Idea / Pre-Seed</option>
                <option value="Early Stage">Early Stage</option>
                <option value="Seed Stage">Seed Stage</option>
                <option value="Growth Stage">Growth Stage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                DPIIT Recognition Number
              </label>
              <input
                type="text"
                value={formData.dpiitNumber}
                onChange={(e) => setFormData({ ...formData, dpiitNumber: e.target.value })}
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Annual Turnover
              </label>
              <input
                type="text"
                value={formData.turnover}
                onChange={(e) => setFormData({ ...formData, turnover: e.target.value })}
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Full-Time Employees
              </label>
              <input
                type="number"
                value={formData.employees}
                onChange={(e) => setFormData({ ...formData, employees: parseInt(e.target.value) || 0 })}
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Funding Structure
              </label>
              <input
                type="text"
                value={formData.funding}
                onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
                className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Update Profile</span>
            </button>
          </div>

        </form>

      </div>
    </>
  );
}
