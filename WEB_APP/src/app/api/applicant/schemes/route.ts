import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const matches = await db.getSchemeMatchesByUserId(user.id);
    
    // Enrich with scheme details
    const populated = [];
    for (const match of matches) {
      const scheme = await db.getSchemeById(match.schemeId);
      if (scheme) {
        populated.push({
          ...match,
          schemeName: scheme.name,
          ministry: scheme.department || scheme.officialSourceTitle,
          description: scheme.description,
          sourceUrl: scheme.officialSourceUrl
        });
      }
    }

    // Sort by matchScore descending
    populated.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return NextResponse.json({ success: true, matches: populated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
