import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";
import { FounderProfile, StartupProfile } from "@/lib/db/models";

export async function GET(req: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  const resolvedParams = await params;
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ success: false }, { status: 401 });

    const section = resolvedParams.section.toLowerCase();

    if (section === "founder") {
      const founder = await db.getFounderProfileByUserId(user.id);
      return NextResponse.json({ success: true, data: founder || {} });
    }

    const startup = await db.getStartupByUserId(user.id);
    if (!startup) return NextResponse.json({ success: true, data: {} });

    // Logical slices for frontend convenience (optional, could just return full startup)
    let slice: any = {};
    if (section === "startup") {
      slice = { name: startup.name, startupName: startup.startupName, logo: startup.logo, tagline: startup.tagline, description: startup.description, industry: startup.industry, sector: startup.sector, stage: startup.stage, startupStage: startup.startupStage, foundedDate: startup.foundedDate, state: startup.state, city: startup.city, website: startup.website };
    } else if (section === "legal") {
      slice = { legalEntity: startup.legalEntity, entityType: startup.entityType, incorporationDate: startup.incorporationDate, dpiitStatus: startup.dpiitStatus, dpiitNumber: startup.dpiitNumber, gstStatus: startup.gstStatus, gstNumber: startup.gstNumber, cinNumber: startup.cinNumber, ipInformation: startup.ipInformation, certifications: startup.certifications, registrations: startup.registrations };
    } else if (section === "business") {
      slice = { productDescription: startup.productDescription, targetMarket: startup.targetMarket, customerSegment: startup.customerSegment, problemStatement: startup.problemStatement, solutionStatement: startup.solutionStatement, traction: startup.traction, businessModel: startup.businessModel };
    } else if (section === "financial") {
      slice = { annualTurnover: startup.annualTurnover, revenue: startup.revenue, fundingStage: startup.fundingStage, fundingStatus: startup.fundingStatus, fundingAmount: startup.fundingAmount };
    } else if (section === "team") {
      slice = { employees: startup.employees, isWomenLed: startup.isWomenLed };
    } else {
      // fallback just return the whole startup
      slice = startup;
    }

    return NextResponse.json({ success: true, data: slice });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  const resolvedParams = await params;
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ success: false }, { status: 401 });

    const body = await req.json();
    const section = resolvedParams.section.toLowerCase();

    if (section === "founder") {
      let founder = await db.getFounderProfileByUserId(user.id);
      if (!founder) {
        founder = {
          id: user.id,
          userId: user.id,
          fullName: user.name,
          email: user.email,
          updatedAt: new Date().toISOString()
        };
      }
      founder = { ...founder, ...body, updatedAt: new Date().toISOString() };
      await db.saveFounderProfile(founder as FounderProfile);
      return NextResponse.json({ success: true, data: founder });
    }

    // For any startup sub-section (startup, legal, business, financial, team)
    // we just merge the body into the monolithic StartupProfile.
    let startup = await db.getStartupByUserId(user.id);
    if (!startup) {
      startup = {
        id: `startup_${user.id}_${Date.now()}`,
        userId: user.id,
        name: body.startupName || "My Startup",
        industry: "Other",
        sector: "Other",
        stage: "Idea",
        state: "Unknown",
        city: "Unknown",
        dpiitStatus: false,
        updatedAt: new Date().toISOString(),
      };
    }

    startup = { ...startup, ...body, updatedAt: new Date().toISOString() };
    await db.saveStartup(startup as StartupProfile);
    
    return NextResponse.json({ success: true, data: startup });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
