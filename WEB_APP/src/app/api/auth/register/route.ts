import { NextRequest, NextResponse } from "next/server";
import { registerSchema, firstIssue } from "@/lib/auth/schemas";
import { hashPassword, normalizeEmail } from "@/lib/auth/password";
import { signUserToken } from "@/lib/auth/jwt";
import { toSafeUser } from "@/lib/auth/google";
import { config } from "@/lib/config";
import { db } from "@/lib/db/store";
import { User } from "@/lib/db/models";
import { v4 as uuidv4 } from "uuid";

function sessionCookie(token: string) {
  return {
    httpOnly: true as const,
    secure: config.isProduction,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
}

// POST /api/auth/register — real email/password registration.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: firstIssue(parsed.error) } },
        { status: 400 }
      );
    }
    const { name, email: rawEmail, password } = parsed.data;
    const email = normalizeEmail(rawEmail);

    const existing = await db.getUserByEmail(email);
    if (existing) {
      // Same message whether the account came from Google or email —
      // never reveal which providers an address uses.
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_TAKEN",
            message: "An account with this email already exists. Please sign in instead.",
          },
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id: `user_${uuidv4().substring(0, 8)}`,
      googleId: "",
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      role: "founder",
      provider: "email",
      passwordHash: await hashPassword(password),
      onboardingCompleted: false,
      onboardingStep: 0,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    await db.saveUser(newUser);

    const token = await signUserToken(newUser);
    const response = NextResponse.json({ success: true, user: toSafeUser(newUser) });
    response.cookies.set(config.auth.cookieName, token, sessionCookie(token));
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    console.error("Register error:", message);
    return NextResponse.json(
      { success: false, error: { code: "REGISTER_FAILED", message: "Could not create your account. Please try again." } },
      { status: 500 }
    );
  }
}
