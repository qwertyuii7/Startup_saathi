"use client";

import React, { useEffect, useState } from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";
import { AnalysisPageHeader } from "@/components/deep-analysis/AnalysisPageHeader";
import { Loader2, User, Building2, Briefcase, Scale, FileText, Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function DeepAnalysisProfilePage() {
  const { analysis, isLoading: analysisLoading, error } = useWorkspaceAnalysis();
  const [profileData, setProfileData] = useState<any>({
    founder: null,
    startup: null,
    loading: true
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const [founderRes, startupRes] = await Promise.all([
          fetch("/api/profile/founder"),
          fetch("/api/profile/startup")
        ]);
        
        const founder = await founderRes.json();
        const startup = await startupRes.json();
        
        setProfileData({
          founder: founder.success ? founder.data : null,
          startup: startup.success ? startup.data : null,
          loading: false
        });
      } catch (err) {
        setProfileData((prev: any) => ({ ...prev, loading: false }));
      }
    }
    fetchProfile();
  }, []);

  if (analysisLoading || profileData.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <span className="text-sm font-bold text-neutral-500">Loading Profile Intelligence...</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Analysis Unavailable</h2>
        <p className="text-sm text-neutral-500">Please start a new Deep Analysis.</p>
      </div>
    );
  }

  const { founder, startup } = profileData;

  const InfoRow = ({ label, value, href }: { label: string, value: string | undefined | null, href?: string }) => (
    <div className="flex items-start justify-between py-3 border-b border-neutral-100 last:border-0">
      <span className="text-xs font-medium text-neutral-500 w-1/3 shrink-0">{label}</span>
      <div className="flex-1 text-right sm:text-left flex items-center justify-end sm:justify-start gap-2">
        {value ? (
          <span className="text-sm font-bold text-neutral-900">{value}</span>
        ) : (
          <span className="text-sm font-medium text-amber-600/80 italic flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Not provided yet
          </span>
        )}
        {href && !value && (
          <Link href={href} className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-1 rounded transition-colors ml-2">Edit</Link>
        )}
      </div>
    </div>
  );

  const missingDocs = analysis.findings.flatMap(f => f.blockingFactors).filter(b => b.issue.includes("document")).length;
  const verifiedReqs = analysis.findings.flatMap(f => f.criteriaBreakdown).filter(c => c.status === "SATISFIED").length;
  const totalReqs = analysis.findings.flatMap(f => f.criteriaBreakdown).length;

  return (
    <div className="space-y-8 pb-24 h-full">
      <AnalysisPageHeader 
        title="Startup Profile Context" 
        description="The canonical business data and founder identity actively being used by AROVA to evaluate scheme eligibility."
        status={analysis.status}
        updatedAt={analysis.updatedAt}
      >
        <Link href="/dashboard/profile" className="h-9 px-4 flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-xs font-bold text-white transition-colors shadow-sm">
          Edit Global Profile
        </Link>
      </AnalysisPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Founder Section */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="h-2 bg-violet-500 w-full" />
          <div className="p-6">
            <h3 className="text-sm font-bold text-neutral-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <User className="w-4 h-4 text-violet-600" /> Founder Identity
            </h3>
            <div className="flex flex-col">
              <InfoRow label="Full Name" value={founder?.fullName} href="/dashboard/profile" />
              <InfoRow label="Email Address" value={founder?.email} />
              <InfoRow label="Phone Number" value={founder?.phone} href="/dashboard/profile" />
              <InfoRow label="Role" value={founder?.role} href="/dashboard/profile" />
              <InfoRow label="Category / Demographics" value={founder?.category ? `${founder.category} ${founder.isWomen ? '(Women-led)' : ''}` : null} href="/dashboard/profile" />
            </div>
          </div>
        </div>

        {/* Startup Core Section */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="h-2 bg-emerald-500 w-full" />
          <div className="p-6">
            <h3 className="text-sm font-bold text-neutral-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-emerald-600" /> Startup Core
            </h3>
            <div className="flex flex-col">
              <InfoRow label="Startup Name" value={startup?.startupName || startup?.name} href="/dashboard/profile" />
              <InfoRow label="Stage" value={startup?.startupStage || startup?.stage} href="/dashboard/profile" />
              <InfoRow label="Industry" value={startup?.industry} href="/dashboard/profile" />
              <InfoRow label="Sector" value={startup?.sector} href="/dashboard/profile" />
              <InfoRow label="Founded Date" value={startup?.foundedDate ? new Date(startup.foundedDate).toLocaleDateString() : null} href="/dashboard/profile" />
              <InfoRow label="Location" value={startup?.city && startup?.state ? `${startup.city}, ${startup.state}` : null} href="/dashboard/profile" />
            </div>
          </div>
        </div>

        {/* Business & Financial Section */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="h-2 bg-amber-500 w-full" />
          <div className="p-6">
            <h3 className="text-sm font-bold text-neutral-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-amber-600" /> Business & Financial
            </h3>
            <div className="flex flex-col">
              <InfoRow label="Annual Turnover" value={startup?.annualTurnover ? `₹ ${startup.annualTurnover}` : null} href="/dashboard/profile" />
              <InfoRow label="Revenue Model" value={startup?.revenue} href="/dashboard/profile" />
              <InfoRow label="Funding Status" value={startup?.fundingStatus} href="/dashboard/profile" />
              <InfoRow label="Funding Stage" value={startup?.fundingStage} href="/dashboard/profile" />
              <InfoRow label="Team Size" value={startup?.employees ? `${startup.employees} Employees` : null} href="/dashboard/profile" />
              <InfoRow label="Product Stage" value={startup?.productStage} href="/dashboard/profile" />
            </div>
          </div>
        </div>

        {/* Legal & Compliance Section */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="h-2 bg-blue-500 w-full" />
          <div className="p-6">
            <h3 className="text-sm font-bold text-neutral-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Scale className="w-4 h-4 text-blue-600" /> Legal & Compliance
            </h3>
            <div className="flex flex-col">
              <InfoRow label="Entity Type" value={startup?.entityType} href="/dashboard/profile" />
              <InfoRow label="Incorporation No." value={startup?.incorporationNumber} href="/dashboard/profile" />
              <InfoRow label="DPIIT Recognized" value={startup?.dpiitRecognized ? "Yes" : startup?.dpiitRecognized === false ? "No" : null} href="/dashboard/profile" />
              <InfoRow label="DPIIT Number" value={startup?.dpiitNumber} href="/dashboard/profile" />
              <InfoRow label="GST Registration" value={startup?.gstNumber} href="/dashboard/profile" />
              <InfoRow label="PAN" value={startup?.panNumber} href="/dashboard/profile" />
            </div>
          </div>
        </div>

        {/* Analysis Context */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col lg:col-span-2">
          <div className="h-2 bg-neutral-900 w-full" />
          <div className="p-6 md:p-8">
            <h3 className="text-sm font-bold text-neutral-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-neutral-700" /> Analysis Context
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Session ID</div>
                <div className="text-sm font-mono font-medium text-neutral-900 truncate">{analysis.id}</div>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Evaluated Schemes</div>
                <div className="text-xl font-bold text-neutral-900">{analysis.schemesAnalyzedCount}</div>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Missing Documents</div>
                <div className="text-xl font-bold text-amber-600">{missingDocs}</div>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Evidence Coverage</div>
                <div className="text-xl font-bold text-emerald-600">{totalReqs > 0 ? Math.round((verifiedReqs / totalReqs) * 100) : 0}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
