import { DocumentChunk } from "../db/models";
import { EmbeddingService } from "./embeddings";
import { db } from "../db/store";
import { v4 as uuidv4 } from "uuid";

export interface VectorFilter {
  startupId?: string;
  userId?: string;
  sourceType?: "user_upload" | "official_gazette" | "government_portal";
  documentType?: string;
  documentId?: string;
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number;
}

export class VectorStore {
  private static instance: VectorStore;
  private isInitialized = false;

  private constructor() {
    this.initializeKnowledgeBase();
  }

  static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  // Pre-ingest statutory official government guidelines (idempotent:
  // skipped when knowledge chunks already exist, deterministic ids so
  // persistent backends never accumulate duplicates).
  private initPromise: Promise<void> | null = null;

  private async initializeKnowledgeBase() {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.doInitializeKnowledgeBase().finally(() => {
      this.isInitialized = true;
    });
    return this.initPromise;
  }

  private async doInitializeKnowledgeBase() {
    try {
      const existing = await db.getAllChunks();
      if (existing.some((c) => c.startupId === "government_knowledge_base")) {
        return;
      }
    } catch {
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
      {
        documentId: "gazette_sisfs_2025",
        userId: "system",
        startupId: "government_knowledge_base",
        fileName: "DPIIT SISFS Operational Guidelines 2024–25.pdf",
        pageNumber: 3,
        section: "Section 3.5 — Prior Monetary Grants Limit",
        content: "The startup must not have received more than ₹10 Lakhs of monetary support under any other Central or State Government scheme. Subsidies, prize money from competitions, and subsidized working space are excluded.",
        chunkIndex: 1,
        documentType: "Government Guideline",
        sourceType: "official_gazette",
      },
      {
        documentId: "gazette_startinup_2020",
        userId: "system",
        startupId: "government_knowledge_base",
        fileName: "UP Information Technology and Startup Policy 2020.pdf",
        pageNumber: 1,
        section: "Clause 2.1 — Geographic Domicile & Registered Office",
        content: "Startups having their registered office situated in the State of Uttar Pradesh, recognized by DPIIT and enrolled on StartInUP portal, are eligible for monthly sustenance allowance of ₹17,500/month.",
        chunkIndex: 0,
        documentType: "State Government Policy",
        sourceType: "official_gazette",
      },
      {
        documentId: "gazette_startinup_2020",
        userId: "system",
        startupId: "government_knowledge_base",
        fileName: "UP Information Technology and Startup Policy 2020.pdf",
        pageNumber: 5,
        section: "Clause 7.2.3 — Financial Attestation Checklist",
        content: "Disbursement of seed capital and sustenance allowance requires statutory CA-certified audited balance sheet or endorsement letter from a recognized Uttar Pradesh Host Institute / Incubator.",
        chunkIndex: 1,
        documentType: "State Government Policy",
        sourceType: "official_gazette",
      },
      {
        documentId: "gazette_samridh_meity",
        userId: "system",
        startupId: "government_knowledge_base",
        fileName: "MeitY SAMRIDH Scheme Guidelines 2025.pdf",
        pageNumber: 4,
        section: "Clause 4.2 — Shareholding and Entity Structure",
        content: "The startup must be an Indian entity with at least 51% shareholding held by resident Indian citizens. Software product development and demonstrable user validation are mandatory.",
        chunkIndex: 0,
        documentType: "Central Government Policy",
        sourceType: "official_gazette",
      },
      {
        documentId: "gazette_80iac_cbdt",
        userId: "system",
        startupId: "government_knowledge_base",
        fileName: "CBDT Notification No. 13/2019 / Section 80-IAC.pdf",
        pageNumber: 1,
        section: "Section 80-IAC — 3 Year Tax Exemption",
        content: "Eligible startups incorporated as Private Limited Companies or LLPs between April 1, 2016 and March 31, 2027 with turnover under ₹100 Crores may apply to the Inter-Ministerial Board for 100% tax deduction on profits.",
        chunkIndex: 0,
        documentType: "Central Tax Notification",
        sourceType: "official_gazette",
      },
      // Pre-ingested user evidence chunks for default startup
      // (REMOVED — user evidence must come from real user uploads only.)
    ];

    for (let i = 0; i < officialClauses.length; i++) {
      const c = officialClauses[i];
      const vector = await EmbeddingService.generateEmbedding(c.content + " " + c.section + " " + c.fileName);
      const fullChunk: DocumentChunk = {
        ...c,
        id: `gz_${String(i).padStart(2, "0")}`,
        vector,
        createdAt: new Date().toISOString(),
      };
      await db.saveChunk(fullChunk);
    }
  }

  // Index new document chunks into vector database
  async addDocumentChunks(chunks: Omit<DocumentChunk, "id" | "createdAt" | "vector">[]): Promise<DocumentChunk[]> {
    const savedChunks: DocumentChunk[] = [];

    for (const c of chunks) {
      const vector = await EmbeddingService.generateEmbedding(c.content + " " + c.section + " " + c.fileName);
      const chunkRecord: DocumentChunk = {
        ...c,
        id: `chunk_${uuidv4().substring(0, 8)}`,
        vector,
        createdAt: new Date().toISOString(),
      };
      await db.saveChunk(chunkRecord);
      savedChunks.push(chunkRecord);
    }

    return savedChunks;
  }

  // Hybrid Semantic Search with Metadata Filtering
  async search(query: string, filter?: VectorFilter, topK = 6): Promise<RetrievalResult[]> {
    await this.initializeKnowledgeBase();
    const queryVector = await EmbeddingService.generateEmbedding(query);
    const allChunks = await db.getAllChunks();

    const scored: RetrievalResult[] = [];

    for (const chunk of allChunks) {
      // Apply Metadata Filter. user_upload chunks are strictly scoped to
      // the requesting user/startup; government knowledge is shared.
      if (filter) {
        if (filter.sourceType && chunk.sourceType !== filter.sourceType) continue;
        if (filter.documentId && chunk.documentId !== filter.documentId) continue;
        if (chunk.sourceType === "user_upload") {
          if (filter.userId && chunk.userId !== filter.userId) continue;
          if (filter.startupId && chunk.startupId !== filter.startupId) continue;
          // Never return another user's uploads when no scope is given.
          if (!filter.userId && !filter.startupId) continue;
        } else if (filter.startupId && chunk.startupId !== filter.startupId && chunk.startupId !== "government_knowledge_base") continue;
      } else if (chunk.sourceType === "user_upload") {
        continue;
      }

      const score = chunk.vector ? EmbeddingService.cosineSimilarity(queryVector, chunk.vector) : 0;
      
      // Exact keyword match boost
      const queryLower = query.toLowerCase();
      const contentLower = chunk.content.toLowerCase();
      let keywordBoost = 0;
      const keywords = queryLower.split(/\s+/).filter(w => w.length > 3);
      for (const kw of keywords) {
        if (contentLower.includes(kw)) keywordBoost += 0.08;
      }

      scored.push({
        chunk,
        score: Math.min(1.0, score + keywordBoost),
      });
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

export const vectorStore = VectorStore.getInstance();
