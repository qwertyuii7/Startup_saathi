import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const scheme = await db.getSchemeById(id);

    if (!scheme) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Scheme not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      scheme,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: error?.message || "Failed to fetch scheme" } },
      { status: 500 }
    );
  }
}
