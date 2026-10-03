import { QdrantClient } from "@qdrant/js-client-rest";
import { config } from "../config";

let client: QdrantClient | null = null;
let isInitialized = false;

export function getQdrantClient(): QdrantClient {
  if (!client) {
    if (!config.qdrant.url) {
      throw new Error("Missing QDRANT_URL in environment variables.");
    }
    client = new QdrantClient({
      url: config.qdrant.url,
      apiKey: config.qdrant.apiKey || undefined,
    });
  }
  return client;
}

export async function ensureCollection(): Promise<void> {
  if (isInitialized) return;
  const qdrant = getQdrantClient();
  const collectionName = config.qdrant.collection;
  const dimensions = config.embeddings.dimensions;

  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some((c) => c.name === collectionName);

    if (!exists) {
      console.log(`[Qdrant] Creating collection '${collectionName}' with ${dimensions} dimensions`);
      await qdrant.createCollection(collectionName, {
        vectors: {
          size: dimensions,
          distance: "Cosine",
        },
      });
      
      // Create payload indexes for faster filtering
      await qdrant.createPayloadIndex(collectionName, {
        field_name: "userId",
        field_schema: "keyword",
      });
      await qdrant.createPayloadIndex(collectionName, {
        field_name: "startupId",
        field_schema: "keyword",
      });
      await qdrant.createPayloadIndex(collectionName, {
        field_name: "sourceType",
        field_schema: "keyword",
      });
      await qdrant.createPayloadIndex(collectionName, {
        field_name: "documentId",
        field_schema: "keyword",
      });
    }
    isInitialized = true;
  } catch (err) {
    console.error("[Qdrant] Failed to ensure collection:", err);
    throw err;
  }
}
