import { useState } from "react";
import { FileText, UploadCloud, CheckCircle2, AlertCircle, Loader2, Trash2 } from "lucide-react";

export function DocumentSection({ documents, tokens, onRefresh }: any) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      // Try to guess docType from filename for convenience
      let docType = "other";
      if (file.name.toLowerCase().includes("incorporation")) docType = "incorporation";
      else if (file.name.toLowerCase().includes("dpiit")) docType = "dpiit";
      else if (file.name.toLowerCase().includes("gst")) docType = "gst";
      else if (file.name.toLowerCase().includes("pitch")) docType = "pitch_deck";
      formData.append("docType", docType);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        onRefresh();
      } else {
        const json = await res.json();
        setError(json.error?.message || "Upload failed");
      }
    } catch (err) {
      setError("Network error during upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-medium tracking-tight mb-2">Document Workspace</h1>
          <p className={tokens.textMuted}>Upload and manage your startup documents. AROVA automatically analyzes them for intelligence.</p>
        </div>
        <label className="px-5 py-2.5 bg-violet-600 text-white rounded-lg flex items-center gap-2 cursor-pointer hover:bg-violet-700 transition-colors">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
          {uploading ? "Processing..." : "Upload Document"}
          <input type="file" accept="application/pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {documents.length === 0 ? (
        <div className={`p-16 border-2 border-dashed ${tokens.border} rounded-2xl flex flex-col items-center justify-center text-center`}>
          <FileText className={`w-16 h-16 ${tokens.textMuted} mb-4 opacity-50`} />
          <h3 className="text-lg font-medium mb-2">No documents uploaded yet</h3>
          <p className={`text-sm ${tokens.textMuted} max-w-md`}>Upload your Incorporation Certificate, DPIIT Recognition, or Pitch Deck to unlock deep analysis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc: any) => (
            <div key={doc.id} className={`p-5 rounded-xl border ${tokens.border} ${tokens.cardBg} group`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${doc.status === 'processed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-violet-500/10 text-violet-500'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${doc.status === 'processed' ? 'bg-emerald-500/10 text-emerald-500' : doc.status === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {doc.status.toUpperCase()}
                  </span>
                  <button className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-medium truncate mb-1" title={doc.name}>{doc.name}</h3>
              <p className={`text-xs ${tokens.textMuted} mb-4 uppercase tracking-wider`}>{doc.type.replace('_', ' ')} • {doc.pageCount} Pages</p>
              
              <div className="space-y-2 text-sm pt-4 border-t border-white/5">
                <div className="flex justify-between">
                  <span className={tokens.textMuted}>Extracted chunks</span>
                  <span className="font-medium">{doc.chunksCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className={tokens.textMuted}>Vector Indexed</span>
                  <span className="font-medium">{doc.indexedChunks || 0}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500 font-medium text-xs">Ready for analysis</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
