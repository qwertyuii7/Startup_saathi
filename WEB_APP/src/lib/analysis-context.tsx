"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api-client";
import { AnalysisRecord } from "@/lib/use-analysis";

interface AnalysisContextType {
  analysis: AnalysisRecord | null;
  isLoading: boolean;
  error: string;
  refreshAnalysis: () => Promise<void>;
  selectAnalysis: (id: string) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get ID from URL, or use a default/latest one if needed.
  // For this architecture, we expect ?id=xyz. If not present, we can either
  // fetch the latest or leave it empty so the user is prompted to select one.
  const idFromUrl = searchParams ? searchParams.get("id") : null;

  const loadAnalysis = async (targetId?: string) => {
    setIsLoading(true);
    setError("");
    
    try {
      let fetchId = targetId || idFromUrl;
      
      // If no ID is provided, try to fetch the history and use the latest one
      if (!fetchId) {
        const historyRes = await api.deepAnalysis.getHistory();
        if (historyRes.success && historyRes.history && historyRes.history.length > 0) {
          fetchId = historyRes.history[0].id;
          // Update URL silently
          if (pathname) {
            router.replace(`${pathname}?id=${fetchId}`);
          }
        } else {
          // No analysis exists yet
          setAnalysis(null);
          setIsLoading(false);
          return;
        }
      }

      if (fetchId) {
        const res = await api.deepAnalysis.get(fetchId);
        if (res.success && res.analysis) {
          setAnalysis(res.analysis as AnalysisRecord);
        } else {
          setError("Analysis not found.");
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load analysis.");
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, [idFromUrl]);

  const selectAnalysis = (id: string) => {
    if (pathname) {
      router.push(`${pathname}?id=${id}`);
    }
  };

  return (
    <AnalysisContext.Provider
      value={{
        analysis,
        isLoading,
        error,
        refreshAnalysis: () => loadAnalysis(idFromUrl || undefined),
        selectAnalysis
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useWorkspaceAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useWorkspaceAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
