import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { DocumentProcessor } from "@/lib/documents/processor";
import { getStorageProvider } from "@/lib/storage/provider";
import { config } from "@/lib/config";
import { db } from "@/lib/db/store";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXT = new Set([".pdf", ".txt", ".doc", ".docx"]);

export const runtime = "nodejs";
// Allow large uploads (serverless limits aside, dev/Node handles these).
export const maxDuration = 60;

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } },
        { status: 401 }
      );
    }
    const userId = user.id;
    // Owner is always the session user — never a client-sent id.
    let startup = await db.getStartupByUserId(userId);
    if (!startup) {
      startup = await db.saveStartup({
        id: `startup_${uuidv4().substring(0, 8)}`,
        userId,
        name: `${user.name}'s Startup`,
        industry: "",
        sector: "",
        stage: "",
        state: "",
        city: "",
        dpiitStatus: false,
        updatedAt: new Date().toISOString(),
      });
    }
    const startupId = startup.id;

    const contentType = req.headers.get("content-type") || "";
    let fileName = "";
    let mimeType = "";
    let buffer: Buffer | null = null;
    let docType = "Other";
    let storage: { provider: "local" | "cloudinary"; url: string; publicId: string; sha256: string } | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      docType = (formData.get("type") as string) || "Other";

      if (!file || file.size === 0) {
        return NextResponse.json(
          { success: false, error: { code: "NO_FILE", message: "No file attached in upload." } },
          { status: 400 }
        );
      }

      fileName = file.name || "document";
      mimeType = file.type || "application/octet-stream";
      const ext = extOf(fileName);
      if (!ALLOWED_MIME.has(mimeType) && !ALLOWED_EXT.has(ext)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_TYPE",
              message: `Unsupported file type "${ext || mimeType}". Upload PDF, DOC, DOCX, or TXT.`,
            },
          },
          { status: 400 }
        );
      }
      const maxBytes = config.storage.maxUploadMb * 1024 * 1024;
      if (file.size > maxBytes) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FILE_TOO_LARGE",
              message: `File is larger than the ${config.storage.maxUploadMb} MB limit.`,
            },
          },
          { status: 400 }
        );
      }

      buffer = Buffer.from(await file.arrayBuffer());

      // 1. Cloud/persistent storage upload first (provenance for RAG).
      try {
        const provider = getStorageProvider();
        const docId = `doc_${uuidv4().substring(0, 8)}`;
        const stored = await provider.save({
          userId,
          docId,
          fileName,
          mimeType,
          buffer,
        });
        storage = { provider: stored.provider, url: stored.url, publicId: stored.publicId, sha256: stored.sha256 };
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "File storage upload failed";
        console.error("Storage upload error:", message);
        const failed = await DocumentProcessor.createFailedRecord({
          userId,
          startupId,
          fileName,
          mimeType,
          docType,
          byteLength: buffer.length,
          error: `Storage upload failed: ${message}`,
        });
        return NextResponse.json({ success: true, document: failed });
      }
    } else {
      // JSON metadata/text path (used by integrations that already host
      // the file). Requires REAL extracted text — never invented.
      const body = await req.json().catch(() => ({}));
      fileName = typeof body.name === "string" && body.name ? body.name : "";
      docType = typeof body.type === "string" && body.type ? body.type : "Other";
      const content = typeof body.content === "string" ? body.content : "";
      mimeType = typeof body.mimeType === "string" && body.mimeType ? body.mimeType : "text/plain";
      if (!fileName || !content.trim()) {
        return NextResponse.json(
          { success: false, error: { code: "NO_FILE", message: "Provide a file (multipart) or a name with extracted text content." } },
          { status: 400 }
        );
      }
      buffer = Buffer.from(content, "utf-8");
    }

    if (!buffer) {
      return NextResponse.json(
        { success: false, error: { code: "NO_FILE", message: "No file attached in upload." } },
        { status: 400 }
      );
    }

    // 2. Text extraction → chunking → embeddings → vector index.
    try {
      const doc = await DocumentProcessor.processDocument(
        buffer,
        fileName,
        mimeType,
        userId,
        startupId,
        docType,
        storage
      );
      return NextResponse.json({ success: true, document: doc });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Document processing failed";
      console.error("Document processing error:", message);
      const failed = await DocumentProcessor.createFailedRecord({
        userId,
        startupId,
        fileName,
        mimeType,
        docType,
        byteLength: buffer.length,
        error: message,
        storage,
      });
      return NextResponse.json({ success: true, document: failed });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Document processing failed";
    console.error("Document Upload Error:", message);
    return NextResponse.json(
      { success: false, error: { code: "UPLOAD_FAILED", message } },
      { status: 500 }
    );
  }
}
