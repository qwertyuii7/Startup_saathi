import { createHash } from "crypto";
import { config } from "../config";

export interface StoredFile {
  /** Public URL (local /uploads URL or Cloudinary secure_url). */
  url: string;
  /** Storage-local identifier (relative path or Cloudinary public_id). */
  publicId: string;
  provider: "local" | "cloudinary";
  bytes: number;
  sha256: string;
}

export interface StorageProvider {
  readonly name: "local" | "cloudinary";
  save(params: {
    userId: string;
    docId: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<StoredFile>;
  remove(publicId: string): Promise<void>;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "document";
}

class LocalStorageProvider implements StorageProvider {
  readonly name = "local" as const;

  async save(params: {
    userId: string;
    docId: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<StoredFile> {
    const fs = await import("fs/promises");
    const path = await import("path");
    const safeUser = sanitizeFileName(params.userId);
    const dir = path.join(process.cwd(), "public", "uploads", safeUser);
    await fs.mkdir(dir, { recursive: true });
    const fileName = `${params.docId}_${sanitizeFileName(params.fileName)}`;
    const absPath = path.join(dir, fileName);
    await fs.writeFile(absPath, params.buffer);
    const sha256 = createHash("sha256").update(params.buffer).digest("hex");
    return {
      url: `/uploads/${safeUser}/${fileName}`,
      publicId: `${safeUser}/${fileName}`,
      provider: "local",
      bytes: params.buffer.length,
      sha256,
    };
  }

  async remove(publicId: string): Promise<void> {
    const fs = await import("fs/promises");
    const path = await import("path");
    const absPath = path.join(process.cwd(), "public", "uploads", publicId);
    await fs.unlink(absPath).catch(() => undefined);
  }
}

class CloudinaryStorageProvider implements StorageProvider {
  readonly name = "cloudinary" as const;

  private async client(): Promise<{
    uploader: {
      upload_stream: (
        options: Record<string, unknown>,
        cb: (err: unknown, res?: { secure_url: string; public_id: string; bytes: number }) => void
      ) => { end: (buf: Buffer) => void };
      destroy: (publicId: string, options?: Record<string, unknown>) => Promise<unknown>;
    };
  }> {
    // Dynamic import so `cloudinary` is only required when configured.
    const mod = (await import("cloudinary")) as unknown as {
      v2: {
        config: (c: Record<string, string>) => void;
        uploader: unknown;
      };
    };
    mod.v2.config({
      cloud_name: config.storage.cloudinaryCloudName,
      api_key: config.storage.cloudinaryApiKey,
      api_secret: config.storage.cloudinaryApiSecret,
    });
    return mod.v2 as unknown as {
      uploader: {
        upload_stream: (
          options: Record<string, unknown>,
          cb: (err: unknown, res?: { secure_url: string; public_id: string; bytes: number }) => void
        ) => { end: (buf: Buffer) => void };
        destroy: (publicId: string, options?: Record<string, unknown>) => Promise<unknown>;
      };
    };
  }

  async save(params: {
    userId: string;
    docId: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<StoredFile> {
    const { uploader } = await this.client();
    const sha256 = createHash("sha256").update(params.buffer).digest("hex");
    const result = await new Promise<{ secure_url: string; public_id: string; bytes: number }>(
      (resolve, reject) => {
        const stream = uploader.upload_stream(
          {
            folder: `arova/${sanitizeFileName(params.userId)}`,
            public_id: params.docId,
            resource_type: "raw",
            use_filename: true,
            unique_filename: false,
            overwrite: true,
          },
          (err, res) => (err ? reject(err) : res ? resolve(res) : reject(new Error("Cloudinary upload failed")))
        );
        stream.end(params.buffer);
      }
    );
    return {
      url: result.secure_url,
      publicId: result.public_id,
      provider: "cloudinary",
      bytes: result.bytes,
      sha256,
    };
  }

  async remove(publicId: string): Promise<void> {
    const { uploader } = await this.client();
    await uploader.destroy(publicId, { resource_type: "raw" }).catch(() => undefined);
  }
}

/** Active provider from STORAGE_PROVIDER (cloudinary only when credentials exist). */
export function getStorageProvider(): StorageProvider {
  if (
    config.storage.provider === "cloudinary" &&
    config.storage.cloudinaryCloudName &&
    config.storage.cloudinaryApiKey &&
    config.storage.cloudinaryApiSecret
  ) {
    return new CloudinaryStorageProvider();
  }
  return new LocalStorageProvider();
}
