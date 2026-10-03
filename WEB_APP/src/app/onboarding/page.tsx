"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Step1Founder } from "@/components/onboarding/Step1Founder";
import { Step2Startup } from "@/components/onboarding/Step2Startup";
import { Step3Legal } from "@/components/onboarding/Step3Legal";
import { Step4Business } from "@/components/onboarding/Step4Business";
import { Step5Documents } from "@/components/onboarding/Step5Documents";
import { StepComplete } from "@/components/onboarding/StepComplete";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { AlertCircle } from "lucide-react";

interface FounderData {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface StartupData {
  startupName: string;
  description: string;
  industry: string;
  stage: string;
  website: string;
  entityType: string;
  incorporationDate: string;
  state: string;
  city: string;
  dpiitStatus: string;
  dpiitRecognitionNumber: string;
  revenueRange: string;
  fundingStatus: string;
  previousGovernmentFunding: string;
  governmentFundingDetails: string;
  annualTurnover: number;
  assistanceInterests: string[];
}

// Step convention (shared with the backend):
// stored onboardingStep = number of COMPLETED steps (0..5).
// Display step = stored + 1 (clamped to 5); completed flag marks done.
const TOTAL_STEPS = 5;

function emptyForm(userName = "", userEmail = "") {
  return {
    founder: { name: userName, email: userEmail, phone: "", role: "Founder" } as FounderData,
    startup: {
      startupName: "",
      description: "",
      industry: "",
      stage: "",
      website: "",
      entityType: "",
      incorporationDate: "",
      state: "",
      city: "",
      dpiitStatus: "",
      dpiitRecognitionNumber: "",
      revenueRange: "",
      fundingStatus: "",
      previousGovernmentFunding: "",
      governmentFundingDetails: "",
      annualTurnover: 0,
      assistanceInterests: [],
    } as StartupData,
  };
}

function OnboardingFlow() {
  const router = useRouter();
  const { user, refreshUser, setAuthUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const [formData, setFormData] = useState(() => emptyForm());

  // Load persisted onboarding status → resume at the saved step.
  useEffect(() => {
    let cancelled = false;
    async function loadStatus() {
      try {
        const res = await api.onboarding.getStatus();
        if (cancelled) return;
        if (res.success) {
          if (res.completed) {
            router.replace("/dashboard");
            return;
          }

          const step =
            typeof res.currentStep === "number" && res.currentStep >= 0 && res.currentStep <= TOTAL_STEPS
              ? res.currentStep
              : 0;
          // stored = completed count → display the next incomplete step.
          setCurrentStep(step >= TOTAL_STEPS ? TOTAL_STEPS : step + 1);

          // Hydrate only with real persisted data — never fake defaults.
          setFormData((prev) => ({
            founder: {
              name: res.profile?.name || user?.name || prev.founder.name,
              email: res.profile?.email || user?.email || prev.founder.email,
              phone: res.startup?.founderPhone || prev.founder.phone,
              role: res.startup?.founderRole || prev.founder.role,
            },
            startup: {
              ...prev.startup,
              ...(res.startup
                ? {
                    startupName:
                      res.startup.name || res.startup.startupName || prev.startup.startupName,
                    description:
                      res.startup.description || res.startup.summary || prev.startup.description,
                    industry: res.startup.industry || res.startup.sector || prev.startup.industry,
                    stage:
                      res.startup.stage || res.startup.startupStage || prev.startup.stage,
                    website: res.startup.website ?? prev.startup.website,
                    entityType:
                      res.startup.entityType || res.startup.legalEntity || prev.startup.entityType,
                    incorporationDate:
                      res.startup.incorporationDate || prev.startup.incorporationDate,
                    state: res.startup.state || prev.startup.state,
                    city: res.startup.city || prev.startup.city,
                    dpiitStatus:
                      res.startup.dpiitStatus ?? prev.startup.dpiitStatus,
                    dpiitRecognitionNumber:
                      res.startup.dpiitNumber ||
                      res.startup.dpiitRecognitionNumber ||
                      prev.startup.dpiitRecognitionNumber,
                    revenueRange: res.startup.revenueRange || prev.startup.revenueRange,
                    fundingStatus: res.startup.fundingStatus || prev.startup.fundingStatus,
                    previousGovernmentFunding:
                      res.startup.previousGovernmentFunding ??
                      prev.startup.previousGovernmentFunding,
                    governmentFundingDetails:
                      res.startup.governmentFundingDetails ||
                      prev.startup.governmentFundingDetails,
                    annualTurnover:
                      typeof res.startup.annualTurnover === "number"
                        ? res.startup.annualTurnover
                        : prev.startup.annualTurnover,
                    assistanceInterests:
                      res.startup.assistanceInterests || prev.startup.assistanceInterests,
                  }
                : {}),
            },
          }));
        }
      } catch (err) {
        if (!cancelled) {
          // 401s are handled by RequireAuth/middleware; other errors keep
          // the empty form so the user can still start step 1.
          console.warn("Failed to fetch onboarding status:", err);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadStatus();
    return () => {
      cancelled = true;
    };
  }, [router, user?.name, user?.email]);

  // Persist a step — only advances the UI after the backend confirms.
  const persistStep = useCallback(
    async (payload: { step: number; startupData?: unknown; founderData?: unknown }) => {
      setIsSaving(true);
      setSaveError("");
      try {
        const res = await api.onboarding.updateStep(payload);
        return res;
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Could not save your progress. Please try again.";
        setSaveError(message);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const handleStep1 = async (founderData: FounderData) => {
    setFormData((prev) => ({ ...prev, founder: founderData }));
    const res = await persistStep({ step: 1, founderData });
    if (res) setCurrentStep(2);
  };

  const handleStep2 = async (startupData: {
    startupName: string;
    description: string;
    industry: string;
    stage: string;
    website: string;
  }) => {
    setFormData((prev) => ({ ...prev, startup: { ...prev.startup, ...startupData } }));
    const res = await persistStep({ step: 2, startupData });
    if (res) setCurrentStep(3);
  };

  const handleStep3 = async (legalData: {
    entityType: string;
    incorporationDate: string;
    state: string;
    city: string;
    dpiitStatus: "Yes" | "No" | "Applied / Pending" | "Not Sure";
    dpiitRecognitionNumber: string;
  }) => {
    setFormData((prev) => ({ ...prev, startup: { ...prev.startup, ...legalData } }));
    const res = await persistStep({ step: 3, startupData: legalData });
    if (res) setCurrentStep(4);
  };

  const handleStep4 = async (bizData: {
    revenueRange: string;
    fundingStatus: string;
    previousGovernmentFunding: "Yes" | "No" | "Not Sure";
    governmentFundingDetails: string;
    annualTurnover: number;
  }) => {
    setFormData((prev) => ({ ...prev, startup: { ...prev.startup, ...bizData } }));
    const res = await persistStep({ step: 4, startupData: bizData });
    if (res) setCurrentStep(5);
  };

  // Final step — the backend confirms persistence before we mark done.
  // Sequence (no stale-state navigation):
  //   1. await completeOnboarding()          (server sets onboardingCompleted + fresh cookie)
  //   2. adopt the SERVER-CONFIRMED user     (never null-out fresh auth state)
  //   3. re-sync via refreshUser()           (background consistency)
  //   4. navigate only on confirmed completed state (replace, no login flash)
  const handleStep5 = async (docData: { assistanceInterests: string[] }) => {
    setFormData((prev) => ({
      ...prev,
      startup: { ...prev.startup, assistanceInterests: docData.assistanceInterests },
    }));
    setIsSaving(true);
    setSaveError("");
    try {
      const saved = await api.onboarding.updateStep({
        step: 5,
        startupData: { assistanceInterests: docData.assistanceInterests },
      });
      if (!saved) return;
      const done = await api.onboarding.complete();
      if (!done?.success || !done.user) {
        throw new Error("Could not complete onboarding. Please try again.");
      }
      // 2. Adopt the server-confirmed user directly.
      if (typeof done.user.onboardingCompleted === "boolean") {
        setAuthUser({
          id: done.user.id,
          email: done.user.email,
          name: done.user.name,
          avatar: done.user.avatar,
          onboardingCompleted: done.user.onboardingCompleted,
          onboardingStep: typeof done.user.onboardingStep === "number" ? done.user.onboardingStep : 5,
        });
      }
      // 3. Re-sync session state in the background (never nulls fresh state
      //    on transient failure — setAuthUser above is authoritative).
      refreshUser({ force: true, keepOnError: true })
        .then((fresh) => {
          if (fresh && !fresh.onboardingCompleted) {
            // Server disagrees: stay in onboarding, surface it.
            setIsFinished(false);
            setSaveError("Onboarding did not complete on the server. Please try again.");
          }
        })
        .catch(() => undefined);
      // 4. Navigate on the CONFIRMED completed state.
      if (done.user.onboardingCompleted === true) {
        setIsFinished(true);
        router.replace("/dashboard");
        return;
      }
      setIsFinished(true);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Could not complete onboarding. Please try again.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <AuthLoadingScreen message="Loading your profile setup..." />;
  }

  return (
    <OnboardingLayout currentStep={isFinished ? TOTAL_STEPS + 1 : currentStep} totalSteps={TOTAL_STEPS}>
      {saveError && !isFinished && (
        <div
          role="alert"
          className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <p className="font-medium">{saveError}</p>
        </div>
      )}
      {isFinished ? (
        <StepComplete
          startupName={formData.startup?.startupName || "Your Startup"}
          onGoToDashboard={() => router.replace("/dashboard")}
        />
      ) : (
        <>
          {currentStep === 1 && (
            <Step1Founder
              initialData={formData.founder}
              onNext={handleStep1}
              isSaving={isSaving}
            />
          )}

          {currentStep === 2 && (
            <Step2Startup
              initialData={formData.startup}
              onBack={() => setCurrentStep(1)}
              onNext={handleStep2}
              isSaving={isSaving}
            />
          )}

          {currentStep === 3 && (
            <Step3Legal
              initialData={formData.startup}
              onBack={() => setCurrentStep(2)}
              onNext={handleStep3}
              isSaving={isSaving}
            />
          )}

          {currentStep === 4 && (
            <Step4Business
              initialData={formData.startup}
              onBack={() => setCurrentStep(3)}
              onNext={handleStep4}
              isSaving={isSaving}
            />
          )}

          {currentStep === 5 && (
            <Step5Documents
              initialInterests={formData.startup?.assistanceInterests}
              onBack={() => setCurrentStep(4)}
              onFinish={handleStep5}
              isSaving={isSaving}
            />
          )}
        </>
      )}
    </OnboardingLayout>
  );
}

export default function OnboardingPage() {
  // Authenticated-only; completed users → /dashboard, guests → /login.
  return (
    <RequireAuth mode="onboarding" loadingMessage="Loading your profile setup...">
      <OnboardingFlow />
    </RequireAuth>
  );
}
