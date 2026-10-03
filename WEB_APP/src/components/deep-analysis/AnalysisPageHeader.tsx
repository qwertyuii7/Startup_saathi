import { ReactNode } from "react";
import { Filter, Search, Download, Sparkles } from "lucide-react";

interface Props {
  title: string;
  description: string;
  status?: string;
  updatedAt?: string;
  children?: ReactNode; // For actions
}

export function AnalysisPageHeader({ title, description, status = "Completed", updatedAt, children }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">{title}</h1>
        <p className="text-sm text-neutral-500 max-w-2xl leading-relaxed">{description}</p>
        
        <div className="flex items-center gap-3 mt-4">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {status}
          </span>
          {updatedAt && (
            <span className="text-xs font-medium text-neutral-400">
              Updated {new Date(updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {children}
        <button className="h-9 px-3 flex items-center gap-2 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg text-xs font-bold text-neutral-700 transition-colors shadow-sm">
          <Filter className="w-3.5 h-3.5" /> Filter
        </button>
        <button className="h-9 px-3 flex items-center gap-2 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg text-xs font-bold text-neutral-700 transition-colors shadow-sm">
          <Search className="w-3.5 h-3.5" /> Search
        </button>
        <button className="h-9 px-3 flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-xs font-bold text-white transition-colors shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Ask AROVA
        </button>
      </div>
    </div>
  );
}
