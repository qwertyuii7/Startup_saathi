import { ShieldAlert, ShieldCheck, CheckCircle2, Circle } from "lucide-react";

export function HealthSection({ health, tokens, onFix }: any) {

  const SectionBreakdown = ({ title, score, details, sectionId }: any) => {
    return (
      <div className={`p-6 rounded-2xl border ${tokens.border} ${tokens.cardBg} mb-6`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className={`text-sm ${tokens.textMuted}`}>Completeness: {score}%</p>
          </div>
          <button 
            onClick={() => onFix(sectionId)}
            className="px-4 py-2 bg-violet-600/10 text-violet-500 rounded-lg text-sm font-medium hover:bg-violet-600/20 transition-colors"
          >
            Complete Section
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.map((item: any, i: number) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${item.completed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <Circle className="w-5 h-5 text-amber-500" />
              )}
              <span className={`text-sm ${item.completed ? '' : 'text-amber-500 font-medium'}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className={`p-8 rounded-2xl border ${tokens.border} bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 flex items-center justify-between`}>
        <div>
          <h1 className="text-3xl font-display font-medium tracking-tight mb-2">Profile Health: {health.overallScore}%</h1>
          <p className={tokens.textMuted}>A higher health score ensures precise eligibility matching and higher confidence in RAG analysis.</p>
        </div>
        {health.overallScore > 80 ? <ShieldCheck className="w-16 h-16 text-emerald-500" /> : <ShieldAlert className="w-16 h-16 text-amber-500" />}
      </div>

      <SectionBreakdown title="Founder Information" score={health.founderScore} details={health.details.founder} sectionId="founder" />
      <SectionBreakdown title="Startup Identity" score={health.startupScore} details={health.details.startup} sectionId="startup" />
      <SectionBreakdown title="Legal & Registration" score={health.legalScore} details={health.details.legal} sectionId="legal" />
      <SectionBreakdown title="Business & Market" score={health.businessScore} details={health.details.business} sectionId="business" />
    </div>
  );
}
