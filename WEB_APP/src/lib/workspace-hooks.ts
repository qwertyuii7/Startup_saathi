"use client";

import { useMemo } from "react";
import { useWorkspaceAnalysis } from "@/lib/analysis-context";

/**
 * Reusable Deep Analysis data hooks — all derived from the single
 * workspace analysis fetch so pages share loading/error/empty states
 * instead of implementing random fetch logic.
 */

export function useDeepAnalysis() {
  return useWorkspaceAnalysis();
}

export function useRequirements() {
  const { analysis, isLoading, error, refreshAnalysis } = useWorkspaceAnalysis();
  const requirements = useMemo(() => {
    if (!analysis) return [];
    return analysis.findings.flatMap((f) =>
      f.criteriaBreakdown.map((c) => ({
        ...c,
        schemeId: f.schemeId,
        schemeName: f.schemeName,
      }))
    );
  }, [analysis]);
  return { requirements, analysis, isLoading, error, refresh: refreshAnalysis };
}

export function useEligibility() {
  const { analysis, isLoading, error, refreshAnalysis } = useWorkspaceAnalysis();
  return { findings: analysis?.findings || [], analysis, isLoading, error, refresh: refreshAnalysis };
}

export function useEvidence() {
  const { analysis, isLoading, error, refreshAnalysis } = useWorkspaceAnalysis();
  const evidence = useMemo(() => {
    if (!analysis) return [];
    return analysis.findings.flatMap((f) =>
      f.criteriaBreakdown
        .filter((c) => c.evidenceDocumentName)
        .map((c) => ({
          requirementId: c.requirementId,
          requirement: c.requirement,
          documentName: c.evidenceDocumentName!,
          page: c.evidencePage,
          excerpt: c.evidenceSnippet,
          status: c.status,
          strength: c.evidenceStrength,
          source: c.sourceCitation,
          explanation: c.aiReasoning,
          schemeId: f.schemeId,
          schemeName: f.schemeName,
        }))
    );
  }, [analysis]);
  return { evidence, analysis, isLoading, error, refresh: refreshAnalysis };
}

export function useActionPlan() {
  const { analysis, isLoading, error, refreshAnalysis } = useWorkspaceAnalysis();
  return { actionPlan: analysis?.actionPlan || [], analysis, isLoading, error, refresh: refreshAnalysis };
}

export function useIncubators() {
  const { analysis, isLoading, error, refreshAnalysis } = useWorkspaceAnalysis();
  return { incubators: analysis?.incubatorMatches || [], analysis, isLoading, error, refresh: refreshAnalysis };
}

export function useReadiness() {
  const { analysis, isLoading, error, refreshAnalysis } = useWorkspaceAnalysis();
  return { readiness: analysis?.readiness, analysis, isLoading, error, refresh: refreshAnalysis };
}
