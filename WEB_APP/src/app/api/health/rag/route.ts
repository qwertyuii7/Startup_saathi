import { NextRequest, NextResponse } from "next/server";
import { getEmbeddingProvider } from "@/lib/embeddings/provider";
import { config } from "@/lib/config";
import { validateEnv } from "@/lib/env";
import Groq from "groq-sdk";

export async function GET(req: NextRequest) {
  const health: Record<string, string> = {
    qdrant: "disconnected",
    collection: "missing",
    embedding: "unavailable",
    groq: "unavailable",
    database: "unknown",
  };
  let qdrantDetail: Record<string, unknown> = {};

  try {
    // 1. Qdrant Health (dimension-aware: reports effective collection)
    try {
      const { qdrantHealthCheck } = await import("@/lib/qdrant/client");
      const q = await qdrantHealthCheck();
      if (q.reachable) health.qdrant = "connected";
      if (q.collectionExists) health.collection = "exists";
      qdrantDetail = {
        activeCollection: q.activeCollection,
        configuredCollection: config.qdrant.collection,
        dimensionMismatch: q.dimensionMismatch,
      };
      if (q.dimensionMismatch) {
        console.warn(`[health] ${q.dimensionMismatch}`);
      }
    } catch (e) {
      console.error("Qdrant health check failed", e);
    }

    // 2. Embedding Health
    try {
      const provider = getEmbeddingProvider();
      await provider.embed("health check");
      health.embedding = `available (${provider.name}, ${provider.dimensions}d)`;
    } catch (e) {
      console.error("Embedding health check failed", e);
    }

    // 3. Groq Health
    try {
      if (!config.groq.apiKey) throw new Error("GROQ_API_KEY missing");
      const groq = new Groq({ apiKey: config.groq.apiKey });
      await groq.models.list();
      health.groq = `available (${config.groq.model})`;
    } catch (e) {
      console.error("Groq health check failed", e);
    }

    // 4. Database Health (no secrets exposed)
    try {
      const { db } = await import("@/lib/db/store");
      await db.getAllSchemes();
      health.database = config.databaseUrl ? "connected (mongodb)" : "connected (in-memory fallback)";
    } catch (e) {
      console.error("Database health check failed", e);
      health.database = "unavailable";
    }

    const env = validateEnv();

    return NextResponse.json({
      success: true,
      health,
      qdrant: qdrantDetail,
      env: { ok: env.ok, missing: env.missing, warnings: env.warnings },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      health
    }, { status: 500 });
  }
}
