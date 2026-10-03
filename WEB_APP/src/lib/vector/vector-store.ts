import { DocumentChunk } from "../db/models";
import { getEmbeddingProvider } from "../embeddings/provider";
import { getQdrantClient, ensureCollection } from "../qdrant/client";
import { config } from "../config";
import { v4 as uuidv4 } from "uuid";

export interface VectorFilter {
  startupId?: string;
  userId?: string;
  sourceType?: "user_upload" | "official_gazette" | "government_portal" | "system";
  documentType?: string;
  documentId?: string;
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number;
}

export class VectorStore {
  private static instance: VectorStore;

  private constructor() {}

  static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  // Pre-ingest statutory official government guidelines
  async initializeKnowledgeBase() {
    await ensureCollection();
    const qdrant = getQdrantClient();
    
    // Check if we already have the government knowledge base indexed
    const existing = await qdrant.scroll(config.qdrant.collection, {
      filter: {
        must: [{ key: "startupId", match: { value: "government_knowledge_base" } }]
      },
      limit: 1
    });

    if (existing.points && existing.points.length > 0) {
      return;
    }

    const officialClauses: Omit<DocumentChunk, "id" | "createdAt" | "vector">[] = [
      {
        documentId: "gazette_sisfs_2025",
        userId: "system",
        startupId: "government_knowledge_base",
        fileName: "DPIIT SISFS Operational Guidelines 2024–25.pdf",
        pageNumber: 2,
        section: "Section 3.1 — DPIIT Recognition Requirement",
        content: "A startup, recognized by DPIIT, incorporated not more than 2 years ago at the time of application, is eligible for financial support up to ₹20 Lakhs as grant for proof of concept or ₹30 Lakhs for commercialization.",
        chunkIndex: 0,
        documentType: "Government Guideline",
        sourceType: "official_gazette",
      },
      // (Rest of the dummy clauses omitted for brevity. In production, these should be ingested via a script.)
    ];

    await this.addDocumentChunks(officialClauses);
  }

  // Index new document chunks into vector database
  async addDocumentChunks(chunks: Omit<DocumentChunk, "id" | "createdAt" | "vector">[]): Promise<DocumentChunk[]> {
    await ensureCollection();
    const qdrant = getQdrantClient();
    const provider = getEmbeddingProvider();
    
    const savedChunks: DocumentChunk[] = [];
    const points = [];

    for (const c of chunks) {
      const vector = await provider.embed(c.content + " " + (c.section || "") + " " + (c.fileName || ""));
      const id = uuidv4();
      
      const fullChunk: DocumentChunk = {
        ...c,
        id,
        vector, // Optional in db, but we have it
        createdAt: new Date().toISOString(),
      };
      
      points.push({
        id,
        vector,
        payload: {
          userId: c.userId,
          startupId: c.startupId,
          documentId: c.documentId,
          documentVersion: "1.0", // default versioning
          documentType: c.documentType,
          documentName: c.fileName || "unknown", // mapped from fileName
          sourceType: c.sourceType,
          pageNumber: c.pageNumber,
          section: c.section || "",
          chunkIndex: c.chunkIndex,
          content: c.content,
          contentHash: id, // proxy for content hash in this iteration
          uploadedAt: fullChunk.createdAt,
          processedAt: new Date().toISOString(),
          embeddingModel: config.vector.embeddingModel,
          
          // Additional metadata
          fileName: c.fileName,
          createdAt: fullChunk.createdAt
        }
      });
      
      savedChunks.push(fullChunk);
    }

    if (points.length > 0) {
      await qdrant.upsert(config.qdrant.collection, {
        wait: true,
        points
      });
    }

    return savedChunks;
  }

  // Hybrid Semantic Search with Metadata Filtering
  async search(query: string, filter?: VectorFilter, topK = 6): Promise<RetrievalResult[]> {
    await ensureCollection();
    const qdrant = getQdrantClient();
    const provider = getEmbeddingProvider();
    
    const queryVector = await provider.embed(query);

    // Build strict Qdrant Must Filter
    const mustConditions: any[] = [];
    let shouldConditions: any[] = [];

    if (filter) {
      if (filter.documentId) {
        mustConditions.push({ key: "documentId", match: { value: filter.documentId } });
      }
      
      // Multi-tenant Security: MUST enforce ownership
      if (filter.userId && filter.startupId) {
        // Can retrieve user's own docs OR government knowledge
        shouldConditions = [
          {
            must: [
              { key: "userId", match: { value: filter.userId } },
              { key: "startupId", match: { value: filter.startupId } }
            ]
          },
          { key: "startupId", match: { value: "government_knowledge_base" } }
        ];
      } else if (filter.sourceType === "official_gazette") {
        mustConditions.push({ key: "sourceType", match: { value: filter.sourceType } });
      } else {
        // If no user context is provided, ONLY allow government knowledge
        mustConditions.push({ key: "startupId", match: { value: "government_knowledge_base" } });
      }
      
      if (filter.documentType) {
        mustConditions.push({ key: "documentType", match: { value: filter.documentType } });
      }
    } else {
      // Default fallback: only safe government data
      mustConditions.push({ key: "startupId", match: { value: "government_knowledge_base" } });
    }

    const qdrantFilter: any = { must: mustConditions };
    if (shouldConditions.length > 0) {
      qdrantFilter.should = shouldConditions;
    }

    // @ts-ignore: Qdrant TS types missing query in this version
    const searchResults = await qdrant.query(config.qdrant.collection, {
      query: queryVector,
      filter: qdrantFilter,
      limit: topK,
      with_payload: true
    });

    // @ts-ignore: bypass implicit any
    return searchResults.map((res: any) => ({
      chunk: {
        id: res.id as string,
        ...res.payload
      } as unknown as DocumentChunk,
      score: res.score
    }));
  }
}

export const vectorStore = VectorStore.getInstance();
