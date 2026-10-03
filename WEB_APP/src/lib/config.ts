export const config = {
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL || "",
  
  auth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    jwtSecret: process.env.JWT_SECRET || "dev_schemesense_secret_key_change_in_production_32char",
    sessionSecret: process.env.SESSION_SECRET || "dev_schemesense_session_secret_32char_key",
    cookieName: "schemesense_session",
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    fastModel: process.env.GROQ_FAST_MODEL || "openai/gpt-oss-20b",
  },

  vector: {
    embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
    url: process.env.VECTOR_DATABASE_URL || "",
    apiKey: process.env.VECTOR_DATABASE_API_KEY || "",
  },

  embeddings: {
    // "local" (default, offline-safe hashed embeddings) or
    // "remote" (OpenAI-compatible embeddings endpoint).
    provider: process.env.EMBEDDING_PROVIDER || "local",
    apiUrl: process.env.EMBEDDING_API_URL || "",
    apiKey: process.env.EMBEDDING_API_KEY || "",
    model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
    dimensions: Number(process.env.EMBEDDING_DIMENSIONS || "128"),
  },

  storage: {
    // "local" (default — files under public/uploads) or
    // "cloudinary" (requires CLOUDINARY_* vars below).
    provider: process.env.STORAGE_PROVIDER || "local",
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
    maxUploadMb: Number(process.env.MAX_UPLOAD_MB || "15"),
  },
};
