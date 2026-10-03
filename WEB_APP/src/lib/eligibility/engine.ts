import { StartupProfile, GovernmentScheme, AnalysisFinding } from "../db/models";
import { vectorStore } from "../vector/vector-store";
import { GroqService } from "../ai/groq";

export class EligibilityEngine {
  // Evaluates a startup profile and its vector evidence against a specific government scheme
  static async evaluateScheme(startup: StartupProfile, scheme: GovernmentScheme): Promise<AnalysisFinding> {
    const criteriaBreakdown: AnalysisFinding["criteriaBreakdown"] = [];
    const qualifyingFactors: string[] = [];
    const blockingFactors: AnalysisFinding["blockingFactors"] = [];

    // 1. Calculate startup age in years from incorporation date (null when unknown)
    const now = new Date();
    const incDateStr = startup.incorporationDate || startup.foundedDate || null;
    const incDate = incDateStr ? new Date(incDateStr) : null;
    const ageInYears =
      incDate && !isNaN(incDate.getTime())
        ? (now.getTime() - incDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
        : null;

    const formatTurnover = (): string => {
      if (typeof startup.annualTurnover === "number") {
        return `₹${startup.annualTurnover.toLocaleString("en-IN")}`;
      }
      return startup.turnoverDisplay || "turnover not provided";
    };

    // 2. Evaluate each requirement condition-by-condition
    for (const req of scheme.requirements) {
      let status: "satisfied" | "needs_verification" | "not_satisfied" | "evidence_missing" = "evidence_missing";
      let statusLabel = "Evidence Missing";
      let evidenceSnippet: string | undefined = undefined;
      let evidenceDocName: string | undefined = undefined;
      let evidencePage: number | undefined = undefined;
      let evidenceStrength: "direct_evidence" | "inferred_evidence" | "self_declaration" = "inferred_evidence";
      let aiReasoning = "";

      // Retrieve relevant user document chunks from vector store (this user only)
      const retrieved = await vectorStore.search(`${req.category} ${req.description}`, {
        startupId: startup.id,
        userId: startup.userId,
        sourceType: "user_upload",
      }, 2);

      const topEvidence = retrieved[0];
      if (topEvidence && topEvidence.score > 0.35) {
        evidenceSnippet = topEvidence.chunk.content;
        evidenceDocName = topEvidence.chunk.fileName;
        evidencePage = topEvidence.chunk.pageNumber;
        evidenceStrength = "direct_evidence";
      }

      // Execute Deterministic Rule if specified
      if (req.deterministicRule) {
        const rule = req.deterministicRule;
        const fieldValue = startup[rule.field];

        if (rule.operator === "equals") {
          if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
            status = "evidence_missing";
            statusLabel = "Evidence Missing";
            aiReasoning = `Value for '${String(rule.field)}' is not provided, so this requirement cannot be verified. Update your startup profile.`;
          } else if (fieldValue === rule.value) {
            status = "satisfied";
            statusLabel = "Satisfied";
            aiReasoning = `Verified match: ${String(rule.field)} equals '${String(rule.value)}'. Verified via ${evidenceDocName || "corporate profile"}.`;
          } else {
            status = "not_satisfied";
            statusLabel = "Not Satisfied";
            aiReasoning = `Criterion not met: Required '${String(rule.value)}', but current value is '${String(fieldValue)}'.`;
          }
        } else if (rule.operator === "max_years_from_date") {
          if (ageInYears === null) {
            status = "evidence_missing";
            statusLabel = "Evidence Missing";
            aiReasoning = `Incorporation date is not provided, so the ${rule.value}-year age limit cannot be verified. Add your incorporation date and upload your Certificate of Incorporation.`;
          } else if (ageInYears <= Number(rule.value)) {
            status = "satisfied";
            statusLabel = "Satisfied";
            aiReasoning = `Incorporated on ${startup.incorporationDate} (~${ageInYears.toFixed(1)} years ago), which is within the ${rule.value}-year limit.`;
          } else {
            status = "not_satisfied";
            statusLabel = "Not Satisfied";
            aiReasoning = `Startup age (~${ageInYears.toFixed(1)} years) exceeds the maximum allowed ${rule.value} years.`;
          }
        } else if (rule.operator === "less_than_or_equal") {
          if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
            status = "evidence_missing";
            statusLabel = "Evidence Missing";
            aiReasoning = `Value for '${String(rule.field)}' is not provided, so the ceiling of ${String(rule.value)} cannot be verified. Update your profile and upload supporting financial documents.`;
          } else if (Number(fieldValue) <= Number(rule.value)) {
            status = "satisfied";
            statusLabel = "Satisfied";
            aiReasoning = `Current value (${formatTurnover()}) is within the statutory ceiling of ₹${(Number(rule.value) / 10000000).toFixed(0)} Crores.`;
           } else {
            status = "not_satisfied";
            statusLabel = "Not Satisfied";
            aiReasoning = `Turnover exceeds statutory threshold.`;
          }
        } else if (rule.operator === "includes") {
          const list = Array.isArray(rule.value) ? rule.value : [rule.value];
          if (list.includes(fieldValue)) {
            status = "satisfied";
            statusLabel = "Satisfied";
            aiReasoning = `Entity type '${fieldValue}' matches authorized legal entity structures.`;
          } else {
            status = "not_satisfied";
            statusLabel = "Not Satisfied";
            aiReasoning = `Entity type '${fieldValue}' is not among eligible legal structures (${list.join(", ")}).`;
          }
        }
      } else {
        // Semantic requirement (e.g. innovation, audited financial seal,
        // incubator letter) — decided ONLY by retrieved user evidence.
        // No evidence may ever be invented here.
        if (topEvidence && topEvidence.score > 0.5) {
          status = "satisfied";
          statusLabel = "Satisfied";
          aiReasoning = `Supported by documentary excerpt on page ${topEvidence.chunk.pageNumber} of ${topEvidence.chunk.fileName}.`;
        } else if (topEvidence && topEvidence.score > 0.35) {
          status = "needs_verification";
          statusLabel = "Needs Verification";
          aiReasoning = `A related excerpt was found in ${topEvidence.chunk.fileName} (page ${topEvidence.chunk.pageNumber}) but it is not conclusive. Upload a clearer supporting document or get manual verification.`;
        } else {
          status = "evidence_missing";
          statusLabel = "Evidence Missing";
          aiReasoning = "No supporting document found in your uploads for this requirement. Upload the relevant certificate or letter to proceed.";
        }
      }

      // Record qualifying / blocking factors
      if (status === "satisfied") {
        qualifyingFactors.push(req.description);
      } else {
        const resolutionByCategory: Record<string, string> = {
          dpiit: "Upload your DPIIT Certificate of Recognition on the Documents page",
          incorporation: "Upload your Certificate of Incorporation and confirm the incorporation date in your profile",
          financial: "Upload audited financial statements or relevant tax documents",
          location: "Confirm your registered state/city in your profile and upload address proof if available",
          industry: "Confirm your industry/sector in your startup profile",
          innovation: "Upload a pitch deck, product document, or patent filing describing your innovation",
          infrastructure: "Upload the incubator/accelerator letter or partnership document",
        };
        blockingFactors.push({
          issue: `Pending: ${req.description}`,
          required: req.description,
          current: status === "evidence_missing" ? "No evidence uploaded" : statusLabel,
          impact: `Blocks automatic qualification under ${req.sourceCitation.clause}.`,
          resolutionAction: resolutionByCategory[req.category] || "Upload the supporting document for this requirement",
        });
      }

      criteriaBreakdown.push({
        requirementId: req.id,
        requirement: req.description,
        status,
        statusLabel,
        evidenceSnippet,
        evidenceDocumentName: evidenceDocName,
        evidencePage,
        evidenceStrength,
        sourceCitation: {
          title: req.sourceCitation.title,
          clause: req.sourceCitation.clause,
          url: req.sourceCitation.url,
        },
        aiReasoning,
      });
    }

