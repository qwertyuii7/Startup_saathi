import { NextRequest, NextResponse } from "next/server";

// Alias for GET /api/health/rag — spec requires GET /api/health/ai.
export async function GET(req: NextRequest) {
  const base = new URL("/api/health/rag", req.url);
  const res = await fetch(base.toString(), {
    headers: { cookie: req.headers.get("cookie") || "" },
  });
  const data = await res.json().catch(() => ({ success: false }));
  return NextResponse.json(data, { status: res.status });
}
