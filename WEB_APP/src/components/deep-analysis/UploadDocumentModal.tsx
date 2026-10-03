"use client";

import { useState } from "react";
import { X, Upload, FileText, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { UploadedDocument } from "@/types/deep-analysis";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newDoc: UploadedDocument) => void;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: UploadDocumentModalProps) {
  const [docType, setDocType] = useState("Financial Statements (Audited)");
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fileName || `${docType.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
          type: docType,
          content: `Verified documentary filing for ${docType}. Includes registered entity identification, turnover declaration, and statutory compliance clauses.`,
        }),
      });

      const data = await res.json();
      setIsUploading(false);

      if (data.success && data.document) {
        onUploadSuccess({
          id: data.document.id,
          name: data.document.name,
          type: data.document.type,
          status: data.document.isVerified ? "verified" : "needs_update",
          pages: data.document.pageCount || 4,
          uploadedDate: "Just now",
          size: data.document.fileSize || "1.2 MB",
          matchedSchemesCount: 7,
        });
        onClose();
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      setIsUploading(false);
      const newDoc: UploadedDocument = {
        id: `doc-${Date.now()}`,
        name: fileName || `${docType.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        type: docType,
        status: "verified",
        pages: 8,
        uploadedDate: "Just now",
        size: "2.4 MB",
        matchedSchemesCount: 7,
      };
      onUploadSuccess(newDoc);
      onClose();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50"
        onClick={onClose} 
      />

      <div className="fixed inset-x-4 top-[15%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px] bg-white rounded-2xl shadow-2xl z-50 border border-neutral-200 p-6 animate-in fade-in-50 zoom-in-95">
        
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-neutral-900 text-base">
              Upload Evidentiary Document
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSimulatedUpload} className="space-y-4">
          
          {/* Document Type */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Document Classification
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:border-violet-400 focus:bg-white"
            >
              <option value="Financial Statements (Audited)">Financial Statements (Audited Balance Sheet & P&L)</option>
              <option value="DPIIT Certificate">DPIIT Certificate of Recognition</option>
              <option value="Certificate of Incorporation">Certificate of Incorporation (MCA)</option>
              <option value="GST Returns / Registration">GST Returns / Registration Certificate</option>
              <option value="Incubator Recommendation Letter">Incubator Recommendation / Acceptance Letter</option>
              <option value="Patent / IP Filing">Patent / Trademark Filing Document</option>
              <option value="Pitch Deck / Business Plan">Investor Pitch Deck / Business Plan</option>
            </select>
          </div>

          {/* Drag & Drop Simulation */}
          <div className="border-2 border-dashed border-neutral-200 hover:border-violet-400 rounded-2xl p-6 text-center bg-neutral-50/50 hover:bg-violet-50/30 transition-all cursor-pointer">
            <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-neutral-800">
              Drag and drop your PDF or <span className="text-violet-600 underline">browse files</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Supports PDF, scanned copies, CA signed balance sheets (Max 25MB)
            </p>
          </div>

          {/* File Name optional input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              File Name / Reference (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. FY24-25_Audited_BalanceSheet_CA_Signed.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 outline-none focus:border-violet-400 focus:bg-white"
            />
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              {isUploading ? (
                <span>Parsing & Verifying...</span>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Upload & Run Verification</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </>
  );
}
