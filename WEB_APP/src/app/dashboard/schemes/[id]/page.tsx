"use client";
import { ArrowLeft, CheckCircle2, XCircle, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { useDrawer } from "@/components/dashboard/DrawerProvider";

export default function SchemeDetail({ params }: { params: { id: string } }) {
  const { openDrawer } = useDrawer();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col pt-4 pb-24 relative">
      
      <Link href="/dashboard/schemes" className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-6 self-start">
        <ArrowLeft className="w-4 h-4" /> Back to schemes
      </Link>
      
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] uppercase font-bold tracking-wider rounded-md">Central</span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold tracking-wider rounded-md">Strong Fit</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-neutral-900 mb-4 font-display">
          Startup India Seed Fund Scheme
        </h2>
        <p className="text-lg text-neutral-600 mb-8 max-w-3xl">
          Financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors">
            Start Application
          </button>
          <button className="px-6 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl font-medium transition-colors">
            Read Guidelines PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-neutral-200 mb-6">
        <button className="pb-3 border-b-2 border-violet-600 text-violet-600 font-medium text-sm">
          Fit & Evidence
        </button>
        <button className="pb-3 border-b-2 border-transparent text-neutral-500 hover:text-neutral-700 font-medium text-sm transition-colors">
          Missing Documents
        </button>
        <button onClick={() => openDrawer('simulator')} className="pb-3 border-b-2 border-transparent text-neutral-500 hover:text-neutral-700 font-medium text-sm transition-colors">
          Try Changes
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-neutral-900 mb-1">DPIIT Recognition</h4>
              <p className="text-sm text-neutral-500 mb-2">You have a valid DPIIT certificate recognized by the Ministry of Commerce.</p>
              <button onClick={() => openDrawer('proof')} className="text-xs font-semibold text-violet-600 flex items-center gap-1 hover:underline">
                <FileText className="w-3 h-3" /> View Clause & Proof
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-neutral-900 mb-1">Incorporation Age</h4>
              <p className="text-sm text-neutral-500 mb-2">You are 14 months old. The limit is 24 months.</p>
              <button onClick={() => openDrawer('proof')} className="text-xs font-semibold text-violet-600 flex items-center gap-1 hover:underline">
                <FileText className="w-3 h-3" /> View Clause & Proof
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
