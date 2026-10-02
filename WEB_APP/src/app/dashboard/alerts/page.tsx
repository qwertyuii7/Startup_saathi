import { Bell, AlertTriangle } from "lucide-react";

export default function AlertsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col pt-8 pb-24">
      <div className="mb-8">
        <h2 className="text-3xl font-medium tracking-tight text-neutral-900 mb-2">Policy Alerts</h2>
        <p className="text-neutral-500">Live updates on government rules that affect you.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-neutral-900 text-white text-[10px] uppercase font-bold tracking-wider rounded-md">Affects You</span>
              <span className="text-xs text-neutral-400">2 days ago</span>
            </div>
            <h4 className="font-medium text-neutral-900 mb-1">Turnover limit raised ₹25L → ₹50L</h4>
            <p className="text-sm text-neutral-600 mb-3">The Seed Fund Scheme has updated its eligibility clause regarding maximum turnover.</p>
            <button className="text-sm text-violet-600 font-medium hover:underline">Re-check eligibility</button>
          </div>
        </div>
      </div>
    </div>
  );
}
