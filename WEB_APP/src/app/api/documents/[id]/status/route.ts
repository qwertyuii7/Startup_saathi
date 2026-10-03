import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";

export async function GET(
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

    let progress = 0;
    let message = "Document saved...";
    
    switch (doc.status) {
      case "uploaded":
        progress = 20; message = "Document uploaded"; break;
      case "processing":
        progress = 30; message = "Initializing processor..."; break;
      case "extracting":
        progress = 45; message = "Extracting text..."; break;
      case "chunking":
        progress = 60; message = "Segmenting text..."; break;
      case "indexing":
        progress = 75; message = "Indexing vectors..."; break;
      case "analyzing":
        progress = 90; message = "Finding relevant schemes..."; break;
      case "processed":
        progress = 100; message = "Document ready"; break;
      case "failed":
        progress = 0; message = doc.processingError || "Processing failed"; break;
    }

    return NextResponse.json({
      success: true,
      status: doc.status,
      progress,
      message
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
