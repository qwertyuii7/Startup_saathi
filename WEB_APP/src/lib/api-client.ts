// Centralized Typed SchemeSense API Client
// UI classification for uploads (labels only — never fake records).
function guessDocumentType(fileName: string): string {
  const n = fileName.toLowerCase();
  if (n.includes("dpiit") || n.includes("recognition")) return "DPIIT / Startup Recognition";
  if (n.includes("incorporat") || n.includes("coi") || n.includes("mca")) return "Incorporation Documents";
  if (n.includes("gst") || n.includes("tax") || n.includes("pan")) return "GST / Tax Documents";
  if (n.includes("balance") || n.includes("financial") || n.includes("p&l") || n.includes("profit") || n.includes("audit")) return "Financial Documents";
  if (n.includes("pitch") || n.includes("deck")) return "Pitch Deck";
  if (n.includes("plan") || n.includes("business")) return "Business Plan";
  if (n.includes("certificat")) return "Certificates";
  if (n.includes("founder") || n.includes("aadhaar") || n.includes("passport") || n.includes("kyc")) return "Founder Documents";
  if (n.includes("fund") || n.includes("invest") || n.includes("bank") || n.includes("statement")) return "Funding Documents";
  if (n.includes("scheme") || n.includes("grant") || n.includes("gazette") || n.includes("policy")) return "Government Scheme Documents";
  return "Other";
}

export const DOCUMENT_CATEGORIES = [
  "Incorporation Documents",
  "DPIIT / Startup Recognition",
  "GST / Tax Documents",
  "Financial Documents",
  "Pitch Deck",
  "Business Plan",
  "Certificates",
  "Founder Documents",
  "Funding Documents",
  "Government Scheme Documents",
  "Other",
];

