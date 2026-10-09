import { readImage } from "@/lib/storage";

/** Serves uploaded photos from IMAGES_DIR (see src/lib/storage.ts). */
export async function GET(_req: Request, { params }: RouteContext<"/images/[file]">) {
  const image = await readImage((await params).file);
  if (!image) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.type,
      // File names are random and never reused, so the content at a URL never changes.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
