"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Clock,
  Database,
  ArrowLeft,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CopilotProvider } from "@/components/dashboard/CopilotProvider";
import { DrawerProvider } from "@/components/dashboard/DrawerProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { api, DOCUMENT_CATEGORIES } from "@/lib/api-client";

interface Doc {
  id: string;
  name: string;
  type: string;
  fileSize: string;
  mimeType: string;
  pageCount: number;
  status: "uploaded" | "processing" | "processed" | "error";
  chunksCount: number;
  indexedChunks?: number;
  isVerified: boolean;
  uploadedAt: string;
  storageUrl?: string;
  processingError?: string;
}

const ACCEPT = ".pdf,.doc,.docx,.txt";

function statusMeta(status: Doc["status"]) {
  if (status === "processed") {
    return {
      label: "Indexed · Ready for AROVA",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    };
  }
  if (status === "error") {
    return {
      label: "Processing failed — Retry",
      classes: "bg-red-50 text-red-700 border-red-200",
      icon: AlertCircle,
    };
  }
  return {
    label: "AROVA is extracting and indexing this document…",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  };
}

function DocumentsManager() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("Other");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await api.documents.list();
      setDocs((res.documents || []) as Doc[]);
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : "Could not load documents.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || isUploading) return;
    setIsUploading(true);
    setUploadError("");
    const names = Array.from(files).map((f) => f.name);
    setUploadProgress(names);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("type", category);
        const res = await fetch("/api/documents/upload", {
          method: "POST",
          credentials: "same-origin",
          body: form,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          throw new Error(
            data?.error?.message || `Upload of "${file.name}" failed with status ${res.status}`
          );
        }
      }
      await load();
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress([]);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This removes the file, its record, and its indexed evidence.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await api.documents.delete(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : `Could not delete "${name}".`);
    } finally {
      setDeletingId(null);
    }
  };

  const indexedCount = docs.filter((d) => d.status === "processed").length;
  const totalChunks = docs.reduce((n, d) => n + (d.indexedChunks ?? d.chunksCount ?? 0), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Documents</h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-3xl">
          Upload your startup documents here. AROVA extracts their text, generates embeddings,
          and indexes them as evidence when evaluating schemes and answering questions.
        </p>
      </div>

      {/* Summary strip */}
      {!isLoading && !loadError && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90">
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Uploaded</div>
            <div className="text-2xl font-bold text-neutral-900 mt-1">{docs.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90">
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">RAG-ready</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{indexedCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90">
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Indexed chunks</div>
            <div className="text-2xl font-bold text-violet-700 mt-1">{totalChunks}</div>
          </div>
        </div>
      )}

      {/* Upload card */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <h2 className="text-sm font-bold text-neutral-900">Upload startup documents</h2>
          <label className="text-xs text-neutral-500 flex items-center gap-2">
            <span className="font-semibold">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-700 outline-none focus:border-violet-500"
            >
              {DOCUMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="border-2 border-dashed border-neutral-200 hover:border-violet-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-neutral-50/50 hover:bg-violet-50/30 transition-all">
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2 text-violet-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold">
                {uploadProgress.length > 0 ? `Indexing ${uploadProgress.join(", ")}…` : "Uploading…"}
              </span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-neutral-900">Click to upload or drag and drop</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  PDF, DOC, DOCX, TXT · up to 15 MB each · DPIIT, incorporation, GST, financials, pitch deck
                </p>
              </div>
            </>
          )}
        </label>

        {uploadError && (
          <div role="alert" className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{uploadError}</p>
          </div>
        )}
      </div>

      {/* Document list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900">
            Your documents {docs.length > 0 && <span className="text-neutral-400 font-medium">({docs.length})</span>}
          </h2>
          {!isLoading && (
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
            <span className="text-xs font-semibold">Loading your documents…</span>
          </div>
        ) : loadError ? (
          <div role="alert" className="p-6 rounded-2xl bg-white border border-red-200 text-center space-y-3">
            <p className="text-xs text-red-600 font-medium">{loadError}</p>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : docs.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-dashed border-neutral-300 text-center">
            <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">No documents yet</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Upload your DPIIT certificate, incorporation documents, GST registration, or financial
              statements above. AROVA will index them and cite them as evidence in scheme evaluations.
            </p>
          </div>
        ) : (
          docs.map((d) => {
            const meta = statusMeta(d.status);
            const Icon = meta.icon;
            return (
              <div key={d.id} className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900 truncate">{d.name}</h3>
                      {d.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Key terms detected</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {d.type} · {d.fileSize} · {d.pageCount} {d.pageCount === 1 ? "page" : "pages"} ·{" "}
                      {d.chunksCount} {d.chunksCount === 1 ? "chunk" : "chunks"} indexed · Uploaded{" "}
                      {new Date(d.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <div className={`mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-lg border ${meta.classes}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{meta.label}</span>
                    </div>
                    {d.status === "error" && d.processingError && (
                      <p className="mt-1.5 text-[11px] text-red-600">{d.processingError}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {d.storageUrl && (
                    <a
                      href={d.storageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-all"
                    >
                      <span>View file</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(d.id, d.name)}
                    disabled={deletingId === d.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {deletingId === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <RequireAuth mode="completed" loadingMessage="Checking your workspace...">
      <CopilotProvider>
        <DrawerProvider>
          <DashboardShell>
            <DocumentsManager />
          </DashboardShell>
        </DrawerProvider>
      </CopilotProvider>
    </RequireAuth>
  );
}
