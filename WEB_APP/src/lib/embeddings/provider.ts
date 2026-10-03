import { config } from "../config";
import { pipeline } from "@huggingface/transformers";

export interface EmbeddingProvider {
  readonly name: string;
  readonly dimensions: number;
  embed(text: string): Promise<number[]>;
}

class LocalEmbeddingProvider implements EmbeddingProvider {
  readonly name = "local";
  readonly dimensions: number;
  private modelName: string;
  private initPromise: Promise<any> | null = null;
  private extractor: any = null;

  constructor(modelName: string, dimensions = 384) {
    this.modelName = modelName;
    this.dimensions = dimensions;
  }

  private async getExtractor() {
    if (this.extractor) return this.extractor;
    if (!this.initPromise) {
      this.initPromise = pipeline("feature-extraction", this.modelName, {
        dtype: "fp32"
      }).then(p => {
        this.extractor = p;
        return p;
      });
    }
    return this.initPromise;
  }

  async embed(text: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    // Slice text to prevent token limit errors. MiniLM typically supports 512 tokens.
    // Roughly 512 tokens = 2000 chars
    const safeText = text.slice(0, 2000);
    
    const output = await extractor(safeText, { pooling: "mean", normalize: true });
    // Convert Float32Array to standard array
    return Array.from(output.data);
  }
}

let cached: EmbeddingProvider | null = null;

export function getEmbeddingProvider(): EmbeddingProvider {
  if (cached) return cached;
  
  if (config.embeddings.provider === "local") {
    cached = new LocalEmbeddingProvider(
      config.embeddings.model,
      config.embeddings.dimensions
    );
  } else {
    throw new Error(`Embedding provider ${config.embeddings.provider} is not supported. Please configure 'local' and ensure @huggingface/transformers is installed.`);
  }
  
  return cached;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return Math.max(0, Math.min(1, dot));
}
