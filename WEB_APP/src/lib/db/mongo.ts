import mongoose from "mongoose";
import { config } from "../config";

let cached: typeof mongoose | null = null;

/** Cached connection — safe to call from any API route / server path. */
export async function getConnection(): Promise<typeof mongoose> {
  if (cached && cached.connection.readyState === 1) return cached;
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }
  cached = await mongoose.connect(config.databaseUrl, {
    serverSelectionTimeoutMS: 15000,
    maxPoolSize: 10,
  });
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
