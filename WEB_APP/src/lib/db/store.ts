import {
  User,
  StartupProfile,
  StartupDocumentRecord,
  DocumentChunk,
  GovernmentScheme,
  DeepAnalysisRecord,
  IncubatorRecord,
  ConversationRecord,
  MessageRecord,
  ApplicationDraftRecord,
  ContactMessage,
} from "./models";

// Global In-Memory Store (development fallback + reference-data source).
// Exported so the MongoDB backend can seed from the same definitions.
export class SchemeSenseStore {
  private users: Map<string, User> = new Map();
  private startups: Map<string, StartupProfile> = new Map();
  private documents: Map<string, StartupDocumentRecord> = new Map();
  private chunks: Map<string, DocumentChunk> = new Map();
  private schemes: Map<string, GovernmentScheme> = new Map();
  private analyses: Map<string, DeepAnalysisRecord> = new Map();
  private incubators: Map<string, IncubatorRecord> = new Map();
  private conversations: Map<string, ConversationRecord> = new Map();
  private messages: Map<string, MessageRecord> = new Map();
  private drafts: Map<string, ApplicationDraftRecord> = new Map();
  private contactMessages: Map<string, ContactMessage> = new Map();

  constructor() {
    this.seedReferenceData();
  }

  // Seeds ONLY public reference knowledge: government schemes + incubators.
  // NEVER seed demo users, startups, or documents — every user-specific
  // record must come from real Google login / onboarding / uploads.
  private seedReferenceData() {

    // Seed Core Government Schemes
    const schemesData: GovernmentScheme[] = [
      {
        id: "sisfs_seed_fund",
        name: "Startup India Seed Fund Scheme (SISFS)",
        slug: "startup-india-seed-fund-scheme",
        governmentLevel: "Central",
        description: "Financial assistance to startups for proof of concept, prototype development, product trials, market entry and commercialization.",
        benefits: "Up to ₹20 Lakhs grant for proof of concept + Up to ₹30 Lakhs convertible debentures/debt.",
        maxBenefitAmount: 5000000,
        maxBenefitDisplay: "Up to ₹50 Lakhs",
        deadline: "Open round the year via approved incubators",
        category: ["Grants", "Equity Support", "Incubation"],
        department: "DPIIT, Ministry of Commerce and Industry",
        officialSourceTitle: "DPIIT SISFS Operational Guidelines 2024–25 (Clause 4.1)",
        officialSourceUrl: "https://seedfund.startupindia.gov.in",
        guidelineClause: "Clause 3.1 & 3.2",
        active: true,
        requirements: [
          {
            id: "req_sisfs_1",
            description: "Startup must be recognized by DPIIT.",
            category: "dpiit",
            ruleType: "deterministic",
            deterministicRule: { field: "dpiitStatus", operator: "equals", value: true },
            sourceCitation: { title: "SISFS Guidelines", clause: "Clause 3.1", pageNumber: 2, url: "https://seedfund.startupindia.gov.in" },
          },
          {
            id: "req_sisfs_2",
            description: "Must be incorporated within 2 years (24 months) at the date of application.",
            category: "incorporation",
            ruleType: "deterministic",
            deterministicRule: { field: "incorporationDate", operator: "max_years_from_date", value: 2 },
            sourceCitation: { title: "SISFS Eligibility", clause: "Clause 3.2", pageNumber: 2, url: "https://seedfund.startupindia.gov.in" },
          },
          {
            id: "req_sisfs_3",
            description: "Must have an innovative product or business model with commercial viability.",
            category: "innovation",
            ruleType: "semantic",
            sourceCitation: { title: "SISFS Innovation Criteria", clause: "Clause 3.4", pageNumber: 3, url: "https://seedfund.startupindia.gov.in" },
          },
          {
            id: "req_sisfs_4",
            description: "Must not have received more than ₹10 Lakhs of monetary support under any other Central/State scheme.",
            category: "financial",
            ruleType: "semantic",
            sourceCitation: { title: "SISFS Guidelines", clause: "Clause 3.5", pageNumber: 4, url: "https://seedfund.startupindia.gov.in" },
          },
        ],
      },
      {
        id: "up_startup_policy_2020",
        name: "UP Startup Policy 2020 — Sustenance & Marketing Grant",
        slug: "up-startup-policy-sustenance-marketing",
        governmentLevel: "State",
        state: "Uttar Pradesh",
        description: "Monthly sustenance allowance and marketing grant support to recognized startups based in Uttar Pradesh.",
        benefits: "₹17,500/month Sustenance Allowance for 1 year + Up to ₹5 Lakhs for Prototype & Marketing.",
        maxBenefitAmount: 710000,
        maxBenefitDisplay: "₹17.5k/month + Up to ₹5 Lakhs",
        deadline: "Open on StartInUP Portal",
        category: ["Grants", "Subsidies", "Incubation"],
        department: "Department of IT & Electronics, Govt. of Uttar Pradesh",
        officialSourceTitle: "UP Information Technology & Startup Policy 2020 (Clause 7.2)",
        officialSourceUrl: "https://startinup.up.gov.in",
        guidelineClause: "Clause 7.2.1",
        active: true,
        requirements: [
          {
            id: "req_up_1",
            description: "Registered office must be physically located in Uttar Pradesh.",
            category: "location",
            ruleType: "deterministic",
            deterministicRule: { field: "state", operator: "equals", value: "Uttar Pradesh" },
            sourceCitation: { title: "StartInUP Policy 2020", clause: "Clause 2.1", pageNumber: 1, url: "https://startinup.up.gov.in" },
          },
          {
            id: "req_up_2",
            description: "Must hold a valid DPIIT Certificate of Recognition.",
            category: "dpiit",
            ruleType: "deterministic",
            deterministicRule: { field: "dpiitStatus", operator: "equals", value: true },
            sourceCitation: { title: "StartInUP Rules", clause: "Clause 3.1", pageNumber: 2, url: "https://startinup.up.gov.in" },
          },
          {
            id: "req_up_3",
            description: "Annual turnover must not exceed ₹100 Crores since incorporation.",
            category: "financial",
            ruleType: "deterministic",
            deterministicRule: { field: "annualTurnover", operator: "less_than_or_equal", value: 1000000000 },
            sourceCitation: { title: "StartInUP Turnover Bracket", clause: "Clause 3.4", pageNumber: 2, url: "https://startinup.up.gov.in" },
          },
          {
            id: "req_up_4",
            description: "Statutory CA-certified audited balance sheet or recognized Host Institute recommendation.",
            category: "financial",
            ruleType: "semantic",
            sourceCitation: { title: "StartInUP Attestation Checklist", clause: "Section C", pageNumber: 5, url: "https://startinup.up.gov.in" },
          },
        ],
      },
      {
        id: "meity_samridh_scheme",
        name: "SAMRIDH Scheme (MeitY Accelerator Program)",
        slug: "meity-samridh-accelerator-scheme",
        governmentLevel: "Central",
        description: "Scaling tech and software startups by providing matching funding up to ₹40 Lakhs through empaneled accelerators.",
        benefits: "Up to ₹40 Lakhs matching investment + Accelerator mentorship & enterprise pilot access.",
        maxBenefitAmount: 4000000,
        maxBenefitDisplay: "Up to ₹40 Lakhs",
        deadline: "Cohort 4 Window: 30 Nov 2026",
        category: ["Grants", "Equity Support"],
        department: "Ministry of Electronics and Information Technology (MeitY)",
        officialSourceTitle: "MeitY SAMRIDH Scheme Implementation Guidelines 2025",
        officialSourceUrl: "https://samridh.meity.gov.in",
        guidelineClause: "Clause 4.2",
        active: true,
        requirements: [
          {
            id: "req_samridh_1",
            description: "Must be a DPIIT recognized software/tech startup.",
            category: "dpiit",
            ruleType: "deterministic",
            deterministicRule: { field: "dpiitStatus", operator: "equals", value: true },
            sourceCitation: { title: "SAMRIDH Guidelines", clause: "Clause 3.1", pageNumber: 2, url: "https://samridh.meity.gov.in" },
          },
          {
            id: "req_samridh_2",
            description: "Must have demonstrable product traction or customer validation.",
            category: "innovation",
            ruleType: "semantic",
            sourceCitation: { title: "SAMRIDH Stage Scope", clause: "Clause 3.3", pageNumber: 3, url: "https://samridh.meity.gov.in" },
          },
          {
            id: "req_samridh_3",
            description: "Empaneled partner accelerator onboarding recommendation.",
            category: "infrastructure",
            ruleType: "semantic",
            sourceCitation: { title: "SAMRIDH Partner Requirements", clause: "Annexure B", pageNumber: 8, url: "https://samridh.meity.gov.in" },
          },
        ],
      },
      {
        id: "section_80iac_tax_exemption",
        name: "Section 80-IAC 3-Year Income Tax Holiday",
        slug: "section-80-iac-income-tax-holiday",
        governmentLevel: "Central",
        description: "100% tax exemption on profits and gains derived by eligible startups for 3 consecutive assessment years out of 10 years.",
        benefits: "100% Tax deduction on net corporate profits for 3 assessment years.",
        maxBenefitAmount: 10000000,
        maxBenefitDisplay: "100% Tax Exemption (3 Yrs)",
        deadline: "CBDT Annual Processing Window",
        category: ["Tax Benefits"],
        department: "Central Board of Direct Taxes (CBDT) / DPIIT",
        officialSourceTitle: "CBDT Notification No. 13/2019 / Section 80-IAC of Income Tax Act",
        officialSourceUrl: "https://www.startupindia.gov.in/content/sih/en/tax-exemptions.html",
        guidelineClause: "Section 80-IAC",
        active: true,
        requirements: [
          {
            id: "req_80iac_1",
            description: "Must be incorporated as Private Limited or LLP after 01-Apr-2016.",
            category: "incorporation",
            ruleType: "deterministic",
            deterministicRule: { field: "legalEntity", operator: "includes", value: ["Private Limited", "LLP"] },
            sourceCitation: { title: "Section 80-IAC Rules", clause: "Clause 1", pageNumber: 1, url: "https://www.startupindia.gov.in" },
          },
          {
            id: "req_80iac_2",
            description: "Must hold DPIIT Recognition Certificate.",
            category: "dpiit",
            ruleType: "deterministic",
            deterministicRule: { field: "dpiitStatus", operator: "equals", value: true },
            sourceCitation: { title: "80-IAC Guidelines", clause: "Clause 2", pageNumber: 1, url: "https://www.startupindia.gov.in" },
          },
          {
            id: "req_80iac_3",
            description: "Audited balance sheet and P&L signed by a Chartered Accountant with UDIN.",
            category: "financial",
            ruleType: "semantic",
            sourceCitation: { title: "IMB Certificate Requirements", clause: "Item 4", pageNumber: 2, url: "https://incometaxindia.gov.in" },
          },
        ],
      },
      {
        id: "cgtmse_credit_guarantee",
        name: "Credit Guarantee Scheme for Micro & Small Enterprises (CGTMSE)",
        slug: "cgtmse-collateral-free-credit-guarantee",
        governmentLevel: "Central",
        description: "Collateral-free credit facility up to ₹5 Crores with up to 85% government guarantee cover through commercial banks.",
        benefits: "Collateral-free business credit facility up to ₹500 Lakhs.",
        maxBenefitAmount: 50000000,
        maxBenefitDisplay: "Up to ₹5 Crores (Collateral-Free)",
        deadline: "Open round the year across partner banks",
        category: ["Loans"],
        department: "Ministry of MSME, Govt. of India",
        officialSourceTitle: "CGTMSE Operational Guidelines Circular 2024",
        officialSourceUrl: "https://www.cgtmse.in",
        guidelineClause: "Chapter 2",
        active: true,
        requirements: [
          {
            id: "req_cgtmse_1",
            description: "Must qualify as Micro or Small Enterprise under MSMED Act (Turnover < ₹5 Cr).",
            category: "financial",
            ruleType: "deterministic",
            deterministicRule: { field: "annualTurnover", operator: "less_than_or_equal", value: 50000000 },
            sourceCitation: { title: "MSME Guidelines", clause: "Gazette S.O. 2119(E)", pageNumber: 1, url: "https://msme.gov.in" },
          },
          {
            id: "req_cgtmse_2",
            description: "Active commercial banking current account in good standing.",
            category: "financial",
            ruleType: "semantic",
            sourceCitation: { title: "CGTMSE Lending Rules", clause: "Chapter 2", pageNumber: 4, url: "https://www.cgtmse.in" },
          },
        ],
      },
    ];

    schemesData.forEach(s => this.schemes.set(s.id, s));

    // Seed Incubators
    const incubatorsData: IncubatorRecord[] = [
      {
        id: "inc_iitk",
        name: "FIRST — Foundation for Innovation & Research in S&T (IIT Kanpur)",
        location: "Kanpur / Lucknow Hub, Uttar Pradesh",
        state: "Uttar Pradesh",
        focusArea: "DeepTech, Enterprise AI, SaaS, Cyber-Physical Systems",
        supportedSchemes: ["sisfs_seed_fund", "up_startup_policy_2020"],
        benefits: ["SISFS Seed Funding up to ₹50L", "UP Sustenance Endorsement", "Cloud Compute Credits", "Faculty Mentorship"],
        applicationStatus: "Open",
        websiteUrl: "https://firstiitk.com",
      },
      {
        id: "inc_iiml",
        name: "IIM Lucknow Enterprise Incubation Centre (L-Incubator)",
        location: "Lucknow & Noida, Uttar Pradesh",
        state: "Uttar Pradesh",
        focusArea: "B2B Software, FinTech, GovTech, Scalable Marketplaces",
        supportedSchemes: ["sisfs_seed_fund", "up_startup_policy_2020"],
        benefits: ["StartInUP Fast-Track Approval", "Seed Capital Access", "GTM Mentorship", "Co-working in Gomti Nagar"],
        applicationStatus: "Rolling",
        websiteUrl: "https://iimlincubator.am",
      },
      {
        id: "inc_thub",
        name: "T-Hub (Technology Hub India)",
        location: "Hyderabad, Telangana (Pan-India cohorts)",
        state: "Telangana",
        focusArea: "SaaS Scale, MeitY SAMRIDH, Global Market Expansion",
        supportedSchemes: ["meity_samridh_scheme", "sisfs_seed_fund"],
        benefits: ["SAMRIDH matching up to ₹40L", "VC Demo Day", "$150k Cloud perks", "Corporate Pilots"],
        applicationStatus: "Closing Soon",
        websiteUrl: "https://t-hub.co",
      },
    ];

    incubatorsData.forEach(inc => this.incubators.set(inc.id, inc));
  }

