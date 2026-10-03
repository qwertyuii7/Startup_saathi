import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const incubators = await db.getAllIncubators();
    return NextResponse.json({
      success: true,
      incubators,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: error?.message || "Failed to fetch incubators" } },
      { status: 500 }
    );
  }
}
