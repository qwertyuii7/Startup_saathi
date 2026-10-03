export type EligibilityStatus = 
  | "satisfied" 
  | "needs_verification" 
  | "not_satisfied" 
  | "evidence_missing";

export type SchemeFitLevel = 
  | "eligible" 
  | "potential" 
  | "missing_requirement" 
  | "not_eligible";

export type GeographyType = "central" | "state" | "both";

export type AnalysisDepth = "quick" | "standard" | "deep";

export interface EvidenceItem {
  id: string;
  documentName: string;
  documentType: string;
  pageNumber: number;
  extractedSnippet: string;
  sourceType: "user_document" | "official_government_portal" | "gazette_notification" | "scheme_guideline";
  verified: boolean;
  evidenceStrength: "direct_evidence" | "inferred_evidence" | "self_declaration";
  uploadedDate?: string;
  fileSize?: string;
}

export interface EligibilityCriterion {
  id: string;
  requirement: string;
  category: "dpiit" | "incorporation" | "financial" | "location" | "industry" | "innovation" | "infrastructure";
  status: EligibilityStatus;
  statusLabel: string;
  evidence?: EvidenceItem;
  officialSource: {
    title: string;
    clauseOrPage?: string;
    url?: string;
  };
  aiReasoning: string;
}

export interface Scheme {
  id: string;
  name: string;
  shortName: string;
  level: "Central" | "State";
  stateName?: string;
  category: string[];
  maxBenefit: string;
  benefitDescription: string;
  deadline?: string;
  fitLevel: SchemeFitLevel;
  fitLabel: string;
  criteriaMetCount: number;
  totalCriteriaCount: number;
  officialSourceUrl: string;
  officialSourceTitle: string;
  criteria: EligibilityCriterion[];
  qualifyingFactors: string[];
  blockingFactors: {
    issue: string;
    required: string;
    current: string;
    impact: string;
    resolutionAction: string;
  }[];
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  status: "verified" | "pending_review" | "needs_update";
  pages: number;
  uploadedDate: string;
  size: string;
  matchedSchemesCount: number;
}

export interface ActionItem {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  estimatedEffort: string;
  unlocksCount: number;
  unlocksDescription: string;
  completed: boolean;
  actionLabel: string;
  actionType: "upload" | "profile" | "incubator" | "external";
  category: string;
}

export interface Incubator {
  id: string;
  name: string;
  location: string;
  focusArea: string;
  matchReason: string;
  eligibility: string;
  applicationStatus: "Open" | "Closing Soon" | "Rolling";
  deadline?: string;
  benefits: string[];
  websiteUrl: string;
}

export interface ApplicationDraft {
  startupOverview: string;
  problem: string;
  solution: string;
  market: string;
  innovation: string;
  businessModel: string;
  impact: string;
  fundingRequirement: string;
  useOfFunds: string;
  lastGenerated: string;
  reviewedByFounder: boolean;
}

export interface AnalysisHistoryItem {
  id: string;
  title: string;
  date: string;
  schemesAnalyzed: number;
  eligibleCount: number;
  potentialCount: number;
  missingCount: number;
  notEligibleCount: number;
  status: "Completed" | "In Progress" | "Draft";
  geography: string;
  depth: string;
  promptSnippet: string;
}

export interface StartupContext {
  name: string;
  stage: string;
  industry: string;
  location: string;
  incorporationYear: number;
  incorporationDate: string;
  dpiitVerified: boolean;
  dpiitNumber: string;
  turnover: string;
  turnoverNumeric: number;
  employees: number;
  funding: string;
  startupAge: string;
  cinNumber: string;
  gstNumber: string;
  missingDetailsCount: number;
}

export interface AnalysisConfiguration {
  geography: GeographyType;
  selectedState: string;
  industry: string;
  stage: string;
  schemeTypes: string[];
  depth: AnalysisDepth;
}
