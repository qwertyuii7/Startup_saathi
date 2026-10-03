import Groq from "groq-sdk";
import { config } from "../config";

export class GroqService {
  private static client: Groq | null = null;

  private static getClient(): Groq | null {
    if (!this.client && config.groq.apiKey) {
      this.client = new Groq({ apiKey: config.groq.apiKey });
    }
    return this.client;
  }

  // Generate Chat Completion (with one fallback-model retry)
  static async chat(messages: { role: "system" | "user" | "assistant"; content: string }[], options?: { temperature?: number; maxTokens?: number; model?: string }): Promise<string> {
    const client = this.getClient();

    if (!client) {
      console.warn("GROQ_API_KEY is not configured; using deterministic evidentiary response generation.");
      return this.generateFallbackResponse(messages);
    }

    const primary = options?.model || config.groq.model;
    try {
      const response = await client.chat.completions.create({
        model: primary,
        messages,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens ?? 2048,
      });

      return response.choices[0]?.message?.content || "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Groq API error:", msg);
      // Retry once on the fast model (covers decommissioned-model errors).
      if (primary !== config.groq.fastModel) {
        try {
          const retry = await client.chat.completions.create({
            model: config.groq.fastModel,
            messages,
            temperature: options?.temperature ?? 0.2,
            max_tokens: options?.maxTokens ?? 2048,
          });
          const content = retry.choices[0]?.message?.content || "";
          if (content) return content;
        } catch (retryErr: unknown) {
          console.error("Groq fallback-model error:", retryErr instanceof Error ? retryErr.message : retryErr);
        }
      }
      return this.generateFallbackResponse(messages);
    }
  }

  // Generate Structured JSON Output
  static async generateJSON<T>(messages: { role: "system" | "user" | "assistant"; content: string }[], schemaDescription: string): Promise<T | null> {
    const client = this.getClient();

    const systemPrompt = messages.find(m => m.role === "system")?.content || "";
    const enrichedMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      {
        role: "system",
        content: `${systemPrompt}\n\nIMPORTANT: You must respond ONLY with a valid JSON object matching this schema:\n${schemaDescription}\nDo NOT include markdown backticks (\`\`\`json) or conversational preamble. Output strict JSON only.`,
      },
      ...messages.filter(m => m.role !== "system"),
    ];

    if (!client) {
      return null;
    }

    const attempt = async (model: string): Promise<T | null> => {
      try {
        const response = await client.chat.completions.create({
          model,
          messages: enrichedMessages,
          temperature: 0.1,
          response_format: { type: "json_object" },
        });

        const text = response.choices[0]?.message?.content || "{}";
        return JSON.parse(text) as T;
      } catch (err: unknown) {
        console.error(`Groq JSON generation error (${model}):`, err instanceof Error ? err.message : err);
        return null;
      }
    };

    return (await attempt(config.groq.model)) || (await attempt(config.groq.fastModel));
  }

  // Deterministic fallback response when offline.
  // Honest by design: never invents schemes, certificates, numbers,
  // or citations — it summarizes whatever evidence the caller supplied.
  private static generateFallbackResponse(messages: { role: "system" | "user" | "assistant"; content: string }[]): string {
    const systemEvidence = messages.find(m => m.role === "system")?.content || "";
    const evidenceLines = systemEvidence
      .split("\n")
      .filter(l => l.trim().startsWith("["))
      .slice(0, 4);
    const evidenceSummary =
      evidenceLines.length > 0
        ? `\n\nRetrieved evidence in your workspace:\n${evidenceLines.join("\n")}`
        : "\n\nNo indexed document evidence was retrieved for this question yet. Upload DPIIT, incorporation, GST, or financial documents on the Documents page so answers can cite them.";
    return `AROVA's AI service is temporarily unreachable, so I can only summarize what is already in your workspace. Please retry in a moment for a full grounded analysis.${evidenceSummary}`;
  }
}
