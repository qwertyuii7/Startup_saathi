import { 
  StartupProfile, 
  GovernmentScheme, 
  AnalysisFinding, 
  ActionItemRecord, 
  IncubatorRecord, 
  DeepAnalysisRecord 
} from "../../db/models";

export interface DeepAnalysisState {
  userId: string;
  startupId: string;
  query: string;
  scope: {
    geography: "central" | "state" | "both";
    state: string;
    industry: string;
    stage: string;
    schemeTypes: string[];
    depth: "quick" | "standard" | "deep";
  };
  startupProfile?: StartupProfile;
  candidateSchemes: GovernmentScheme[];
  findings: AnalysisFinding[];
  actionPlan: ActionItemRecord[];
  incubatorMatches: IncubatorRecord[];
  finalReport?: string;
  record?: DeepAnalysisRecord;
  errors: string[];
}
