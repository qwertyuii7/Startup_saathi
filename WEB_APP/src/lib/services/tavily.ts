import { config } from "../config";

export type WebSourceType = "official" | "official_scheme" | "gazette" | "incubator" | "reputable" | "web";

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
  domain?: string;
  sourceType?: WebSourceType;
  favicon?: string;
}

export interface TavilySearchResponse {
  query: string;
  results: TavilySearchResult[];
  searchedAt: string;
}

const OFFICIAL_PATTERNS: { re: RegExp; type: WebSourceType }[] = [
  { re: /\.gov\.in(\/|$)/i, type: "official" },
  { re: /\.nic\.in(\/|$)/i, type: "official" },
  { re: /startupindia\.gov\.in/i, type: "official_scheme" },
  { re: /dpiit\.gov\.in/i, type: "official_scheme" },
  { re: /mygov\.in/i, type: "official" },
  { re: /india\.gov\.in/i, type: "official" },
  { re: /\.edu(\/|$)|iitk?\.ac\.in|iit.*\.ac\.in|nit.*\.ac\.in/i, type: "incubator" },
  { re: /gazette|egazette|notification.*\.pdf|\.pdf(\?|$)/i, type: "gazette" },
];

const REPUTABLE = /yourstory|inc42|economictimes|business-standard| Hindu |livemint|moneycontrol|pib\.gov\.in/i;

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function faviconFor(domain: string): string {
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : "";
}

export function classifySource(url: string, title = ""): WebSourceType {
  for (const p of OFFICIAL_PATTERNS) {
    if (p.re.test(url) || (p.type === "gazette" && p.re.test(title))) return p.type;
  }
  if (REPUTABLE.test(`${url} ${title}`)) return "reputable";
  return "web";
}

/** Official-first ranking (§6): gov > scheme pages > gazettes/PDFs > incubator/edu > reputable > general. */
export function rankResults(results: TavilySearchResult[]): TavilySearchResult[] {
  const weight: Record<WebSourceType, number> = {
    official: 0,
    official_scheme: 1,
    gazette: 2,
    incubator: 3,
    reputable: 4,
    web: 5,
  };
  return [...results].sort(
    (a, b) => weight[a.sourceType || "web"] - weight[b.sourceType || "web"] || (b.score || 0) - (a.score || 0)
  );
}

export class TavilyService {
  static async searchWeb(query: string, limit = 5): Promise<TavilySearchResponse> {
    const apiKey = config.tavily.apiKey || process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error("Missing TAVILY_API_KEY environment variable");
    }

    const body = {
      api_key: apiKey,
      query,
      search_depth: "advanced",
      include_answer: false,
      include_raw_content: false,
      max_results: Math.min(Math.max(limit, 3), 10),
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

      const mapped: TavilySearchResult[] = (data.results || []).map((r: any) => {
        const url: string = r.url || "";
        const domain = domainOf(url);
        return {
          title: r.title || domain || "Web source",
          url,
          content: r.content || "",
          score: typeof r.score === "number" ? r.score : 0,
          publishedDate: r.published_date,
          domain,
          sourceType: classifySource(url, r.title || ""),
          favicon: faviconFor(domain),
        };
      });

      return {
        query: data.query || query,
        results: rankResults(mapped.filter((r) => r.url.startsWith("http"))),
        searchedAt: new Date().toISOString(),
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
