import { QdrantClient } from "@qdrant/js-client-rest";
import { config } from "../config";

let client: QdrantClient | null = null;
let isInitialized = false;
let activeCollection: string | null = null;
let dimensionMismatch: string | null = null;

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

/** Effective collection after dimension validation (call ensureCollection() first). */
export function getActiveCollection(): string {
  return activeCollection || config.qdrant.collection;
}

/** Non-empty when the configured collection's dims differ from the embedder. */
export function getDimensionMismatch(): string | null {
  return dimensionMismatch;
}

async function createCollectionWithIndexes(qdrant: QdrantClient, name: string, dimensions: number): Promise<void> {
  console.log(`[Qdrant] Creating collection '${name}' with ${dimensions} dimensions`);
  await qdrant.createCollection(name, {
    vectors: {
      size: dimensions,
      distance: "Cosine",
    },
  });

  // Create payload indexes for faster filtering
  for (const field of ["userId", "startupId", "sourceType", "documentId"]) {
    try {
      await qdrant.createPayloadIndex(name, {
        field_name: field,
        field_schema: "keyword",
      });
    } catch {
      // Index may already exist — safe to ignore.
    }
  }
}

export async function ensureCollection(): Promise<void> {
  if (isInitialized) return;
  const qdrant = getQdrantClient();
  const baseName = config.qdrant.collection;
  const dimensions = config.embeddings.dimensions;

  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some((c) => c.name === baseName);

    if (!exists) {
      await createCollectionWithIndexes(qdrant, baseName, dimensions);
      activeCollection = baseName;
    } else {
      // Validate that the existing collection matches the embedder dims.
      // A stale collection (e.g. created for a 1536-dim remote model) would
      // otherwise fail every upsert with "Vector dimension error".
      try {
        const info = await qdrant.getCollection(baseName);
        const vectors = (info as unknown as { config?: { params?: { vectors?: { size?: number } | Record<string, { size?: number }> } } }).config?.params?.vectors;
        const existingSize = typeof vectors?.size === "number"
          ? vectors.size
          : (() => {
              const named = vectors as Record<string, { size?: number }> | undefined;
              const first = named ? Object.values(named)[0] : undefined;
              return typeof first?.size === "number" ? first.size : undefined;
            })();
        if (typeof existingSize === "number" && existingSize !== dimensions) {
          const suffixed = `${baseName}_d${dimensions}`;
          dimensionMismatch =
            `Configured collection '${baseName}' has ${existingSize} dims but embedder produces ${dimensions} dims; using '${suffixed}' instead.`;
          console.warn(`[Qdrant] ${dimensionMismatch}`);
          const collections2 = await qdrant.getCollections();
          if (!collections2.collections.some((c) => c.name === suffixed)) {
            await createCollectionWithIndexes(qdrant, suffixed, dimensions);
          }
          activeCollection = suffixed;
        } else {
          activeCollection = baseName;
        }
      } catch {
        // If introspection fails, fall back to the configured name.
        activeCollection = baseName;
      }
    }
    isInitialized = true;
  } catch (err) {
    console.error("[Qdrant] Failed to ensure collection:", err);
    throw err;
  }
}

function mustMatch(key: string, value: string) {
  return { key, match: { value } };
}

/** Delete all vectors for one document (ownership already verified by caller). */
export async function deleteDocumentVectors(documentId: string): Promise<void> {
  const qdrant = getQdrantClient();
  await ensureCollection();
  await qdrant.delete(getActiveCollection(), {
    wait: true,
    filter: { must: [mustMatch("documentId", documentId)] },
  });
}

/** Delete all vectors for a user (e.g. account cleanup). */
export async function deleteUserVectors(userId: string): Promise<void> {
  const qdrant = getQdrantClient();
  await ensureCollection();
  await qdrant.delete(getActiveCollection(), {
    wait: true,
    filter: { must: [mustMatch("userId", userId)] },
  });
}

/** Count indexed points for a document — used for processing status. */
export async function countDocumentVectors(documentId: string): Promise<number> {
  const qdrant = getQdrantClient();
  await ensureCollection();
  const res = await qdrant.count(getActiveCollection(), {
    filter: { must: [mustMatch("documentId", documentId)] },
  });
  return res.count ?? 0;
}

/** Lightweight health check without exposing secrets. */
export async function qdrantHealthCheck(): Promise<{ reachable: boolean; collectionExists: boolean; activeCollection: string; dimensionMismatch: string | null }> {
  try {
    const qdrant = getQdrantClient();
    await ensureCollection();
    const collections = await qdrant.getCollections();
    const collectionExists = collections.collections.some((c) => c.name === getActiveCollection());
    return { reachable: true, collectionExists, activeCollection: getActiveCollection(), dimensionMismatch: getDimensionMismatch() };
  } catch {
    return { reachable: false, collectionExists: false, activeCollection: config.qdrant.collection, dimensionMismatch: getDimensionMismatch() };
  }
}