  // User Methods
  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.get(email) || null;
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.googleId === googleId) return u;
    }
    return null;
  }

  async saveUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    this.users.set(user.email, user);
    return user;
  }

  // Startup Profile Methods
  // Strict ownership: NEVER fall back to another user's startup.
  async getStartupByUserId(userId: string): Promise<StartupProfile | null> {
    return this.startups.get(`user_${userId}`) || null;
  }

  async getStartupById(id: string): Promise<StartupProfile | null> {
    return this.startups.get(id) || null;
  }

  async saveStartup(startup: StartupProfile): Promise<StartupProfile> {
    this.startups.set(startup.id, startup);
    this.startups.set(`user_${startup.userId}`, startup);
    return startup;
  }

  // Document Methods
  // Strict ownership: only documents belonging to this startup.
  async getDocumentsByStartupId(startupId: string): Promise<StartupDocumentRecord[]> {
    return Array.from(this.documents.values()).filter(d => d.startupId === startupId);
  }

  // Strict ownership: only documents owned by this user, newest first.
  async getDocumentsByUserId(userId: string): Promise<StartupDocumentRecord[]> {
    return Array.from(this.documents.values())
      .filter(d => d.userId === userId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  async getDocumentById(id: string): Promise<StartupDocumentRecord | null> {
    return this.documents.get(id) || null;
  }

  async saveDocument(doc: StartupDocumentRecord): Promise<StartupDocumentRecord> {
    this.documents.set(doc.id, doc);
    return doc;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Chunks & Vectors
  async saveChunk(chunk: DocumentChunk): Promise<void> {
    this.chunks.set(chunk.id, chunk);
  }

  async getChunksByStartup(startupId: string): Promise<DocumentChunk[]> {
    return Array.from(this.chunks.values()).filter(c => c.startupId === startupId);
  }

  async getAllChunks(): Promise<DocumentChunk[]> {
    return Array.from(this.chunks.values());
  }

  // Scheme Methods
  async getAllSchemes(): Promise<GovernmentScheme[]> {
    return Array.from(this.schemes.values());
  }

  async getSchemeById(id: string): Promise<GovernmentScheme | null> {
    return this.schemes.get(id) || null;
  }

  // Deep Analysis Records
  async saveAnalysis(record: DeepAnalysisRecord): Promise<DeepAnalysisRecord> {
    this.analyses.set(record.id, record);
    return record;
  }

  async getAnalysisById(id: string): Promise<DeepAnalysisRecord | null> {
    return this.analyses.get(id) || null;
  }

  async getAnalysesByUserId(userId: string): Promise<DeepAnalysisRecord[]> {
    return Array.from(this.analyses.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Incubators
  async getAllIncubators(): Promise<IncubatorRecord[]> {
    return Array.from(this.incubators.values());
  }

  // Conversation & Chat
  async saveConversation(conv: ConversationRecord): Promise<ConversationRecord> {
    this.conversations.set(conv.id, conv);
    return conv;
  }

  async getConversation(id: string): Promise<ConversationRecord | null> {
    return this.conversations.get(id) || null;
  }

  async saveMessage(msg: MessageRecord): Promise<MessageRecord> {
    this.messages.set(msg.id, msg);
    return msg;
  }

  async getMessagesByConversation(conversationId: string): Promise<MessageRecord[]> {
    return Array.from(this.messages.values())
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Application Drafts
  async saveDraft(draft: ApplicationDraftRecord): Promise<ApplicationDraftRecord> {
    this.drafts.set(draft.id, draft);
    return draft;
  }

  async getDraftById(id: string): Promise<ApplicationDraftRecord | null> {
    return this.drafts.get(id) || null;
  }

  // Contact messages (public form; optionally linked to a signed-in user)
  async saveContactMessage(msg: ContactMessage): Promise<ContactMessage> {
    this.contactMessages.set(msg.id, msg);
    return msg;
  }
}

// Global Singleton Instance.
// Persistent MongoDB when DATABASE_URL is configured (data survives
// restarts); otherwise the in-memory store (development fallback only).
// Both backends implement the identical method set.
import { MongoStore } from "./mongo-store";
import { isMongoConfigured } from "./mongo";

const memoryStore = new SchemeSenseStore();

export const db: SchemeSenseStore | MongoStore = isMongoConfigured()
  ? new MongoStore()
  : (() => {
      console.warn("[db] DATABASE_URL not set — using in-memory store (data will NOT persist across restarts).");
      return memoryStore;
    })();
