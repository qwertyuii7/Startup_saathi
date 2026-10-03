export interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  avatar?: string;
  role: "founder" | "admin" | "reviewer";
  // How the account was created. Google users may later add email login.
  provider: "google" | "email";
  // bcrypt hash — only set for email/password accounts. NEVER returned by APIs.
  passwordHash?: string;
  onboardingCompleted: boolean;
  onboardingStep: number;
  onboardingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface StartupProfile {
  id: string;
  userId: string;
  // Founder / Contact
  founderName?: string;
  founderEmail?: string;
  founderPhone?: string;
  founderRole?: "Founder" | "Co-Founder" | "CEO" | "CTO" | "Other" | string;
  // Startup Basics
  name: string;
  startupName?: string;
  description?: string;
  summary?: string;
  industry: string;
  sector: string;
  stage: string;
  startupStage?: string;
  website?: string;
  // Legal & Registration
  legalEntity?: "Private Limited" | "LLP" | "Partnership" | "Sole Proprietorship" | "Private Limited Company" | "Other" | string;
  entityType?: "Private Limited Company" | "LLP" | "Partnership" | "Sole Proprietorship" | "Other" | string;
  foundedDate?: string;
  incorporationDate?: string;
  state: string;
  city: string;
  dpiitStatus: boolean | "Yes" | "No" | "Applied / Pending" | "Not Sure";
  dpiitNumber?: string;
  dpiitRecognitionNumber?: string;
  // Funding & Business
  annualTurnover?: number; // in INR
  turnoverRange?: string;
  turnoverDisplay?: string;
  employees?: number;
  fundingStage?: string;
  fundingStatus?: "Bootstrapped" | "Angel" | "Seed" | "VC" | "Other" | "No Funding" | string;
  fundingAmount?: number;
  revenue?: number;
  revenueRange?: "Pre-revenue" | "Below ₹10L" | "₹10L–₹50L" | "₹50L–₹1Cr" | "₹1Cr–₹5Cr" | "₹5Cr+" | string;
  businessModel?: string;
  technologyCategory?: string;
  isWomenLed?: boolean;
  previousGovernmentFunding?: "Yes" | "No" | "Not Sure" | boolean;
  governmentFundingDetails?: string;
  assistanceInterests?: string[];
  cinNumber?: string;
  gstNumber?: string;
  // Notification / engine preferences (persisted from Settings page)
  preferences?: {
    schemeNotifications?: boolean;
    documentAlerts?: boolean;
    matchThreshold?: number;
  };
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  userId?: string;
  createdAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  userId: string;
  startupId: string;
  fileName: string;
  pageNumber: number;
  section: string;
  content: string;
  vector?: number[];
  chunkIndex: number;
  documentType: string;
  sourceType: "user_upload" | "official_gazette" | "government_portal";
  createdAt: string;
}

export interface StartupDocumentRecord {
  id: string;
  userId: string;
  startupId: string;
  name: string;
  type: string;
  fileSize: string;
  fileSizeBytes?: number;
  mimeType: string;
  pageCount: number;
  status: "uploaded" | "processing" | "processed" | "error";
  extractedText?: string;
  chunksCount: number;
  indexedChunks?: number;
  isVerified: boolean;
  uploadedAt: string;
  // Cloud storage provenance (local disk in dev, Cloudinary when configured)
  storageProvider?: "local" | "cloudinary";
  storageUrl?: string;
  storagePublicId?: string;
  fileHash?: string;
  processingError?: string;
  metadata: Record<string, any>;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  slug: string;
  governmentLevel: "Central" | "State";
  state?: string;
  description: string;
  benefits: string;
  maxBenefitAmount: number;
  maxBenefitDisplay: string;
  deadline?: string;
  category: string[];
  department: string;
  officialSourceTitle: string;
  officialSourceUrl: string;
  guidelineClause: string;
  requirements: {
    id: string;
    description: string;
    category: "dpiit" | "incorporation" | "financial" | "location" | "industry" | "innovation" | "infrastructure";
    ruleType: "deterministic" | "semantic";
    deterministicRule?: {
      field: keyof StartupProfile;
      operator: "equals" | "less_than_or_equal" | "greater_than_or_equal" | "includes" | "max_years_from_date";
      value: any;
    };
    sourceCitation: {
      title: string;
      clause: string;
      pageNumber?: number;
      url: string;
    };
  }[];
  active: boolean;
}

export interface AnalysisFinding {
  schemeId: string;
  schemeName: string;
  governmentLevel: "Central" | "State";
  state?: string;
  fitLevel: "eligible" | "potential" | "missing_requirement" | "not_eligible";
  fitLabel: string;
  criteriaMetCount: number;
  totalCriteriaCount: number;
  maxBenefit: string;
  criteriaBreakdown: {
    requirementId: string;
    requirement: string;
    status: "satisfied" | "needs_verification" | "not_satisfied" | "evidence_missing";
    statusLabel: string;
    evidenceSnippet?: string;
    evidenceDocumentName?: string;
    evidencePage?: number;
    evidenceStrength: "direct_evidence" | "inferred_evidence" | "self_declaration";
    sourceCitation: {
      title: string;
      clause: string;
      url: string;
    };
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
}

export interface ActionItemRecord {
  id: string;
  analysisId: string;
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

export interface DeepAnalysisRecord {
  id: string;
  userId: string;
  startupId: string;
  title: string;
  query: string;
  scope: {
    geography: "central" | "state" | "both";
    state: string;
    industry: string;
    stage: string;
    schemeTypes: string[];
    depth: "quick" | "standard" | "deep";
  };
  schemesAnalyzedCount: number;
  eligibleCount: number;
  potentialCount: number;
  missingCount: number;
  notEligibleCount: number;
  findings: AnalysisFinding[];
  actionPlan: ActionItemRecord[];
  incubatorMatches?: IncubatorRecord[];
  status: "in_progress" | "completed" | "error";
  createdAt: string;
  updatedAt: string;
}

export interface IncubatorRecord {
  id: string;
  name: string;
  location: string;
  state: string;
  focusArea: string;
  supportedSchemes: string[];
  benefits: string[];
  applicationStatus: "Open" | "Closing Soon" | "Rolling";
  websiteUrl: string;
}

export interface ConversationRecord {
  id: string;
  userId: string;
  startupId: string;
  analysisId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  userId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: {
    type: "document" | "official_source";
    title: string;
    ref: string;
    url?: string;
  }[];
  createdAt: string;
}

export interface ApplicationDraftRecord {
  id: string;
  userId: string;
  startupId: string;
  schemeId: string;
  schemeName: string;
  sections: {
    startupOverview: string;
    problem: string;
    solution: string;
    market: string;
    innovation: string;
    businessModel: string;
    impact: string;
    fundingRequirement: string;
    useOfFunds: string;
  };
  isReviewedByFounder: boolean;
  createdAt: string;
  updatedAt: string;
}
