import { getEmbeddingProvider, cosineSimilarity as cosine } from "../embeddings/provider";

// Backwards-compatible facade. Real work is done by the configured
// EmbeddingProvider (localHash by default, remote via EMBEDDING_* env).
export class EmbeddingService {
  static async generateEmbedding(text: string): Promise<number[]> {
    return getEmbeddingProvider().embed(text);
  }

  static cosineSimilarity(a: number[], b: number[]): number {
    return cosine(a, b);
  }

  static providerName(): string {
    return getEmbeddingProvider().name;
  }
}
