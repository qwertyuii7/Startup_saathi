"use client";

import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Upload, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  Layers 
} from "lucide-react";
import { UploadedDocument } from "@/types/deep-analysis";

interface EvidenceDocumentsCardProps {
  documents: UploadedDocument[];
  onUploadClick: () => void;
  onViewDoc: (doc: UploadedDocument) => void;
  onReplaceDoc: (doc: UploadedDocument) => void;
}

export function EvidenceDocumentsCard({
  documents,
  onUploadClick,
  onViewDoc,
  onReplaceDoc,
}: EvidenceDocumentsCardProps) {
  const verifiedCount = documents.filter(d => d.status === "verified").length;
  const coveragePercent = 78;

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-semibold text-neutral-900 text-base">
              Evidence Available
            </h3>
            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-bold rounded-md">
              {documents.length} Files
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cryptographically parsed and mapped to statutory legal rules
          </p>
        </div>

        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl transition-all self-start sm:self-auto shadow-2xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>+ Upload Document</span>
        </button>
      </div>

      {/* Evidence Coverage Bar */}
      <div className="bg-neutral-50/80 border border-neutral-200/70 rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">Evidence Coverage</span>
            <span className="text-[11px] text-neutral-400">
              ({verifiedCount} of {documents.length} verified)
            </span>
          </div>
          <span className="font-bold text-violet-700 text-sm">{coveragePercent}%</span>
        </div>
        
        {/* Progress bar track */}
        <div className="w-full h-2.5 bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500" 
            style={{ width: `${coveragePercent}%` }}
          />
        </div>

        <p className="text-[11px] text-neutral-500 mt-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Your documents currently support 78% of the requested analysis scope.</span>
        </p>
      </div>

      {/* Document Rows */}
      <div className="space-y-2.5">
        {documents.map((doc) => {
          const isVerified = doc.status === "verified";
          return (
            <div
              key={doc.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 bg-white hover:bg-neutral-50 border border-neutral-200/80 hover:border-neutral-300 rounded-xl transition-all group"
            >
              {/* Document Details */}
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  isVerified 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                    : "bg-amber-50 text-amber-600 border-amber-200"
                }`}>
                  {isVerified ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-neutral-900 group-hover:text-violet-700 transition-colors">
                      {doc.name}
                    </span>
                    <span className={`px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider rounded border ${
                      isVerified
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {isVerified ? "Verified" : "Action Needed"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-0.5">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.pages} pages</span>
                    <span>•</span>
                    <span>Uploaded {doc.uploadedDate}</span>
                  </div>
                </div>
              </div>

              {/* Document Actions */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => onViewDoc(doc)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/70 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => onReplaceDoc(doc)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/70 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
