import { z } from "zod";
import { passwordIssues } from "./password";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email address is required.")
  .email("Please enter a valid email address.")
  .max(320, "Email address is too long.");

const passwordField = z
  .string()
  .min(1, "Password is required.")
  .max(128, "Password is too long.")
  .superRefine((pw, ctx) => {
    const issues = passwordIssues(pw);
    if (issues.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: `Password must include ${issues.join(", ")}.`,
      });
    }
  });

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Full name is required.")
      .max(200, "Name is too long."),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required.").max(128, "Password is too long."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/** Flatten the first Zod issue into a user-safe message. */
export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue?.message || "Invalid input.";
}
