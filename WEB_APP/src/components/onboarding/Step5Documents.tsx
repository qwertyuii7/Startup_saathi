"use client";

import React, { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { api } from "@/lib/api-client";

interface Step5DocumentsProps {
  initialInterests?: string[];
  onBack: () => void;
  onFinish: (data: { assistanceInterests: string[] }) => void;
  isSaving?: boolean;
}

export function Step5Documents({ initialInterests = [], onBack, onFinish, isSaving }: Step5DocumentsProps) {
  const [interests, setInterests] = useState<string[]>(initialInterests);

  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; size: string; status: string }[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const interestOptions = [
    "Government Grants",
    "Startup Incentives",
    "Tax Benefits",
    "Loans / Credit Support",
    "Incubators",
    "State Schemes",
    "All of the above",
  ];

  const toggleInterest = (opt: string) => {
    if (opt === "All of the above") {
      if (interests.includes("All of the above")) {
        setInterests([]);
      } else {
        setInterests([...interestOptions]);
      }
      return;
    }

    if (interests.includes(opt)) {
      setInterests(interests.filter((i) => i !== opt && i !== "All of the above"));
    } else {
      setInterests([...interests.filter((i) => i !== "All of the above"), opt]);
    }
  };

  // Load documents the user already uploaded (e.g. resumed onboarding).
  React.useEffect(() => {
    let cancelled = false;
    api.documents
      .list()
      .then((res) => {
        if (cancelled) return;
        const existing = (res.documents || []).map((d: { id: string; name: string; fileSize: string; status: string }) => ({
          id: d.id,
          name: d.name,
          size: d.fileSize,
          status: d.status === "processed" ? "Indexed in Vector Store" : d.status === "error" ? "Processing failed" : "Processing…",
        }));
        if (existing.length > 0) setUploadedFiles(existing);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      // Real upload of the actual file: stored, text-extracted, chunked,
      // embedded, and indexed for RAG citations.
      const res = await api.documents.upload(file);

      if (res.success && res.document) {
        const failed = res.document.status === "error";
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: res.document.id,
            name: res.document.name,
            size: res.document.fileSize || "",
            status: failed ? `Processing failed${res.document.processingError ? `: ${res.document.processingError}` : ""}` : "Indexed in Vector Store",
          },
        ]);
        if (failed) {
          setUploadError(res.document.processingError || "Processing failed. You can retry from the Documents page later.");
        }
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. You can also upload documents later from the Documents page.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    onFinish({ assistanceInterests: interests });
  };

  return (
    <form onSubmit={handleComplete} className="space-y-4 sm:space-y-5">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">
          Almost there
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Upload statutory documents to index into your vector knowledge base, and set your funding preferences.
        </p>
      </div>

      {/* Upload Box */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
          Upload Startup Documents (Optional)
        </label>

        <label className="border-2 border-dashed border-neutral-200 hover:border-violet-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-neutral-50/50 hover:bg-violet-50/30 transition-all group">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2 text-violet-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold">Extracting text & generating dense embeddings...</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-neutral-900 group-hover:text-violet-700">
                  Click to upload or drag and drop
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  DPIIT Certificate, Incorporation COI, GST, Financial Statements (PDF / DOCX)
                </p>
              </div>
            </>
          )}
        </label>

        <p className="text-[11px] text-neutral-400">
          You can also upload documents later. SchemeSense indexes them for page-level citations in deep analysis.
        </p>

        {/* Uploaded List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Indexed Documents ({uploadedFiles.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {uploadedFiles.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200 bg-white text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-violet-600 shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold text-neutral-900 truncate">{f.name}</div>
                      <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{f.status}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0 ml-2">{f.size}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assistance Interests Multi-Select */}
      <div className="pt-2 border-t border-neutral-100 space-y-2.5">
        <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
          What would you like SchemeSense to help you with?
        </label>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((opt) => {
            const isSelected = interests.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleInterest(opt)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? "border-violet-600 bg-violet-50 text-violet-700 shadow-2xs"
                    : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {isSelected ? "✓ " : "+ "}
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-xs transition-all disabled:opacity-50"
        >
          <span>Complete Setup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
