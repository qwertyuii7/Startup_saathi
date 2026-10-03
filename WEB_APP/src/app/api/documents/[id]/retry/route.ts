import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";
import { DocumentProcessor } from "@/lib/documents/processor";
import { getStorageProvider } from "@/lib/storage/provider";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const doc = await db.getDocumentById(id);
    if (!doc) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    if (doc.userId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (doc.status === "processing" || doc.status === "extracting" || doc.status === "chunking" || doc.status === "indexing" || doc.status === "analyzing") {
      return NextResponse.json({ success: false, error: "Already processing" }, { status: 400 });
    }

    let buffer: Buffer;
    
    // We try to fetch the file from the storage provider
    if (doc.storagePublicId) {
      const provider = getStorageProvider();
      buffer = await provider.get(doc.storagePublicId);
    } else {
      return NextResponse.json({ success: false, error: "Missing storage record, please upload again" }, { status: 400 });
    }
    
    // Trigger the background processing again
    DocumentProcessor.processDocumentAsync(doc, buffer).catch(err => {
      console.error("Background document processing retry failed:", err);
    });

    return NextResponse.json({ success: true, message: "Processing started" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
