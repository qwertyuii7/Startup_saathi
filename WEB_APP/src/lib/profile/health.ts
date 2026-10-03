import { FounderProfile, StartupProfile, StartupDocumentRecord } from "@/lib/db/models";

export interface ProfileHealth {
  founderScore: number;
  startupScore: number;
  legalScore: number;
  businessScore: number;
  documentsScore: number;
  overallScore: number;
  details: {
    founder: { label: string; completed: boolean }[];
    startup: { label: string; completed: boolean }[];
    legal: { label: string; completed: boolean }[];
    business: { label: string; completed: boolean }[];
    documents: { label: string; completed: boolean }[];
  };
}

function calcCategory(fields: { label: string; value: any }[]) {
  const map = fields.map((f) => ({
    label: f.label,
    completed: f.value !== undefined && f.value !== null && f.value !== "" && (Array.isArray(f.value) ? f.value.length > 0 : true),
  }));
  const score = map.length === 0 ? 0 : Math.round((map.filter((f) => f.completed).length / map.length) * 100);
  return { score, details: map };
}

export function calculateProfileHealth(
  founder: FounderProfile | null,
  startup: StartupProfile | null,
  documents: StartupDocumentRecord[]
): ProfileHealth {
  const founderData = founder || ({} as Partial<FounderProfile>);
  const startupData = startup || ({} as Partial<StartupProfile>);

  const fCalc = calcCategory([
    { label: "Full Name", value: founderData.fullName },
    { label: "Email Address", value: founderData.email },
    { label: "Phone Number", value: founderData.phone },
    { label: "Professional Role", value: founderData.role },
    { label: "Location", value: founderData.location },
    { label: "Founder Bio", value: founderData.bio },
    { label: "LinkedIn Profile", value: founderData.linkedin },
  ]);

  const sCalc = calcCategory([
    { label: "Startup Name", value: startupData.startupName || startupData.name },
    { label: "Description", value: startupData.description },
    { label: "Industry", value: startupData.industry },
    { label: "Sector", value: startupData.sector },
    { label: "Startup Stage", value: startupData.startupStage || startupData.stage },
    { label: "Location (State)", value: startupData.state },
    { label: "Location (City)", value: startupData.city },
    { label: "Website", value: startupData.website },
  ]);

  const lCalc = calcCategory([
    { label: "Legal Entity", value: startupData.entityType || startupData.legalEntity },
    { label: "Incorporation Date", value: startupData.incorporationDate },
    { label: "DPIIT Recognition", value: startupData.dpiitStatus },
    { label: "GST Registration", value: startupData.gstStatus },
    { label: "CIN Number", value: startupData.cinNumber },
  ]);

  const bCalc = calcCategory([
    { label: "Business Model", value: startupData.businessModel },
    { label: "Target Market", value: startupData.targetMarket },
    { label: "Problem Statement", value: startupData.problemStatement },
    { label: "Solution Statement", value: startupData.solutionStatement },
    { label: "Annual Revenue", value: startupData.revenue || startupData.annualTurnover },
    { label: "Funding Status", value: startupData.fundingStatus },
    { label: "Team Size", value: startupData.employees },
  ]);

  const dCalc = calcCategory([
    { label: "Incorporation Certificate", value: documents.find((d) => d.type === "incorporation") },
    { label: "DPIIT Certificate", value: documents.find((d) => d.type === "dpiit") },
    { label: "Financial Statements", value: documents.find((d) => d.type === "financial" || d.type === "audit") },
    { label: "Pitch Deck / Business Plan", value: documents.find((d) => d.type === "pitch_deck" || d.type === "business_plan") },
  ]);

  const overall = Math.round(
    (fCalc.score + sCalc.score + lCalc.score + bCalc.score + dCalc.score) / 5
  );

  return {
    founderScore: fCalc.score,
    startupScore: sCalc.score,
    legalScore: lCalc.score,
    businessScore: bCalc.score,
    documentsScore: dCalc.score,
    overallScore: overall,
    details: {
      founder: fCalc.details,
      startup: sCalc.details,
      legal: lCalc.details,
      business: bCalc.details,
      documents: dCalc.details,
    },
  };
}
