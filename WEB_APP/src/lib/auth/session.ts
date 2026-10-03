import { NextRequest } from "next/server";
import { verifyUserToken } from "./jwt";
import { db } from "../db/store";
import { User } from "../db/models";
import { config } from "../config";

export async function getAuthenticatedUser(req: NextRequest): Promise<User | null> {
  // Check Authorization Header
  const authHeader = req.headers.get("authorization");
  let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  // Check Cookie if header not present
  if (!token) {
    token = req.cookies.get(config.auth.cookieName)?.value || null;
  }

  if (!token) {
    return null;
  }

  const payload = await verifyUserToken(token);
  if (!payload || !payload.sub) {
    return null;
  }

  const user = await db.getUserById(payload.sub);
  return user || null;
}

/** Helper for protected API routes: resolves the user or returns null. */
export async function requireSessionUser(req: NextRequest): Promise<User | null> {
  return getAuthenticatedUser(req);
}

export function unauthorizedResponse(message = "User not authenticated") {
  return Response.json(
    { success: false, error: { code: "UNAUTHORIZED", message } },
    { status: 401 }
  );
}
