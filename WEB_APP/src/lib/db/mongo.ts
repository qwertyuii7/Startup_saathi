import mongoose from "mongoose";
import { config } from "../config";

let cached: typeof mongoose | null = null;

/** Cached connection — safe to call from any API route / server path. */
export async function getConnection(): Promise<typeof mongoose> {
  if (cached && cached.connection.readyState === 1) return cached;
  // Use config.databaseUrl first, fall back to reading env directly
  const url = config.databaseUrl || process.env.DATABASE_URL || "";
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  console.log("[db] Connecting to MongoDB...", url.substring(0, 30) + "...");
  cached = await mongoose.connect(url, {
    serverSelectionTimeoutMS: 30000,
    maxPoolSize: 10,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });
  console.log("[db] MongoDB connected:", cached.connection.host);
  return cached;
}

export function isMongoConfigured(): boolean {
  return !!config.databaseUrl;
}

export interface PlainDoc {
  id: string;
  [key: string]: unknown;
}

interface MongooseLike {
  toObject(opts?: unknown): Record<string, unknown>;
}

/** Strip mongoose internals, keep our string `id`. */
export function toPlain<T>(doc: MongooseLike | null | undefined): T | null {
  if (!doc) return null;
  const obj = doc.toObject({ depopulate: true });
  delete obj._id;
  delete obj.__v;
  return obj as unknown as T;
}

export function toPlainList<T>(docs: MongooseLike[] | null | undefined): T[] {
  if (!docs) return [];
  return docs.map((d) => toPlain<T>(d)).filter((x): x is T => x !== null);
}
