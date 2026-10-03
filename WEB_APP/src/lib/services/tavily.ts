import { config } from "../config";

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface TavilySearchResponse {
  query: string;
  results: TavilySearchResult[];
}

export class TavilyService {
  static async searchWeb(query: string, limit = 5): Promise<TavilySearchResponse> {
    const apiKey = config.tavily.apiKey || process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error("Missing TAVILY_API_KEY environment variable");
    }

    // Include official domains to prioritize authoritative sources
    const includeDomains = [
      "gov.in",
      "nic.in",
      "mygov.in",
      "startupindia.gov.in",
    ];

    const body = {
      api_key: apiKey,
      query,
      search_depth: "basic",
      include_answer: false,
      include_domains: includeDomains,
      max_results: limit,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errorMsg = `Tavily returned ${res.status}`;
        try {
          const errData = await res.json();
          errorMsg = errData.error || errorMsg;
        } catch {}
        throw new Error(`Tavily search failed: ${errorMsg}`);
      }

      const data = await res.json();

      return {
        query: data.query || query,
        results: (data.results || []).map((r: any) => ({
          title: r.title,
          url: r.url,
          content: r.content,
          score: r.score,
          publishedDate: r.published_date,
        })),
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
