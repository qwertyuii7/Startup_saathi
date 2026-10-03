"use client";

import React, { useState } from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, Kanban, CheckCircle2, AlertCircle, Clock, Check } from "lucide-react";

export default function ActionPlanPage() {
  const { analysis, isLoading, error } = useWorkspaceAnalysis();
  const [filter, setFilter] = useState("ALL");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Execution Workspace...</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Analysis Unavailable</h2>
        <p className="text-sm text-neutral-500">Please start a new Deep Analysis.</p>
      </div>
    );
  }

  const tasks = analysis.actionPlan || [];
  
  const getIconForType = (type: string) => {
    if (type.includes("DO NOW")) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (type.includes("WAITING")) return <Clock className="w-4 h-4 text-amber-500" />;
    if (type.includes("COMPLETED")) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    return <Kanban className="w-4 h-4 text-violet-500" />;
  };

  return (
    <div className="space-y-8 pb-24 h-full">
      <AnalysisPageHeader 
        title="Execution Workspace" 
        description="A deterministic action plan dynamically generated to resolve your missing evidence and compliance gaps."
        status={analysis.status}
        updatedAt={analysis.updatedAt}
      />

      <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-xl inline-flex overflow-x-auto max-w-full">
        {["ALL", "DO_NOW", "NEXT", "WAITING", "BLOCKED", "COMPLETED"].map(t => (
          <button 
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              filter === t ? "bg-white text-violet-700 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {t.replace("_", " ")}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
         <div className="p-12 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50">
            <h3 className="text-lg font-bold text-neutral-900 mb-1">No Actions Required</h3>
            <p className="text-sm text-neutral-500">Your startup is fully ready with no missing evidence or blocking gaps.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.filter(t => filter === "ALL" || t.category === filter).map(task => (
             <div key={task.id} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:border-violet-300 transition-all flex flex-col justify-between group">
               <div>
                 <div className="flex items-start justify-between mb-3">
                   <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                     task.category === 'DO_NOW' ? 'bg-red-50 text-red-700 border border-red-100' :
                     task.category === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                     'bg-neutral-100 text-neutral-700 border border-neutral-200'
                   }`}>
                     {getIconForType(task.category)} {task.category.replace("_", " ")}
                   </div>
                   <div className="text-xs font-bold text-neutral-400">Step {task.stepNumber}</div>
                 </div>
                 
                 <h3 className="text-base font-bold text-neutral-900 leading-tight mb-2">{task.title}</h3>
                 <p className="text-sm text-neutral-600 leading-relaxed mb-4">{task.description}</p>
               </div>
               
               <div className="pt-4 border-t border-neutral-100 space-y-3">
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-neutral-500 font-medium">Unlocks</span>
                   <span className="font-bold text-emerald-600">{task.unlocksCount} schemes</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-neutral-500 font-medium">Effort</span>
                   <span className="font-bold text-neutral-900">{task.estimatedEffort}</span>
                 </div>
                 
                 <div className="flex gap-2 mt-4 pt-4">
                    <button className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-violet-700 transition-colors">
                      {task.actionLabel}
                    </button>
                    {!task.completed && (
                      <button className="p-2 border border-neutral-200 rounded-lg text-neutral-400 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                 </div>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
