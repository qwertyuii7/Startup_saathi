import {
  User,
  FounderProfile,
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
  SchemeMatch,
} from "./models";
import { models } from "./mongo-models";
import { toPlain, toPlainList } from "./mongo";
import { SchemeSenseStore } from "./store";

/**
 * MongoDB-backed store with the exact same interface as the in-memory
 * SchemeSenseStore. Every write is an upsert by the record's string `id`;
 * reads are strictly scoped (no cross-user fallbacks anywhere).
 */
export class MongoStore {
  private readyPromise: Promise<void> | null = null;

  private async ready(): Promise<void> {
    if (!this.readyPromise) {
      this.readyPromise = this.connectAndSeed().catch((e: unknown) => {
        // Reset so the next call retries instead of sticking broken.
        this.readyPromise = null;
        throw e;
      });
    }
    return this.readyPromise;
  }

  private async connectAndSeed(): Promise<void> {
    const m = await models();
    const schemeCount = await m.Scheme.countDocuments().exec();
    if (schemeCount === 0) {
      // Seed public reference knowledge from the canonical in-memory
      // definitions (single source of truth lives in SchemeSenseStore).
      const seed = new SchemeSenseStore();
      const schemes = (await seed.getAllSchemes()) as GovernmentScheme[];
      const incubators = (await seed.getAllIncubators()) as IncubatorRecord[];
      await Promise.all([
        ...schemes.map((s) => m.Scheme.updateOne({ id: s.id }, { $set: s }, { upsert: true }).exec()),
        ...incubators.map((i) => m.Incubator.updateOne({ id: i.id }, { $set: i }, { upsert: true }).exec()),
      ]);
      console.log(`[db] seeded ${schemes.length} schemes + ${incubators.length} incubators into MongoDB`);
    }
  }

  // User Methods
  async getUserById(id: string): Promise<User | null> {
    const m = await models();
    await this.ready();
    return toPlain<User>(await m.User.findOne({ id }).exec());
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const m = await models();
    await this.ready();
    return toPlain<User>(await m.User.findOne({ email }).exec());
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    if (!googleId) return null;
    const m = await models();
    await this.ready();
    return toPlain<User>(await m.User.findOne({ googleId }).exec());
  }

  async saveUser(user: User): Promise<User> {
    const m = await models();
    await this.ready();
    await m.User.updateOne({ id: user.id }, { $set: user }, { upsert: true }).exec();
    return user;
  }

  // Founder Profile Methods
  async getFounderProfileByUserId(userId: string): Promise<FounderProfile | null> {
    const m = await models();
    await this.ready();
    return toPlain<FounderProfile>(await m.FounderProfile.findOne({ userId }).exec());
  }

  async saveFounderProfile(profile: FounderProfile): Promise<FounderProfile> {
    const m = await models();
    await this.ready();
    await m.FounderProfile.updateOne({ id: profile.id }, { $set: profile }, { upsert: true }).exec();
    return profile;
  }

  // Startup Profile Methods — strict ownership, no fallbacks.
  async getStartupByUserId(userId: string): Promise<StartupProfile | null> {
    const m = await models();
    await this.ready();
    return toPlain<StartupProfile>(await m.Startup.findOne({ userId }).exec());
  }

  async getStartupById(id: string): Promise<StartupProfile | null> {
    const m = await models();
    await this.ready();
    return toPlain<StartupProfile>(await m.Startup.findOne({ id }).exec());
  }

  async saveStartup(startup: StartupProfile): Promise<StartupProfile> {
    const m = await models();
    await this.ready();
    await m.Startup.updateOne({ id: startup.id }, { $set: startup }, { upsert: true }).exec();
    return startup;
  }

  // Document Methods — strict ownership.
  async getDocumentsByStartupId(startupId: string): Promise<StartupDocumentRecord[]> {
    const m = await models();
    await this.ready();
    return toPlainList<StartupDocumentRecord>(await m.StartupDocument.find({ startupId }).exec());
  }

