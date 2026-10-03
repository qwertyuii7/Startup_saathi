import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } },
        { status: 401 }
      );
    }
    const doc = await db.getDocumentById(id);

    if (!doc) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Document not found" } },
        { status: 404 }
      );
    }

    // Ownership check — a user may only delete their own documents.
    if (doc.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have access to this document" } },
        { status: 403 }
      );
    }

    // Remove the stored file (cloud or local) plus the DB record.
    if (doc.storagePublicId) {
      try {
        const { getStorageProvider } = await import("@/lib/storage/provider");
        await getStorageProvider().remove(doc.storagePublicId);
      } catch (e: unknown) {
        console.warn("Stored file cleanup warning:", e instanceof Error ? e.message : e);
      }
    }

    // Remove indexed vectors so deleted docs stop grounding answers.
    try {
      const { vectorStore } = await import("@/lib/vector/vector-store");
      await vectorStore.deleteDocumentVectors(id);
    } catch (e: unknown) {
      console.warn("Vector cleanup warning:", e instanceof Error ? e.message : e);
    }

    await db.deleteDocument(id);

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete document";
    return NextResponse.json(
      { success: false, error: { code: "DELETE_FAILED", message } },
      { status: 500 }
    );
  }
}
