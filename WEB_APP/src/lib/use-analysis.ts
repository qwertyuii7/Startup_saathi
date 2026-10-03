"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";

export interface AnalysisRecord {
  id: string;
  title: string;
  query: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  schemesAnalyzedCount: number;
  eligibleCount: number;
  potentialCount: number;
  missingCount: number;
  notEligibleCount: number;
  findings: {
    schemeId: string;
    schemeName: string;
    governmentLevel: string;
    state?: string;
    fitLevel: string;
    fitLabel: string;
    criteriaMetCount: number;
    totalCriteriaCount: number;
    maxBenefit: string;
    criteriaBreakdown: {
      requirementId: string;
      requirement: string;
      status: string;
      statusLabel: string;
      evidenceSnippet?: string;
      evidenceDocumentName?: string;
      evidencePage?: number;
      evidenceStrength: string;
      sourceCitation: { title: string; clause: string; url: string };
      aiReasoning: string;
    }[];
    qualifyingFactors: string[];
    blockingFactors: {
      issue: string;
      required: string;
      current: string;
      impact: string;
      resolutionAction: string;
    }[];
  }[];
  actionPlan: {
    id: string;
    stepNumber: string;
    title: string;
    description: string;
    estimatedEffort: string;
    unlocksCount: number;
    unlocksDescription: string;
    completed: boolean;
    actionLabel: string;
    actionType: string;
    category: string;
  }[];
  incubatorMatches?: {
    id: string;
    name: string;
    location: string;
    state: string;
    focusArea: string;
    supportedSchemes: string[];
    benefits: string[];
    applicationStatus: string;
    websiteUrl: string;
  }[];
  executiveSummary?: string;
  readiness?: {
    totalRequirements: number;
    supported: number;
    needsVerification: number;
    missing: number;
    score: number;
    formula: string;
  };
  risks?: { title: string; evidence: string; schemeId?: string }[];
  opportunities?: { title: string; reason: string; schemeId?: string }[];
}

/** Fetch a single persisted analysis by id (401/403/404 surfaced as errors). */
export function useAnalysis(analysisId: string | undefined) {
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!analysisId) {
      setIsLoading(false);
      setError("No analysis selected.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await api.deepAnalysis.get(analysisId);
      if (res.success && res.analysis) {
        setAnalysis(res.analysis as AnalysisRecord);
      } else {
        throw new Error("Analysis not found.");
      }
    } catch (e: unknown) {
      setAnalysis(null);
      setError(e instanceof Error ? e.message : "Could not load this analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    load();
  }, [load]);

  return { analysis, isLoading, error, retry: load };
}

/** Latest analyses for the authenticated user, newest first. */
export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.deepAnalysis.getHistory();
      setHistory(((res.history || []) as AnalysisRecord[]));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load analysis history.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { history, isLoading, error, retry: load };
}
