import "server-only";
import { put } from "@vercel/blob";

/**
 * Vercel Blob authenticates with either a read-write token (older stores) or the
 * store id plus Vercel's automatic OIDC token (newer stores connected to the project).
 */
export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/** Uploads an image to the public Blob store and returns its URL. Throws user-readable errors. */
export async function uploadImage(file: File, folder: string, opts: { maxBytes?: number; unguessable?: boolean } = {}): Promise<string> {
  const maxBytes = opts.maxBytes ?? 3 * 1024 * 1024;
  if (!blobConfigured()) {
    throw new Error("Photo uploads are not set up yet (add a Vercel Blob store to the project). You can use a site image path meanwhile.");
  }
  if (!file.type.startsWith("image/")) throw new Error("Please upload an image file (JPG or PNG).");
  if (file.size > maxBytes) throw new Error(`Images must be ${Math.round(maxBytes / 1024 / 1024)} MB or smaller.`);
  const safe = (file.name || "image").toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60);
  try {
    // Payment slips get a random suffix so their URLs cannot be guessed.
    const blob = await put(`cye/${folder}/${Date.now()}-${safe}`, file, { access: "public", addRandomSuffix: Boolean(opts.unguessable) });
    return blob.url;
  } catch (err) {
    console.error("[blob] upload failed", err);
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      /private/i.test(detail)
        ? "Upload failed: the Blob store is private. Connect a public Blob store so images can be shown."
        : `Upload failed: ${detail}`,
    );
  }
}
