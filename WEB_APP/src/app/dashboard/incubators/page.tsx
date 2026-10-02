import { Building2, MapPin } from "lucide-react";

export default function IncubatorsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col pt-8 pb-24">
      <div className="mb-8">
        <h2 className="text-3xl font-medium tracking-tight text-neutral-900 mb-2">Incubator Matches</h2>
        <p className="text-neutral-500">Accelerators and incubators matched to your sector and stage.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-medium text-neutral-900 text-lg mb-1">T-Hub Hyderabad</h3>
          <div className="flex items-center gap-1 text-sm text-neutral-500 mb-4">
            <MapPin className="w-3 h-3" /> Hyderabad, Telangana
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-2 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-md">Tech Sector</span>
            <span className="px-2 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-md">Seed Stage</span>
          </div>
          <button className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl text-sm font-medium transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
