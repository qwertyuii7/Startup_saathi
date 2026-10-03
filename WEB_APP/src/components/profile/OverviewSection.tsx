import { Building2, User } from "lucide-react";

export function OverviewSection({ data, tokens, mode, onNavigate }: any) {
  const { founder, startup, health } = data;

  const CompletionBar = ({ score, label }: { score: number, label: string }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="font-medium">{label}</span>
        <span className={tokens.textMuted}>{score}%</span>
      </div>
      <div className={`w-full h-2 rounded-full overflow-hidden ${mode === 'deep-analysis' ? 'bg-white/10' : 'bg-neutral-200'}`}>
        <div 
          className="h-full bg-violet-500 transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-medium tracking-tight mb-2">Workspace Overview</h1>
        <p className={tokens.textMuted}>Manage your personal and startup intelligence profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Founder Card */}
        <div className={`p-6 rounded-2xl border ${tokens.border} ${tokens.cardBg}`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-medium">
                {founder.fullName?.charAt(0) || <User />}
              </div>
              <div>
                <h3 className="text-lg font-medium">{founder.fullName || "Update your name"}</h3>
                <p className={`text-sm ${tokens.textMuted}`}>{founder.role || "Founder"}</p>
              </div>
            </div>
            <button onClick={() => onNavigate("founder")} className={`text-sm font-medium text-violet-500 hover:text-violet-400 transition-colors`}>Edit</button>
          </div>
          
          <div className="space-y-3">
             <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className={tokens.textMuted}>Location</span>
                <span className="font-medium">{founder.location || "—"}</span>
             </div>
             <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className={tokens.textMuted}>Email</span>
                <span className="font-medium">{founder.email || "—"}</span>
             </div>
          </div>
        </div>

        {/* Startup Card */}
        <div className={`p-6 rounded-2xl border ${tokens.border} ${tokens.cardBg}`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${mode === 'deep-analysis' ? 'bg-white/5' : 'bg-neutral-100'}`}>
                {startup.logo ? (
                  <img src={startup.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Building2 className={`w-8 h-8 ${tokens.textMuted}`} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium">{startup.startupName || startup.name || "Unnamed Startup"}</h3>
                <p className={`text-sm ${tokens.textMuted}`}>{startup.industry || "Setup your industry"}</p>
              </div>
            </div>
            <button onClick={() => onNavigate("startup")} className={`text-sm font-medium text-violet-500 hover:text-violet-400 transition-colors`}>Edit</button>
          </div>
          
          <div className="space-y-3">
             <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className={tokens.textMuted}>Stage</span>
                <span className="font-medium">{startup.startupStage || startup.stage || "—"}</span>
             </div>
             <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className={tokens.textMuted}>Location</span>
                <span className="font-medium">{startup.city ? `${startup.city}, ${startup.state}` : "—"}</span>
             </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${tokens.border} ${tokens.cardBg}`}>
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Profile Readiness</h2>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium">
               {health.overallScore}% Complete
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <CompletionBar score={health.founderScore} label="Founder Information" />
            <CompletionBar score={health.startupScore} label="Startup Information" />
            <CompletionBar score={health.legalScore} label="Legal & Registration" />
            <CompletionBar score={health.businessScore} label="Business & Financials" />
         </div>
         <div className="mt-4 pt-4 border-t border-white/5">
            <button onClick={() => onNavigate("health")} className="text-sm font-medium text-violet-500 hover:text-violet-400 transition-colors">
               View detailed health report &rarr;
            </button>
         </div>
      </div>

    </div>
  );
}