  async getDocumentsByUserId(userId: string): Promise<StartupDocumentRecord[]> {
    const m = await models();
    await this.ready();
    const docs = await m.StartupDocument.find({ userId }).exec();
    return toPlainList<StartupDocumentRecord>(docs).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async getDocumentById(id: string): Promise<StartupDocumentRecord | null> {
    const m = await models();
    await this.ready();
    return toPlain<StartupDocumentRecord>(await m.StartupDocument.findOne({ id }).exec());
  }

  async saveDocument(doc: StartupDocumentRecord): Promise<StartupDocumentRecord> {
    const m = await models();
    await this.ready();
    await m.StartupDocument.updateOne({ id: doc.id }, { $set: doc }, { upsert: true }).exec();
    return doc;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const m = await models();
    await this.ready();
    const res = await m.StartupDocument.deleteOne({ id }).exec();
    return (res.deletedCount || 0) > 0;
  }

  // Chunks & Vectors
  async saveChunk(chunk: DocumentChunk): Promise<void> {
    const m = await models();
    await this.ready();
    await m.Chunk.updateOne({ id: chunk.id }, { $set: chunk }, { upsert: true }).exec();
  }

  async getChunksByStartup(startupId: string): Promise<DocumentChunk[]> {
    const m = await models();
    await this.ready();
    return toPlainList<DocumentChunk>(await m.Chunk.find({ startupId }).exec());
  }

  async getAllChunks(): Promise<DocumentChunk[]> {
    const m = await models();
    await this.ready();
    return toPlainList<DocumentChunk>(await m.Chunk.find({}).exec());
  }

  // Scheme Methods (public reference data)
  async getAllSchemes(): Promise<GovernmentScheme[]> {
    const m = await models();
    await this.ready();
    return toPlainList<GovernmentScheme>(await m.Scheme.find({}).exec());
  }

  async getSchemeById(id: string): Promise<GovernmentScheme | null> {
    const m = await models();
    await this.ready();
    return toPlain<GovernmentScheme>(await m.Scheme.findOne({ id }).exec());
  }

  // Deep Analysis Records
  async saveAnalysis(record: DeepAnalysisRecord): Promise<DeepAnalysisRecord> {
    const m = await models();
    await this.ready();
    await m.Analysis.updateOne({ id: record.id }, { $set: record }, { upsert: true }).exec();
    return record;
  }

  async getAnalysisById(id: string): Promise<DeepAnalysisRecord | null> {
    const m = await models();
    await this.ready();
    return toPlain<DeepAnalysisRecord>(await m.Analysis.findOne({ id }).exec());
  }

  async getAnalysesByUserId(userId: string): Promise<DeepAnalysisRecord[]> {
    const m = await models();
    await this.ready();
    const list = await m.Analysis.find({ userId }).exec();
    return toPlainList<DeepAnalysisRecord>(list).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Incubators (public reference data)
  async getAllIncubators(): Promise<IncubatorRecord[]> {
    const m = await models();
    await this.ready();
    return toPlainList<IncubatorRecord>(await m.Incubator.find({}).exec());
  }

  // Conversation & Chat
  async saveConversation(conv: ConversationRecord): Promise<ConversationRecord> {
    const m = await models();
    await this.ready();
    await m.Conversation.updateOne({ id: conv.id }, { $set: conv }, { upsert: true }).exec();
    return conv;
  }

  async getConversation(id: string): Promise<ConversationRecord | null> {
    const m = await models();
    await this.ready();
    return toPlain<ConversationRecord>(await m.Conversation.findOne({ id }).exec());
  }

  async getConversationsByUserId(userId: string): Promise<ConversationRecord[]> {
    const m = await models();
    await this.ready();
    const list = await m.Conversation.find({ userId }).exec();
    return toPlainList<ConversationRecord>(list).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async deleteConversation(id: string): Promise<boolean> {
    const m = await models();
    await this.ready();
    await m.Message.deleteMany({ conversationId: id }).exec();
    const res = await m.Conversation.deleteOne({ id }).exec();
    return (res.deletedCount ?? 0) > 0;
  }

  async saveMessage(msg: MessageRecord): Promise<MessageRecord> {
    const m = await models();
    await this.ready();
    await m.Message.updateOne({ id: msg.id }, { $set: msg }, { upsert: true }).exec();
    return msg;
  }

  async getMessagesByConversation(conversationId: string): Promise<MessageRecord[]> {
    const m = await models();
    await this.ready();
    const list = await m.Message.find({ conversationId }).exec();
    return toPlainList<MessageRecord>(list).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  // Application Drafts
  async saveDraft(draft: ApplicationDraftRecord): Promise<ApplicationDraftRecord> {
    const m = await models();
    await this.ready();
    await m.Draft.updateOne({ id: draft.id }, { $set: draft }, { upsert: true }).exec();
    return draft;
  }

  async getDraftById(id: string): Promise<ApplicationDraftRecord | null> {
    const m = await models();
    await this.ready();
    return toPlain<ApplicationDraftRecord>(await m.Draft.findOne({ id }).exec());
  }

  // Contact messages
  async saveContactMessage(msg: ContactMessage): Promise<ContactMessage> {
    const m = await models();
    await this.ready();
    await m.Contact.updateOne({ id: msg.id }, { $set: msg }, { upsert: true }).exec();
    return msg;
  }
  
  // Scheme Matches
  async getSchemeMatchesByUserId(userId: string): Promise<SchemeMatch[]> {
    const m = await models();
    await this.ready();
    return toPlainList<SchemeMatch>(await m.SchemeMatch.find({ userId }).exec());
  }

  async saveSchemeMatches(userId: string, matches: SchemeMatch[]): Promise<void> {
    const m = await models();
    await this.ready();
    await m.SchemeMatch.deleteMany({ userId }).exec();
    if (matches.length > 0) {
      await m.SchemeMatch.insertMany(matches);
    }
  }
}
