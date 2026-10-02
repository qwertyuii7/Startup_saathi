import { CheckSquare, UploadCloud, Edit3, ArrowRight } from "lucide-react";

export default function PlanPage() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col pt-8 pb-24">
      
      <div className="mb-8">
        <h2 className="text-3xl font-medium tracking-tight text-neutral-900 mb-2">Action Plan</h2>
        <p className="text-neutral-500">Track your active applications and prepare required documents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Application Card */}
        <div className="col-span-1 md:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-neutral-900 text-lg">Seed Fund Scheme</h3>
            <span className="px-2.5 py-1 bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider rounded-md">Drafting</span>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-neutral-600 line-through">DPIIT Certificate</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-neutral-600 line-through">Incorporation Doc</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-neutral-300 rounded-sm shrink-0" />
              <span className="text-sm text-neutral-900 font-medium">Audited Financials (Gap)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2">
              <Edit3 className="w-4 h-4" /> Open Draft Editor
            </button>
            <button className="px-4 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-sm font-medium transition-colors">
              Upload Missing
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
