import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";
import { v4 as uuidv4 } from "uuid";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBJECTS = new Set(["general", "demo", "schemes", "incubators", "support", "partnership"]);

// POST /api/contact — validates and persists a contact-form message.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const company = typeof body.company === "string" ? body.company.trim().slice(0, 200) : "";
    const subject = typeof body.subject === "string" ? body.subject : "general";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Please provide your name." } },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Please provide a valid email address." } },
        { status: 400 }
      );
    }
    if (!SUBJECTS.has(subject)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Please choose a valid subject." } },
        { status: 400 }
      );
    }
    if (message.length < 20) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Please write at least 20 characters." } },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser(req).catch(() => null);
    await db.saveContactMessage({
      id: `contact_${uuidv4().substring(0, 8)}`,
      name: name.slice(0, 200),
      email: email.slice(0, 320),
      company,
      subject,
      message: message.slice(0, 5000),
      userId: user?.id,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Message received. Our team will respond shortly." });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Could not submit your message.";
    return NextResponse.json(
      { success: false, error: { code: "SUBMIT_FAILED", message: msg } },
      { status: 500 }
    );
  }
}
