"use client";

import { 
  Building2, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  IndianRupee, 
  Users, 
  Coins, 
  Clock, 
  Edit3, 
  AlertCircle 
} from "lucide-react";
import { StartupContext } from "@/types/deep-analysis";

interface StartupContextCardProps {
  context: StartupContext;
  onEditProfile: () => void;
}

export function StartupContextCard({
  context,
  onEditProfile,
}: StartupContextCardProps) {
  const fields = [
    { label: "Stage", value: context.stage, icon: Coins },
    { label: "Industry", value: context.industry, icon: Building2 },
    { label: "Location", value: context.location, icon: MapPin },
    { label: "Incorporation", value: `${context.incorporationYear} (${context.incorporationDate})`, icon: Calendar },
    { 
      label: "DPIIT Status", 
      value: context.dpiitVerified ? `Verified (${context.dpiitNumber})` : "Unverified", 
      icon: ShieldCheck,
      isVerified: context.dpiitVerified 
    },
    { label: "Turnover", value: context.turnover, icon: IndianRupee },
    { label: "Employees", value: `${context.employees} Members`, icon: Users },
    { label: "Funding", value: context.funding, icon: Coins },
    { label: "Startup Age", value: context.startupAge, icon: Clock },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center font-bold text-sm">
            {context.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-900 text-base">
                {context.name}
              </h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                DPIIT Active
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              CIN: {context.cinNumber} • GST: {context.gstNumber}
            </p>
          </div>
        </div>

        {/* Warning / Complete Profile Actions */}
        <div className="flex items-center gap-2.5">
          {context.missingDetailsCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{context.missingDetailsCount} detail missing</span>
            </div>
          )}

          <button
            onClick={onEditProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-violet-700 bg-neutral-100 hover:bg-violet-50 border border-neutral-200 hover:border-violet-200 rounded-xl transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Grid of Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-y-4 gap-x-4">
        {fields.map((field, idx) => {
          const Icon = field.icon;
          return (
            <div key={idx} className="bg-neutral-50/70 border border-neutral-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 mb-1">
                <Icon className="w-3.5 h-3.5 text-neutral-400" />
                <span>{field.label}</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-800 truncate">
                {field.isVerified ? (
                  <span className="text-emerald-700 font-semibold">{field.value}</span>
                ) : (
                  field.value
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
