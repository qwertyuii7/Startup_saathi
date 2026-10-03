"use client";

import { useState } from "react";
import { 
  CheckSquare, 
  Clock, 
  Key, 
  ArrowRight, 
  CheckCircle2, 
  Upload, 
  Building2, 
  FileText,
  Sparkles 
} from "lucide-react";
import { ActionItem } from "@/types/deep-analysis";

interface ActionPlanSectionProps {
  actionItems: ActionItem[];
  onTriggerAction: (item: ActionItem) => void;
}

export function ActionPlanSection({
  actionItems,
  onTriggerAction,
}: ActionPlanSectionProps) {
  const [items, setItems] = useState<ActionItem[]>(actionItems);

  const toggleComplete = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = items.filter(i => i.completed).length;

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-7 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-neutral-900 text-lg tracking-tight">
              Path to Eligibility
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Complete these prioritized steps to unlock additional high-value government funding.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 self-start sm:self-auto">
          <span className="text-xs font-semibold text-neutral-700">
            {completedCount} of {items.length} completed
          </span>
        </div>
      </div>

      {/* Numbered Action Roadmap Timeline */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`border rounded-xl p-4 sm:p-5 transition-all ${
              item.completed
                ? "bg-neutral-50/70 border-neutral-200 opacity-75"
                : "bg-white border-neutral-200 hover:border-violet-200 shadow-2xs"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              
              {/* Step Number + Description */}
              <div className="flex items-start gap-4">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                  item.completed 
                    ? "bg-emerald-100 text-emerald-800" 
                    : "bg-neutral-100 text-neutral-800 border border-neutral-200"
                }`}>
                  {item.completed ? "✓" : item.stepNumber}
                </span>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.2 bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase rounded">
                      {item.category}
                    </span>
                    <h4 className={`text-sm sm:text-base font-bold ${
                      item.completed ? "line-through text-neutral-500" : "text-neutral-900"
                    }`}>
                      {item.title}
                    </h4>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  {/* Effort & Unlocked Schemes Pill */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-neutral-500 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-200/60">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Estimated effort: <strong>{item.estimatedEffort}</strong></span>
                    </div>

                    <div className="flex items-center gap-1 text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200/80 font-medium">
                      <Key className="w-3.5 h-3.5 text-violet-600" />
                      <span>Unlocks <strong>{item.unlocksCount} schemes</strong> ({item.unlocksDescription})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => toggleComplete(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                    item.completed
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold"
                      : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"
                  }`}
                >
                  {item.completed ? "Mark Incomplete" : "Mark as Done"}
                </button>

                {!item.completed && (
                  <button
                    type="button"
                    onClick={() => onTriggerAction(item)}
                    className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
