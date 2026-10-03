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
    embeddingModel: process.env.EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2",
    url: process.env.VECTOR_DATABASE_URL || "",
    apiKey: process.env.VECTOR_DATABASE_API_KEY || "",
  },

  qdrant: {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    apiKey: process.env.QDRANT_API_KEY || "",
    collection: process.env.QDRANT_COLLECTION || "arova_documents",
  },

  embeddings: {
    provider: process.env.EMBEDDING_PROVIDER || "local", 
    model: process.env.EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2",
    dimensions: Number(process.env.EMBEDDING_DIMENSIONS || "384"),
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || "local",
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
    maxUploadMb: Number(process.env.MAX_UPLOAD_MB || "15"),
  },

  tavily: {
    apiKey: process.env.TAVILY_API_KEY || "",
  },
};
