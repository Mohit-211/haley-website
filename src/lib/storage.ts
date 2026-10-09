import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Uploaded photos live outside the code folder so deploys never touch them:
 *
 *   haley/
 *     website/          ← this app (process.cwd())
 *     storage/images/   ← IMAGES_DIR (default)
 *
 * They're served by the app at /images/<file>.
 */
// The turbopackIgnore hints keep the bundler from tracing this runtime-only folder into the build output.
export const IMAGES_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.IMAGES_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "..", "storage", "images"));
export const IMAGE_URL_PREFIX = "/images/";
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

const TYPES = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
} as const;
type Ext = keyof typeof TYPES;

/** Only names we generated ourselves are ever read or deleted, which rules out path tricks like "../". */
const FILE_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp|avif)$/;

/** Detects the real format from the file's first bytes rather than trusting its name or MIME type. */
function sniff(b: Buffer): Ext | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (b.toString("ascii", 4, 8) === "ftyp" && /^avi[fs]$/.test(b.toString("ascii", 8, 12))) return "avif";
  return null;
}

export class ImageUploadError extends Error {}

/** Saves an uploaded photo and returns its public URL. */
export async function saveImage(file: File): Promise<string> {
  if (file.size === 0) throw new ImageUploadError("The file is empty.");
  if (file.size > MAX_IMAGE_BYTES) throw new ImageUploadError("Photos must be 15 MB or smaller.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = sniff(bytes);
  if (!ext) throw new ImageUploadError("Upload a JPEG, PNG, WebP or AVIF photo.");

  const name = `${randomUUID()}.${ext}`;
  await mkdir(/*turbopackIgnore: true*/ IMAGES_DIR, { recursive: true });
  await writeFile(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ IMAGES_DIR, name), bytes, { flag: "wx" });
  return IMAGE_URL_PREFIX + name;
}

export async function readImage(name: string): Promise<{ bytes: Buffer; type: string } | null> {
  if (!FILE_NAME.test(name)) return null;
  try {
    const bytes = await readFile(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ IMAGES_DIR, name));
    return { bytes, type: TYPES[name.split(".").pop() as Ext] };
  } catch {
    return null;
  }
}

/** File name for an uploaded-photo URL, or null for anything else (external URLs, /assets, …). */
export const uploadedName = (url: string) => {
  const name = url.startsWith(IMAGE_URL_PREFIX) ? url.slice(IMAGE_URL_PREFIX.length) : "";
  return FILE_NAME.test(name) ? name : null;
};

/** Deletes uploaded photos from disk. Missing files are ignored. */
export async function deleteImages(urls: string[]) {
  const names = [...new Set(urls.map(uploadedName).filter((n): n is string => n !== null))];
  await Promise.all(names.map((n) => unlink(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ IMAGES_DIR, n)).catch(() => {})));
}