    // Determine overall scheme fit level
    const satisfiedCount = criteriaBreakdown.filter(c => c.status === "satisfied").length;
    const totalCount = criteriaBreakdown.length;
    const hasUnmet = criteriaBreakdown.some(c => c.status === "not_satisfied");
    const hasNeedsVerification = criteriaBreakdown.some(c => c.status === "needs_verification" || c.status === "evidence_missing");

    let fitLevel: AnalysisFinding["fitLevel"] = "eligible";
    let fitLabel = "Eligible";

    if (hasUnmet) {
      fitLevel = "not_eligible";
      fitLabel = "Not Eligible";
    } else if (satisfiedCount === totalCount) {
      fitLevel = "eligible";
      fitLabel = "Eligible";
    } else if (hasNeedsVerification && satisfiedCount >= Math.floor(totalCount / 2)) {
      fitLevel = "potential";
      fitLabel = "Potentially Eligible";
    } else {
      fitLevel = "missing_requirement";
      fitLabel = "Missing Requirement";
    }

    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      governmentLevel: scheme.governmentLevel,
      state: scheme.state,
      fitLevel,
      fitLabel,
      criteriaMetCount: satisfiedCount,
      totalCriteriaCount: totalCount,
      maxBenefit: scheme.maxBenefitDisplay,
      criteriaBreakdown,
      qualifyingFactors,
      blockingFactors,
    };
  }
}
