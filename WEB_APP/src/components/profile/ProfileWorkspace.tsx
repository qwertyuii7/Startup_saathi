"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Building2, Briefcase, FileText, Activity, Shield, 
  Settings, LogOut, ChevronRight, UploadCloud, AlertCircle, Edit3, X, Save, Scale, Coins
} from "lucide-react";
import { OverviewSection } from "./OverviewSection";
import { FormsSection } from "./FormsSection";
import { HealthSection } from "./HealthSection";
import { DocumentSection } from "./DocumentSection";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export interface ProfileWorkspaceProps {
  mode: "dashboard" | "deep-analysis";
  analysisId?: string;
}

export type SectionType = "overview" | "founder" | "startup" | "legal" | "business" | "financial" | "team" | "documents" | "health" | "security";

export function ProfileWorkspace({ mode, analysisId }: ProfileWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSection = (searchParams.get("section") as SectionType) || "overview";
  
  const [activeSection, setActiveSection] = useState<SectionType>(initialSection);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ founder: any; startup: any; documents: any[]; health: any } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // for mobile

  const isDark = mode === "deep-analysis";
  
  // Design system tokens based on mode
  const tokens = {
    bg: isDark ? "bg-[#0A0A0A]" : "bg-[#FAFAFA]",
    text: isDark ? "text-white" : "text-neutral-900",
    textMuted: isDark ? "text-neutral-400" : "text-neutral-500",
    border: isDark ? "border-white/10" : "border-neutral-200",
    cardBg: isDark ? "bg-[#111]" : "bg-white",
    cardHover: isDark ? "hover:bg-white/5" : "hover:bg-neutral-50",
    primaryBg: isDark ? "bg-violet-600" : "bg-violet-600",
    primaryText: "text-white",
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (section: string, payload: any) => {
    try {
      const res = await fetch(`/api/profile/${section}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchProfile(); // re-fetch to update completeness health
      }
    } catch (e) {
      console.error(e);
    }
  };

  const navigation = [
    { id: "overview", label: "Overview", icon: Activity, group: "PROFILE" },
    { id: "founder", label: "Founder details", icon: User, group: "PROFILE" },
    { id: "startup", label: "Startup identity", icon: Building2, group: "PROFILE" },
    { id: "legal", label: "Legal & Registration", icon: Scale, group: "PROFILE" },
    { id: "business", label: "Business & Market", icon: Briefcase, group: "PROFILE" },
    { id: "financial", label: "Financials", icon: Coins, group: "PROFILE" },
    { id: "documents", label: "Documents", icon: FileText, group: "INTELLIGENCE" },
    { id: "health", label: "Profile Health", icon: Shield, group: "INTELLIGENCE" },
    { id: "security", label: "Security & Prefs", icon: Settings, group: "ACCOUNT" },
  ] as const;

  if (loading) {
    return (
      <div className={`w-full h-screen flex items-center justify-center ${tokens.bg} ${tokens.text}`}>
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mb-4" />
          Loading Workspace...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`w-full h-screen flex flex-col items-center justify-center ${tokens.bg} ${tokens.text}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-medium mb-2">Failed to load profile</h2>
        <button onClick={fetchProfile} className="px-4 py-2 bg-violet-600 text-white rounded-lg">Retry</button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview": return <OverviewSection data={data} tokens={tokens} mode={mode} onNavigate={(s: any) => setActiveSection(s as SectionType)} />;
      case "founder": return <FormsSection section="founder" data={data.founder} tokens={tokens} onSave={(p: any) => handleSave("founder", p)} />;
      case "startup": return <FormsSection section="startup" data={data.startup} tokens={tokens} onSave={(p: any) => handleSave("startup", p)} />;
      case "legal": return <FormsSection section="legal" data={data.startup} tokens={tokens} onSave={(p: any) => handleSave("legal", p)} />;
      case "business": return <FormsSection section="business" data={data.startup} tokens={tokens} onSave={(p: any) => handleSave("business", p)} />;
      case "financial": return <FormsSection section="financial" data={data.startup} tokens={tokens} onSave={(p: any) => handleSave("financial", p)} />;
      case "documents": return <DocumentSection documents={data.documents} tokens={tokens} onRefresh={fetchProfile} />;
      case "health": return <HealthSection health={data.health} tokens={tokens} onFix={(s: any) => setActiveSection(s as SectionType)} />;
      case "security": return <div className={`p-8 ${tokens.cardBg} rounded-xl border ${tokens.border}`}>Security settings coming soon.</div>;
      default: return null;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${tokens.bg} ${tokens.text} font-default`}>
      {/* Mobile Header / Nav Toggle */}
      <div className={`md:hidden flex items-center justify-between p-4 border-b ${tokens.border} ${tokens.cardBg} sticky top-0 z-50`}>
        <div className="font-display font-medium text-lg">AROVA Workspace</div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 ${tokens.cardBg} border-r ${tokens.border} transform transition-transform duration-300
        md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 h-full flex flex-col overflow-y-auto">
          <div className="hidden md:flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold font-serif">
              A
            </div>
            <span className="font-display font-medium tracking-tight text-xl">Workspace</span>
          </div>

          <div className="flex-1 space-y-8">
            {["PROFILE", "INTELLIGENCE", "ACCOUNT"].map((groupName) => (
              <div key={groupName}>
                <div className={`text-xs font-semibold tracking-wider ${tokens.textMuted} mb-3 ml-2`}>{groupName}</div>
                <nav className="space-y-1">
                  {navigation.filter(n => n.group === groupName).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveSection(item.id as SectionType); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                        activeSection === item.id 
                          ? `${isDark ? 'bg-white/10 text-white' : 'bg-neutral-100 text-neutral-900'}` 
                          : `${tokens.textMuted} ${tokens.cardHover}`
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            {mode === "deep-analysis" && analysisId ? (
               <Link href={`/deep-analysis?id=${analysisId}`} className={`flex items-center gap-2 text-sm ${tokens.textMuted} hover:text-white transition-colors`}>
                 <ChevronRight className="w-4 h-4 rotate-180" /> Back to Analysis
               </Link>
            ) : (
               <Link href="/dashboard" className={`flex items-center gap-2 text-sm ${tokens.textMuted} hover:text-neutral-900 transition-colors`}>
                 <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
               </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {mode === "deep-analysis" && (
          <div className="w-full bg-violet-600/10 border-b border-violet-500/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-200">Deep Analysis Context Active</span>
            </div>
            <span className="text-xs text-violet-300 hidden sm:inline-block">Profile changes will immediately influence scheme intelligence.</span>
          </div>
        )}
        
        <div className="max-w-5xl mx-auto p-6 md:p-10 lg:p-12">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeSection}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
               {renderContent()}
             </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
