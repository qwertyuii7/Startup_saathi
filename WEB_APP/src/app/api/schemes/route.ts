import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const schemes = await db.getAllSchemes();
    return NextResponse.json({
      success: true,
      schemes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: error?.message || "Failed to fetch schemes" } },
      { status: 500 }
    );
  }
}
