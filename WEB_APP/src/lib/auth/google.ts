import { OAuth2Client } from "google-auth-library";
import { config } from "../config";
import { db } from "../db/store";
import { User } from "../db/models";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_ISSUERS = ["accounts.google.com", "https://accounts.google.com"];

function getGoogleClient() {
  if (!config.auth.googleClientId) {
    throw new Error(
      "Google OAuth is not configured. Missing GOOGLE_CLIENT_ID environment variable."
    );
  }
  return new OAuth2Client(config.auth.googleClientId);
}

export interface GoogleLoginInput {
  credential?: string;
}

/**
 * Verify a Google ID token (GIS credential) on the backend and
 * find-or-create the user. NEVER trusts profile fields sent by the
 * frontend — the credential is cryptographically verified first.
 */
export async function verifyGoogleTokenOrPayload(
  tokenOrProfile: GoogleLoginInput & Record<string, unknown>
): Promise<User> {
  const credential =
    typeof tokenOrProfile.credential === "string"
      ? tokenOrProfile.credential
      : undefined;

  // A real Google ID-token credential is REQUIRED. Raw email/name
  // values from the client are never trusted (prevents impersonation).
  if (!credential) {
    throw new Error(
      "Google credential is missing. Please sign in with Google again."
    );
  }

  let email: string;
  let name: string;
  let googleId: string;
  let avatar: string | undefined;

  try {
    const googleClient = getGoogleClient();
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.auth.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      throw new Error("Invalid Google token payload.");
    }
    // Explicit issuer / audience / expiry checks (defense in depth —
    // verifyIdToken already validates signature + expiry + audience).
    if (!payload.iss || !ALLOWED_ISSUERS.includes(payload.iss)) {
      throw new Error("Invalid Google token issuer.");
    }
    if (payload.aud !== config.auth.googleClientId) {
      throw new Error("Google token audience mismatch.");
    }
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new Error("Google credential has expired. Please sign in again.");
    }
    if (payload.email_verified === false) {
      throw new Error("Google email address is not verified.");
    }
    email = payload.email.toLowerCase().trim();
    name = payload.name || email.split("@")[0];
    googleId = payload.sub;
    avatar = payload.picture;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Token verification failed.";
    console.error("Google ID token verification failed:", message);
    // Preserve specific, user-safe messages; hide everything else.
    if (
      message.includes("expired") ||
      message.includes("issuer") ||
      message.includes("audience") ||
      message.includes("not verified") ||
      message.includes("Invalid Google") ||
      message.includes("not configured")
    ) {
      throw new Error(message);
    }
    throw new Error("Invalid Google authentication credential. Token verification failed.");
  }

  // Find existing user by Google subject ID first (stable), then email.
  let existingUser = await db.getUserByGoogleId(googleId);
  if (!existingUser) {
    existingUser = await db.getUserByEmail(email);
  }

  // Create user if they do not exist — no fake startup/docs/schemes.
  if (!existingUser) {
    const displayName = name || email.split("@")[0];
    const newUser: User = {
      id: `user_${uuidv4().substring(0, 8)}`,
      googleId,
      name: displayName,
      email,
      avatar:
        avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
      role: "founder",
      provider: "google",
      onboardingCompleted: false,
      onboardingStep: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    await db.saveUser(newUser);
    return newUser;
  }

  // Existing user: preserve startup / onboarding / docs / analyses.
  // Only refresh safe profile fields + login timestamps.
  existingUser.lastLoginAt = new Date().toISOString();
  existingUser.updatedAt = new Date().toISOString();
  if (name) existingUser.name = name;
  if (avatar) existingUser.avatar = avatar;
  if (googleId && !existingUser.googleId) existingUser.googleId = googleId;

  await db.saveUser(existingUser);
  return existingUser;
}

/** Safe subset of user fields that may leave the server. */
export function toSafeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    onboardingCompleted: user.onboardingCompleted,
    onboardingStep: user.onboardingStep,
  };
}
