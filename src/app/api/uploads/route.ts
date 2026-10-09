import { getCurrentUser } from "@/lib/auth/dal";
import { ImageUploadError, saveImage } from "@/lib/storage";

/** Admin photo upload: multipart form with a single "file" field. Returns { url }. */
export async function POST(request: Request) {
  if (!(await getCurrentUser())) return Response.json({ error: "Please sign in again." }, { status: 401 });

  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });

  try {
    return Response.json({ url: await saveImage(file) }, { status: 201 });
  } catch (e) {
    if (e instanceof ImageUploadError) return Response.json({ error: e.message }, { status: 400 });
    console.error("Image upload failed", e);
    return Response.json({ error: "Couldn't save the photo. Please try again." }, { status: 500 });
  }
}
