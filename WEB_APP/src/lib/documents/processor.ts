import { vectorStore } from "../vector/vector-store";
import { db } from "../db/store";
import { StartupDocumentRecord, DocumentChunk } from "../db/models";
import { v4 as uuidv4 } from "uuid";

export class DocumentProcessor {
  // Process uploaded buffer/text, extract pages, chunk, and index into vector store.
  // `storage` provenance is attached to the DB record when provided.
  static async processDocument(
    fileBuffer: Buffer | string,
    fileName: string,
    mimeType: string,
    userId: string,
    startupId: string,
    docType: string,
    storage?: { provider: "local" | "cloudinary"; url: string; publicId: string; sha256: string }
  ): Promise<StartupDocumentRecord> {
    const docId = `doc_${uuidv4().substring(0, 8)}`;
    let extractedText = "";
    let pageCount = 1;
    let pages: { pageNumber: number; text: string }[] = [];

    // Parse Text based on file type
    if (typeof fileBuffer === "string") {
      extractedText = fileBuffer;
      pages = [{ pageNumber: 1, text: extractedText }];
    } else if (
      mimeType.includes("wordprocessingml") ||
      mimeType.includes("msword") ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc")
    ) {
      try {
        // Use mammoth for DOCX text extraction
        const mammoth = (await import("mammoth")) as unknown as {
          extractRawText: (input: { buffer: Buffer }) => Promise<{ value: string }>;
        };
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value || "";
        pageCount = Math.max(1, Math.ceil(extractedText.length / 2000));
        const pageSize = 2000;
        for (let p = 0; p < pageCount; p++) {
          const slice = extractedText.substring(p * pageSize, (p + 1) * pageSize);
          if (slice.trim().length > 0) {
            pages.push({ pageNumber: p + 1, text: slice });
          }
        }
        if (pages.length === 0) pages = [{ pageNumber: 1, text: extractedText }];
      } catch (err) {
        console.warn("DOCX parse fallback to raw string extraction:", err);
        extractedText = fileBuffer.toString("utf-8");
        pages = [{ pageNumber: 1, text: extractedText }];
      }
    } else if (mimeType.includes("pdf") || fileName.endsWith(".pdf")) {
      try {
        // pdf-parse v2 API: per-page text with real page numbers.
        const pdfModule = (await import("pdf-parse")) as unknown as {
          PDFParse: new (opts: { data: Buffer }) => {
            getText: () => Promise<{ text: string; total: number; pages: { num?: number; text?: string }[] }>;
            destroy: () => Promise<void>;
          };
        };
        const parser = new pdfModule.PDFParse({ data: fileBuffer });
        try {
          const data = await parser.getText();
          extractedText = data.text || "";
          pageCount = Math.max(1, data.total || data.pages?.length || 1);
          const perPage = (data.pages || [])
            .map((p, idx) => ({
              pageNumber: typeof p.num === "number" ? p.num : idx + 1,
              text: (p.text || "").trim(),
            }))
            .filter((p) => p.text.length > 0);
          if (perPage.length > 0) {
            pages = perPage;
          } else if (extractedText.trim().length > 0) {
            // Synthetic ~2000-char pages when per-page segmentation
            // is unavailable.
            const pageSize = 2000;
            pageCount = Math.max(1, Math.ceil(extractedText.length / pageSize));
            for (let p = 0; p < pageCount; p++) {
              const slice = extractedText.substring(p * pageSize, (p + 1) * pageSize);
              if (slice.trim().length > 0) {
                pages.push({ pageNumber: p + 1, text: slice });
              }
            }
          }
        } finally {
          await parser.destroy().catch(() => undefined);
        }
      } catch (err) {
        console.warn("PDF parse fallback to raw string extraction:", err);
        extractedText = fileBuffer.toString("utf-8");
        pages = [{ pageNumber: 1, text: extractedText }];
      }
    } else {
      extractedText = fileBuffer.toString("utf-8");
      pages = [{ pageNumber: 1, text: extractedText }];
    }

    // Chunking pipeline: ~400-500 words per chunk with 50-word overlap
    const chunksToInsert: Omit<DocumentChunk, "id" | "createdAt" | "vector">[] = [];
    let chunkCounter = 0;

    for (const page of pages) {
      const words = page.text.split(/\s+/).filter(w => w.length > 0);
      const chunkSize = 150;
      const overlap = 30;

      if (words.length === 0) continue;

      for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
        const chunkWords = words.slice(i, i + chunkSize);
        const chunkText = chunkWords.join(" ");
        if (chunkText.trim().length < 20) continue;

        chunksToInsert.push({
          documentId: docId,
          userId,
          startupId,
          fileName,
          pageNumber: page.pageNumber,
          section: `Page ${page.pageNumber} - Excerpt ${chunkCounter + 1}`,
          content: chunkText,
          chunkIndex: chunkCounter++,
          documentType: docType,
          sourceType: "user_upload",
        });
      }
    }

