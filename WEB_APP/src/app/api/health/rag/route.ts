import { NextRequest, NextResponse } from "next/server";
import { getQdrantClient } from "@/lib/qdrant/client";
import { getEmbeddingProvider } from "@/lib/embeddings/provider";
import { config } from "@/lib/config";
import Groq from "groq-sdk";

export async function GET(req: NextRequest) {
  const health = {
    qdrant: "disconnected",
    collection: "missing",
    embedding: "unavailable",
    groq: "unavailable"
  };

  try {
    // 1. Qdrant Health
    try {
      const qdrant = getQdrantClient();
      const collections = await qdrant.getCollections();
      health.qdrant = "connected";
      
      const exists = collections.collections.some(c => c.name === config.qdrant.collection);
      if (exists) {
        health.collection = "exists";
      }
    } catch (e) {
      console.error("Qdrant health check failed", e);
    }

    // 2. Embedding Health
    try {
      const provider = getEmbeddingProvider();
      await provider.embed("health check");
      health.embedding = "available";
    } catch (e) {
      console.error("Embedding health check failed", e);
    }

    // 3. Groq Health
    try {
      const groq = new Groq({ apiKey: config.groq.apiKey });
      await groq.models.list();
      health.groq = "available";
    } catch (e) {
      console.error("Groq health check failed", e);
    }

    return NextResponse.json({
      success: true,
      health
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      health
    }, { status: 500 });
  }
}
