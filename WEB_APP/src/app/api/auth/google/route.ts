import { NextRequest, NextResponse } from "next/server";
import { verifyGoogleTokenOrPayload, toSafeUser } from "@/lib/auth/google";
import { signUserToken } from "@/lib/auth/jwt";
import { config } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    if (!body || typeof body.credential !== "string" || !body.credential) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_CREDENTIAL",
            message: "Google credential is missing. Please sign in with Google again.",
          },
        },
        { status: 400 }
      );
    }

    // Backend verifies the Google ID token (signature, audience,
    // issuer, expiry) and finds/creates the user.
    const user = await verifyGoogleTokenOrPayload({ credential: body.credential });
    const token = await signUserToken(user);

    // Session lives in the HTTP-only cookie only — the token is
    // never returned in the response body.
    const response = NextResponse.json({
      success: true,
      user: toSafeUser(user),
    });

    response.cookies.set(config.auth.cookieName, token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    // Never log credentials/tokens.
    console.error("Google Auth Error:", message);
    const status =
      message.includes("expired") || message.includes("Invalid Google")
        ? 401
        : message.includes("not configured")
          ? 500
          : 400;
    return NextResponse.json(
      { success: false, error: { code: "AUTH_FAILED", message } },
      { status }
    );
  }
}