    // Index chunks into Vector Store
    if (chunksToInsert.length > 0) {
      await vectorStore.addDocumentChunks(chunksToInsert);
    }

    // Extract facts for metadata enrichment (keyword heuristic over the
    // document's OWN extracted text — never invented content).
    const haystack = extractedText;
    const isVerified =
      haystack.includes("DPIIT") ||
      haystack.includes("Certificate of Recognition") ||
      haystack.includes("Companies Act") ||
      haystack.includes("GSTIN");

    const byteLength = typeof fileBuffer === "string" ? Buffer.byteLength(fileBuffer, "utf-8") : fileBuffer.length;
    const docRecord: StartupDocumentRecord = {
      id: docId,
      userId,
      startupId,
      name: fileName,
      type: docType,
      fileSize: byteLength >= 1024 * 1024 ? `${(byteLength / (1024 * 1024)).toFixed(1)} MB` : `${(byteLength / 1024).toFixed(1)} KB`,
      fileSizeBytes: byteLength,
      mimeType,
      pageCount,
      status: "processed",
      extractedText: extractedText.substring(0, 1000), // excerpt
      chunksCount: chunksToInsert.length,
      indexedChunks: chunksToInsert.length,
      isVerified,
      uploadedAt: new Date().toISOString(),
      storageProvider: storage?.provider,
      storageUrl: storage?.url,
      storagePublicId: storage?.publicId,
      fileHash: storage?.sha256,
      metadata: {
        totalWords: extractedText.split(/\s+/).filter(Boolean).length,
      },
    };

    await db.saveDocument(docRecord);
    return docRecord;
  }

  /** Persist a failed-upload record so the UI can show Retry. */
  static async createFailedRecord(params: {
    userId: string;
    startupId: string;
    fileName: string;
    mimeType: string;
    docType: string;
    byteLength: number;
    error: string;
    storage?: { provider: "local" | "cloudinary"; url: string; publicId: string; sha256: string };
  }): Promise<StartupDocumentRecord> {
    const docId = `doc_${uuidv4().substring(0, 8)}`;
    const record: StartupDocumentRecord = {
      id: docId,
      userId: params.userId,
      startupId: params.startupId,
      name: params.fileName,
      type: params.docType,
      fileSize:
        params.byteLength >= 1024 * 1024
          ? `${(params.byteLength / (1024 * 1024)).toFixed(1)} MB`
          : `${(params.byteLength / 1024).toFixed(1)} KB`,
      fileSizeBytes: params.byteLength,
      mimeType: params.mimeType,
      pageCount: 0,
      status: "error",
      chunksCount: 0,
      indexedChunks: 0,
      isVerified: false,
      uploadedAt: new Date().toISOString(),
      storageProvider: params.storage?.provider,
      storageUrl: params.storage?.url,
      storagePublicId: params.storage?.publicId,
      fileHash: params.storage?.sha256,
      processingError: params.error,
      metadata: {},
    };
    await db.saveDocument(record);
    return record;
  }
}
