import { NextRequest, NextResponse } from "next/server";
import { loginSchema, firstIssue } from "@/lib/auth/schemas";
import { verifyPassword, normalizeEmail, hashPassword } from "@/lib/auth/password";
import { signUserToken } from "@/lib/auth/jwt";
import { toSafeUser } from "@/lib/auth/google";
import { config } from "@/lib/config";
import { db } from "@/lib/db/store";

// Cached valid dummy hash so failed logins burn comparable time
// whether or not the email exists (enumeration resistance).
let dummyHash: string | null = null;
async function burnTime() {
  try {
    dummyHash = dummyHash || (await hashPassword("dummy-password-for-timing-00"));
    await verifyPassword("dummy-password-for-timing-00", dummyHash);
  } catch {
    /* best effort only */
  }
}

// POST /api/auth/login — real email/password login.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: firstIssue(parsed.error) } },
        { status: 400 }
      );
    }
    const email = normalizeEmail(parsed.data.email);

    const user = await db.getUserByEmail(email);
    // Uniform message + timing: never reveal whether the email exists.
    if (!user || !user.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      await burnTime();
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Incorrect email or password. Please try again." },
        },
        { status: 401 }
      );
    }

    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    await db.saveUser(user);

    const token = await signUserToken(user);
    const response = NextResponse.json({ success: true, user: toSafeUser(user) });
    response.cookies.set(config.auth.cookieName, token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed.";
    console.error("Email login error:", message);
    return NextResponse.json(
      { success: false, error: { code: "LOGIN_FAILED", message: "Could not sign you in. Please try again." } },
      { status: 500 }
    );
  }
}
