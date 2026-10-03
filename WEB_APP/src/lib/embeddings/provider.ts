import { config } from "../config";

/**
 * Embedding provider abstraction.
 *
 * - "local"  (default): offline-safe hashed word/bigram embeddings.
 *   Honest weak-semantic signal (lexical overlap in vector form) —
 *   NOT a neural embedding model.
 * - "remote": OpenAI-compatible embeddings endpoint, configured via
 *   EMBEDDING_API_URL / EMBEDDING_API_KEY / EMBEDDING_MODEL.
 *   (Groq is LLM inference only and provides no embeddings.)
 */
export interface EmbeddingProvider {
  readonly name: string;
  readonly dimensions: number;
  embed(text: string): Promise<number[]>;
}

function normalize(vector: number[]): number[] {
  let magnitude = 0;
  for (const v of vector) magnitude += v * v;
  magnitude = Math.sqrt(magnitude);
  if (magnitude === 0) return vector;
  return vector.map((v) => v / magnitude);
}

class LocalHashEmbeddingProvider implements EmbeddingProvider {
  readonly name = "local-hash";
  readonly dimensions: number;

  constructor(dimensions = 256) {
    this.dimensions = dimensions;
  }

  async embed(text: string): Promise<number[]> {
    const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
    const words = cleanText.split(/\s+/).filter((w) => w.length > 1);
    const vector = new Array(this.dimensions).fill(0);

    const hashToBucket = (s: string): number => {
      let hash = 2166136261;
      for (let j = 0; j < s.length; j++) {
        hash ^= s.charCodeAt(j);
        hash = Math.imul(hash, 16777619);
      }
      return Math.abs(hash) % this.dimensions;
    };

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      // Rare-word boost (simple IDF proxy): longer tokens weigh more.
      const weight = 1 + word.length / 8;
      vector[hashToBucket(`w:${word}`)] += weight;
      if (i > 0) {
        vector[hashToBucket(`b:${words[i - 1]}_${word}`)] += weight * 1.5;
      }
    }
    return normalize(vector);
  }
}

class RemoteEmbeddingProvider implements EmbeddingProvider {
  readonly name: string;
  readonly dimensions: number;

  constructor(
    private apiUrl: string,
    private apiKey: string,
    private model: string,
    dimensions = 1536
  ) {
    this.name = `remote:${model}`;
    this.dimensions = dimensions;
  }

  async embed(text: string): Promise<number[]> {
    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({ model: this.model, input: text.slice(0, 8000) }),
    });
    if (!res.ok) {
      throw new Error(`Embedding endpoint failed with status ${res.status}`);
    }
    const data = (await res.json()) as {
      data?: { embedding?: number[] }[];
      embedding?: number[];
    };
    const embedding = data.data?.[0]?.embedding || data.embedding;
    if (!embedding || embedding.length === 0) {
      throw new Error("Embedding endpoint returned no vector");
    }
    return normalize(embedding);
  }
}

let cached: EmbeddingProvider | null = null;

export function getEmbeddingProvider(): EmbeddingProvider {
  if (cached) return cached;
  if (
    config.embeddings.provider === "remote" &&
    config.embeddings.apiUrl
  ) {
    cached = new RemoteEmbeddingProvider(
      config.embeddings.apiUrl,
      config.embeddings.apiKey,
      config.embeddings.model,
      config.embeddings.dimensions || 1536
    );
  } else {
    cached = new LocalHashEmbeddingProvider(config.embeddings.dimensions || 256);
  }
  return cached;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return Math.max(0, Math.min(1, dot));
}