export class ApiClient {
  private static baseUrl = "";

  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      // Session cookie is HTTP-only; always send it on same-origin calls.
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data?.error?.message || `Request failed with status ${res.status}`);
    }

    return data;
  }

  // Auth APIs — session is an HTTP-only cookie; no token is ever
  // stored in localStorage / sessionStorage / React state.
  static auth = {
    loginWithGoogle: async (payload: { credential: string }, signal?: AbortSignal) => {
      return ApiClient.request<{ success: boolean; user: any }>("/api/auth/google", {
        method: "POST",
        body: JSON.stringify(payload),
        ...(signal ? { signal } : {}),
      });
    },
    registerWithEmail: async (payload: { name: string; email: string; password: string; confirmPassword: string }, signal?: AbortSignal) => {
      return ApiClient.request<{ success: boolean; user: any }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
        ...(signal ? { signal } : {}),
      });
    },
    loginWithEmail: async (payload: { email: string; password: string }, signal?: AbortSignal) => {
      return ApiClient.request<{ success: boolean; user: any }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
        ...(signal ? { signal } : {}),
      });
    },
    getMe: async (signal?: AbortSignal) => {
      return ApiClient.request<{ success: boolean; user: any }>(
        "/api/auth/me",
        signal ? { signal } : undefined
      );
    },
    logout: async () => {
      return ApiClient.request<{ success: boolean }>("/api/auth/logout", { method: "POST" });
    },
  };

  // Startup Profile APIs
  static startup = {
    getProfile: async () => {
      return ApiClient.request<{ success: boolean; startup: any }>("/api/startup/profile");
    },
    updateProfile: async (profile: any) => {
      return ApiClient.request<{ success: boolean; startup: any }>("/api/startup/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
    },
  };

  // Documents APIs — real multipart upload of the actual File object.
  static documents = {
    list: async () => {
      return ApiClient.request<{ success: boolean; documents: any[] }>("/api/documents");
    },
    upload: async (fileOrData: File | { name: string; type: string; content?: string; mimeType?: string }) => {
      if (typeof File !== "undefined" && fileOrData instanceof File) {
        const form = new FormData();
        form.append("file", fileOrData);
        form.append("type", guessDocumentType(fileOrData.name));
        const res = await fetch("/api/documents/upload", {
          method: "POST",
          credentials: "same-origin",
          body: form,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          throw new Error(data?.error?.message || `Upload failed with status ${res.status}`);
        }
        return data as { success: boolean; document: any };
      }
      return ApiClient.request<{ success: boolean; document: any }>("/api/documents/upload", {
        method: "POST",
        body: JSON.stringify(fileOrData),
      });
    },
    delete: async (id: string) => {
      return ApiClient.request<{ success: boolean; message: string }>(`/api/documents/${id}`, {
        method: "DELETE",
      });
    },
  };

  // Schemes APIs
  static schemes = {
    list: async () => {
      return ApiClient.request<{ success: boolean; schemes: any[] }>("/api/schemes");
    },
    get: async (id: string) => {
      return ApiClient.request<{ success: boolean; scheme: any }>(`/api/schemes/${id}`);
    },
    evaluate: async (schemeId?: string) => {
      const qs = schemeId ? `?schemeId=${encodeURIComponent(schemeId)}` : "";
      return ApiClient.request<{ success: boolean; evaluations: any[] }>(`/api/schemes/evaluate${qs}`);
    },
  };

  // Deep Analysis APIs
  static deepAnalysis = {
    run: async (query: string, scope?: any) => {
      return ApiClient.request<{
        success: boolean;
        analysis: any;
        findings: any[];
        actionPlan: any[];
        incubators: any[];
      }>("/api/deep-analysis", {
        method: "POST",
        body: JSON.stringify({ query, scope }),
      });
    },
    getHistory: async () => {
      return ApiClient.request<{ success: boolean; history: any[] }>("/api/deep-analysis/history");
    },
    get: async (id: string) => {
      return ApiClient.request<{ success: boolean; analysis: any }>(`/api/deep-analysis/${id}`);
    },
    toggleAction: async (id: string, actionId: string, completed: boolean) => {
      return ApiClient.request<{ success: boolean; analysis: any }>(`/api/deep-analysis/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ actionId, completed }),
      });
    },
  };

  // Chat / AI Assistant APIs
  static chat = {
    send: async (
      query: string,
      conversationId?: string,
      selectedSchemeId?: string,
      pageContext?: {
        pathname?: string;
        pageName?: string;
        pageDescription?: string;
        selectedSchemeId?: string;
        selectedSchemeName?: string;
        analysisId?: string;
        documentId?: string;
        relevantEntityId?: string;
      }
    ) => {
      return ApiClient.request<{
        success: boolean;
        message: {
          role: "assistant";
          content: string;
          sources: { type: string; title: string; ref: string; url?: string; domain?: string; snippet?: string }[];
        };
        actions?: { type: string; label: string; route: string; entityId?: string }[];
        citations?: { type: string; title: string; ref: string; url?: string; domain?: string; snippet?: string }[];
        metadata?: {
          webSearchUsed: boolean;
          searchProvider?: string;
        };
      }>("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ query, conversationId, selectedSchemeId, pageContext }),
      });
    },
    getHistory: async (conversationId: string) => {
      return ApiClient.request<{ success: boolean; messages: any[] }>(`/api/ai/chat/history?conversationId=${conversationId}`);
    },
    listConversations: async () => {
      return ApiClient.request<{ success: boolean; conversations: any[] }>("/api/ai/conversations");
    },
    getConversation: async (id: string) => {
      return ApiClient.request<{ success: boolean; conversation: any; messages: any[] }>(`/api/ai/conversations/${id}`);
    },
    deleteConversation: async (id: string) => {
      return ApiClient.request<{ success: boolean; message: string }>(`/api/ai/conversations/${id}`, {
        method: "DELETE",
      });
    },
  };

  // Incubators APIs
  static incubators = {
    list: async () => {
      return ApiClient.request<{ success: boolean; incubators: any[] }>("/api/incubators");
    },
  };

  // Applications APIs
  static applications = {
    generateDraft: async (schemeId?: string) => {
      return ApiClient.request<{ success: boolean; draft: any }>("/api/applications/draft", {
        method: "POST",
        body: JSON.stringify({ schemeId }),
      });
    },
    getDraft: async (id: string) => {
      return ApiClient.request<{ success: boolean; draft: any }>(`/api/applications/${id}`);
    },
  };

  // Onboarding APIs
  static onboarding = {
    getStatus: async () => {
      return ApiClient.request<{
        success: boolean;
        completed: boolean;
        currentStep: number;
        profile: any;
        startup: any;
      }>("/api/onboarding");
    },
    updateStep: async (data: { step?: number; startupData?: any; founderData?: any }) => {
      return ApiClient.request<{
        success: boolean;
        currentStep: number;
        startup: any;
      }>("/api/onboarding", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    complete: async () => {
      return ApiClient.request<{
        success: boolean;
        message: string;
        user: any;
        startup: any;
      }>("/api/onboarding/complete", {
        method: "POST",
      });
    },
  };
}

export const api = ApiClient;
