"use client";

import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Sparkles, 
  Key, 
  Check, 
  ExternalLink,
  Laptop,
  Save
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<{ founderName?: string; name?: string; startupName?: string } | null>(null);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [schemeNotifications, setSchemeNotifications] = useState(true);
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState("80");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const res = await api.startup.getProfile();
        if (cancelled) return;
        if (res?.startup) {
          const s = res.startup as {
            founderName?: string;
            name?: string;
            startupName?: string;
            preferences?: { schemeNotifications?: boolean; documentAlerts?: boolean; matchThreshold?: number };
          };
          setProfile(s);
          if (typeof s.preferences?.schemeNotifications === "boolean") {
            setSchemeNotifications(s.preferences.schemeNotifications);
          }
          if (typeof s.preferences?.documentAlerts === "boolean") {
            setEmailAlerts(s.preferences.documentAlerts);
          }
          if (typeof s.preferences?.matchThreshold === "number") {
            setAiConfidenceThreshold(String(s.preferences.matchThreshold));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setSaveError(err instanceof Error ? err.message : "Could not load settings.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError("");
    setSavedSuccess(false);
    try {
      const res = await api.startup.updateProfile({
        preferences: {
          schemeNotifications,
          documentAlerts: emailAlerts,
          matchThreshold: Number(aiConfidenceThreshold),
        },
      });
      if (!res.success) {
        throw new Error("Preferences were not saved.");
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Could not save preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
      setSaveError("Logout failed. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col pt-2 pb-24 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-wider rounded">
              Platform Configuration
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Workspace Settings
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your account security, AI intelligence preferences, and notification policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm self-start md:self-auto disabled:opacity-50"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Preferences Saved</span>
            </>
          ) : isSaving ? (
            <>
              <span>Saving…</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Account & Identity */}
        <div className="bg-white border border-neutral-200/90 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Account Identity</h2>
              <p className="text-xs text-neutral-500">Your authenticated credentials and founder identity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Google Account Email (read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                placeholder="Signed-in Google account"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Google Account Name (read-only)</label>
              <input
                type="text"
                disabled
                value={user?.name || ""}
                placeholder="Signed-in Google account"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600 cursor-not-allowed"
              />
            </div>
          </div>

          {(profile?.founderName || profile?.name || profile?.startupName) && (
            <p className="mt-3 text-[11px] text-neutral-500">
              Startup profile: {profile.founderName || profile.name || profile.startupName}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Need to update startup ownership or DPIIT credentials?</span>
            <Link href="/dashboard/profile" className="font-semibold text-violet-600 hover:text-violet-700">
              Edit Startup Profile →
            </Link>
          </div>
        </div>

        {/* AI & Research Engine Settings */}
        <div className="bg-white border border-neutral-200/90 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">AROVA Intelligence Engine</h2>
              <p className="text-xs text-neutral-500">Configure deep analysis sensitivity and multi-hop reasoning parameters</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-800">
                  Minimum Eligibility Match Threshold
                </label>
                <span className="text-xs font-mono font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                  {aiConfidenceThreshold}% confidence
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={aiConfidenceThreshold}
                onChange={(e) => setAiConfidenceThreshold(e.target.value)}
                className="w-full accent-violet-600"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Schemes below this verification score will be placed into the "Potential / Gap Identified" tier rather than "Strong Fit".
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-neutral-900 block">Strict Statutory Clause Grounding</span>
                <span className="text-[11px] text-neutral-500">Require direct gazette notification citations for all eligibility claims</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase rounded">
                Always Enforced
              </span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white border border-neutral-200/90 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Notification Policy</h2>
              <p className="text-xs text-neutral-500">Control when AROVA alerts you regarding policy changes</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-lg border border-neutral-100 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-neutral-900 block">New Government Scheme Gazettes</span>
                <span className="text-[11px] text-neutral-500">Receive alerts when new Central/State startup schemes match your sector</span>
              </div>
              <input
                type="checkbox"
                checked={schemeNotifications}
                onChange={(e) => setSchemeNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 accent-violet-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-lg border border-neutral-100 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-neutral-900 block">Document Processing & Vector Indexing</span>
                <span className="text-[11px] text-neutral-500">Get notified once uploaded startup docs are indexed into your knowledge base</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 accent-violet-600"
              />
            </label>
          </div>
        </div>

        {/* Session */}
        <div className="bg-white border border-neutral-200/90 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Session</h2>
              <p className="text-xs text-neutral-500">This device holds a secure HTTP-only session cookie</p>
            </div>
          </div>

          {saveError && (
            <p role="alert" className="mb-3 text-xs text-red-600 font-medium">{saveError}</p>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <span>{loggingOut ? "Signing out…" : "Log out of AROVA"}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
