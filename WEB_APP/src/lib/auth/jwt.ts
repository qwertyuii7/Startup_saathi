import { SignJWT, jwtVerify } from "jose";
import { config } from "../config";
import { User } from "../db/models";

const secretKey = new TextEncoder().encode(config.auth.jwtSecret);

export async function signUserToken(user: User): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
    onboardingStep: user.onboardingStep,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyUserToken(token: string): Promise<{
  sub: string;
  email: string;
  name: string;
  role: string;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
} | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as any;
  } catch (err) {
    return null;
  }
}
