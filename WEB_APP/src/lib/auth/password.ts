import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/** bcrypt-hash a password. Only the hash is ever persisted. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** Constant-time password verification against the stored hash. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/** Password strength rules (shared by frontend + backend messages). */
export function passwordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push("at least 8 characters");
  if (!/[a-z]/.test(password)) issues.push("a lowercase letter");
  if (!/[A-Z]/.test(password)) issues.push("an uppercase letter");
  if (!/[0-9]/.test(password)) issues.push("a number");
  return issues;
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
