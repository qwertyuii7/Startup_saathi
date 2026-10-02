import { Search, Filter, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function SchemesPage() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col pt-8 pb-24">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-medium tracking-tight text-neutral-900 mb-2">Scheme Discovery</h2>
          <p className="text-neutral-500">Based on your DPIIT profile, we found 14 matching schemes.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search schemes..." className="pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-violet-300 transition-colors" />
          </div>
          <button className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
            <Filter className="w-4 h-4 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-neutral-200 mb-6">
        <button className="pb-3 border-b-2 border-violet-600 text-violet-600 font-medium text-sm">
          Strong Fit <span className="ml-1 px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-md text-xs">2</span>
        </button>
        <button className="pb-3 border-b-2 border-transparent text-neutral-500 hover:text-neutral-700 font-medium text-sm transition-colors">
          Possible <span className="ml-1 px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-md text-xs">5</span>
        </button>
        <button className="pb-3 border-b-2 border-transparent text-neutral-500 hover:text-neutral-700 font-medium text-sm transition-colors">
          Not Yet <span className="ml-1 px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-md text-xs">7</span>
        </button>
      </div>

      {/* Scheme List */}
      <div className="space-y-4">
        
        {/* Scheme Row */}
        <Link href="/dashboard/schemes/seed-fund">
          <div className="group bg-white border border-neutral-200 hover:border-violet-200 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all hover:shadow-sm">
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] uppercase font-bold tracking-wider rounded-md">Central</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold tracking-wider rounded-md flex items-center gap-1">Strong Fit</span>
              </div>
              <h4 className="font-medium text-neutral-900 group-hover:text-violet-600 transition-colors text-lg mb-1">Startup India Seed Fund Scheme</h4>
              <p className="text-sm text-neutral-500">Financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization.</p>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <span className="text-xs text-neutral-500 font-medium bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">3 of 3 criteria met</span>
              <div className="w-8 h-8 rounded-full bg-neutral-50 group-hover:bg-violet-50 flex items-center justify-center transition-colors">
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-600" />
              </div>
            </div>
          </div>
        </Link>
        
        {/* Add another mock here */}

      </div>

    </div>
  );
}
