import { User, Shield } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col pt-8 pb-24">
      <div className="mb-8">
        <h2 className="text-3xl font-medium tracking-tight text-neutral-900 mb-2">Startup Profile</h2>
        <p className="text-neutral-500">The deterministic source of truth for your AI matches.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-6 mb-6">
        <h3 className="font-medium text-neutral-900 text-lg mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-violet-600" /> Basics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="text-xs text-neutral-500 mb-1">Sector</div>
            <div className="font-medium text-neutral-900">Artificial Intelligence</div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="text-xs text-neutral-500 mb-1">Stage</div>
            <div className="font-medium text-neutral-900">Early Traction</div>
          </div>
        </div>
      </div>

    </div>
  );
}
