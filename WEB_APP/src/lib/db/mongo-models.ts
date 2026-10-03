import mongoose, { Schema, type Model } from "mongoose";
import { getConnection } from "./mongo";

const M = Schema.Types.Mixed;

function baseSchema(def: Record<string, unknown>) {
  return new Schema(
    {
      id: { type: String, required: true, unique: true, index: true },
      ...def,
    },
    { timestamps: false, strict: true }
  );
}

const UserSchema = baseSchema({
  googleId: { type: String, default: "", index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  avatar: { type: String },
  role: { type: String, default: "founder" },
  provider: { type: String, default: "google" },
  passwordHash: { type: String, select: true },
  onboardingCompleted: { type: Boolean, default: false },
  onboardingStep: { type: Number, default: 0 },
  onboardingCompletedAt: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
  lastLoginAt: { type: String },
});

const FounderProfileSchema = baseSchema({
  userId: { type: String, required: true, index: true },
  fullName: { type: String },
  profilePhoto: { type: String },
  email: { type: String },
  phone: { type: String },
  location: { type: String },
  role: { type: String },
  bio: { type: String },
  linkedin: { type: String },
  website: { type: String },
  otherLinks: { type: [String] },
  experience: { type: String },
  education: { type: String },
  skills: { type: [String] },
  interests: { type: [String] },
  updatedAt: { type: String },
});

const StartupSchema = baseSchema({
  userId: { type: String, required: true, index: true },
  founderName: { type: String },
  founderEmail: { type: String },
  founderPhone: { type: String },
  founderRole: { type: String },
  name: { type: String },
  startupName: { type: String },
  description: { type: String },
  summary: { type: String },
  industry: { type: String },
  sector: { type: String },
  stage: { type: String },
  startupStage: { type: String },
  website: { type: String },
  legalEntity: { type: String },
  entityType: { type: String },
  foundedDate: { type: String },
  incorporationDate: { type: String },
  state: { type: String },
  city: { type: String },
  dpiitStatus: { type: M },
  dpiitNumber: { type: String },
  dpiitRecognitionNumber: { type: String },
  annualTurnover: { type: Number },
  turnoverRange: { type: String },
  turnoverDisplay: { type: String },
  employees: { type: Number },
  fundingStage: { type: String },
  fundingStatus: { type: String },
  fundingAmount: { type: Number },
  revenue: { type: Number },
  revenueRange: { type: String },
  businessModel: { type: String },
  technologyCategory: { type: String },
  isWomenLed: { type: Boolean },
  previousGovernmentFunding: { type: M },
  governmentFundingDetails: { type: String },
  assistanceInterests: { type: [String], default: [] },
  cinNumber: { type: String },
  gstNumber: { type: String },
  preferences: { type: M },
  updatedAt: { type: String },
});

const DocumentSchema = baseSchema({
  userId: { type: String, required: true, index: true },
  startupId: { type: String, required: true, index: true },
  name: { type: String },
  type: { type: String },
  fileSize: { type: String },
  fileSizeBytes: { type: Number },
  mimeType: { type: String },
  pageCount: { type: Number },
  status: { type: String },
  extractedText: { type: String },
  chunksCount: { type: Number },
  indexedChunks: { type: Number },
  isVerified: { type: Boolean },
  uploadedAt: { type: String },
  storageProvider: { type: String },
  storageUrl: { type: String },
  storagePublicId: { type: String },
  fileHash: { type: String },
  processingError: { type: String },
  metadata: { type: M },
});

const ChunkSchema = baseSchema({
  documentId: { type: String, index: true },
  userId: { type: String, index: true },
  startupId: { type: String, index: true },
  fileName: { type: String },
  pageNumber: { type: Number },
  section: { type: String },
  content: { type: String },
  vector: { type: [Number], default: [] },
  chunkIndex: { type: Number },
  documentType: { type: String },
  sourceType: { type: String, index: true },
  createdAt: { type: String },
});

const SchemeSchema = baseSchema({
  name: { type: String },
  slug: { type: String },
  governmentLevel: { type: String },
  state: { type: String },
  description: { type: String },
  benefits: { type: String },
  maxBenefitAmount: { type: Number },
  maxBenefitDisplay: { type: String },
  deadline: { type: String },
  category: { type: [String], default: [] },
  department: { type: String },
  officialSourceTitle: { type: String },
  officialSourceUrl: { type: String },
  guidelineClause: { type: String },
  requirements: { type: M },
  active: { type: Boolean },
});

const AnalysisSchema = baseSchema({
  userId: { type: String, required: true, index: true },
  startupId: { type: String, index: true },
  title: { type: String },
  query: { type: String },
  scope: { type: M },
  schemesAnalyzedCount: { type: Number },
  eligibleCount: { type: Number },
  potentialCount: { type: Number },
  missingCount: { type: Number },
  notEligibleCount: { type: Number },
  findings: { type: M },
  actionPlan: { type: M },
  incubatorMatches: { type: M },
  executiveSummary: { type: String },
  readiness: { type: M },
  risks: { type: M },
  opportunities: { type: M },
  status: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

const IncubatorSchema = baseSchema({
  name: { type: String },
  location: { type: String },
  state: { type: String },
  focusArea: { type: String },
  supportedSchemes: { type: [String], default: [] },
  benefits: { type: [String], default: [] },
  applicationStatus: { type: String },
  websiteUrl: { type: String },
});

const ConversationSchema = baseSchema({
  userId: { type: String, index: true },
  startupId: { type: String },
  analysisId: { type: String },
  title: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

const MessageSchema = baseSchema({
  conversationId: { type: String, required: true, index: true },
  userId: { type: String },
  role: { type: String },
  content: { type: String },
  citations: { type: M },
  structured: { type: M },
  createdAt: { type: String },
});

const DraftSchema = baseSchema({
  userId: { type: String, index: true },
  startupId: { type: String },
  schemeId: { type: String },
  schemeName: { type: String },
  sections: { type: M },
  isReviewedByFounder: { type: Boolean },
  createdAt: { type: String },
  updatedAt: { type: String },
});

const ContactSchema = baseSchema({
  name: { type: String },
  email: { type: String },
  company: { type: String },
  subject: { type: String },
  message: { type: String },
  userId: { type: String },
  createdAt: { type: String },
});

const SchemeMatchSchema = baseSchema({
  userId: { type: String, required: true, index: true },
  schemeId: { type: String, required: true, index: true },
  matchScore: { type: Number },
  eligibilityStatus: { type: String },
  matchedCriteria: { type: [String], default: [] },
  unmatchedCriteria: { type: [String], default: [] },
  missingInformation: { type: [String], default: [] },
  evidence: { type: M },
  reason: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

type AnyModel = Model<Record<string, unknown>>;

async function model(name: string, schema: Schema): Promise<AnyModel> {
  const m = await getConnection();
  return (m.models[name] as AnyModel) || m.model<Record<string, unknown>>(name, schema);
}

export async function models() {
  const [User, FounderProfile, Startup, StartupDocument, Chunk, Scheme, Analysis, Incubator, Conversation, Message, Draft, Contact, SchemeMatch] =
    await Promise.all([
      model("User", UserSchema),
      model("FounderProfile", FounderProfileSchema),
      model("Startup", StartupSchema),
      model("StartupDocument", DocumentSchema),
      model("Chunk", ChunkSchema),
      model("Scheme", SchemeSchema),
      model("Analysis", AnalysisSchema),
      model("Incubator", IncubatorSchema),
      model("Conversation", ConversationSchema),
      model("Message", MessageSchema),
      model("Draft", DraftSchema),
      model("Contact", ContactSchema),
      model("SchemeMatch", SchemeMatchSchema),
    ]);
  return { User, FounderProfile, Startup, StartupDocument, Chunk, Scheme, Analysis, Incubator, Conversation, Message, Draft, Contact, SchemeMatch };
}
