import { config } from "./config";

export interface EnvValidation {
  ok: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate server-side environment at startup / health-check time.
 * Never throws for optional keys — returns structured result so the
 * API can fail clearly instead of silently using fake implementations.
 */
export function validateEnv(): EnvValidation {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!config.groq.apiKey) missing.push("GROQ_API_KEY");
  if (!config.databaseUrl) warnings.push("DATABASE_URL not set — using in-memory store (data will not persist).");
  if (!config.qdrant.url) warnings.push("QDRANT_URL not set - vector retrieval unavailable.");
  if (!config.auth.jwtSecret || config.auth.jwtSecret.includes("dev_")) {
    warnings.push("JWT_SECRET is using a dev fallback - set a real secret in production.");
  }
  if (!config.tavily.apiKey) {
    warnings.push("TAVILY_API_KEY not set - current web search disabled, RAG answers use stored knowledge only.");
  }
  if (config.embeddings.provider !== "local") {
    warnings.push(`EMBEDDING_PROVIDER=${config.embeddings.provider} is not supported - use 'local'.`);
  }

  return { ok: missing.length === 0, missing, warnings };
}

/** Call at server startup for mandatory keys; logs warnings for optional. */
export function assertRequiredEnv(): void {
  const { ok, missing, warnings } = validateEnv();
  for (const w of warnings) console.warn(`[env] ${w}`);
  if (!ok) {
    console.error(`[env] Missing mandatory environment variables: ${missing.join(", ")}`);
  }
}
