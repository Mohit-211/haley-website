"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, enquiries, leads, properties, provinces, reviews, users } from "@/db";
import { canManageStaff, requireUser } from "@/lib/auth/dal";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { deleteImages, uploadedName } from "@/lib/storage";
import { toPropertyColumns, validate, type PropertyFieldErrors, type PropertyFormValues } from "@/lib/property-validation";
import { TAGS } from "@/lib/queries";
import { CANADIAN_PROVINCES, ENQUIRY_STATUSES, LEAD_STATUSES, MAX_REVIEWS, PROPERTY_STATUSES, ROLES, type ActionResult } from "@/lib/types";

// ---------- Auth ----------

// Verified against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(86) + "==";

export async function login(_prev: { error?: string; email?: string } | undefined, fd: FormData): Promise<{ error?: string; email?: string }> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Enter both email and password.", email };

  const [user] = await db.select({ id: users.id, passwordHash: users.passwordHash }).from(users).where(eq(users.email, email)).limit(1);
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  // Echo the email back: React resets the form after an action, and retyping it is annoying.
  if (!user || !ok) return { error: "That email and password don't match an account.", email };

  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

// ---------- Properties ----------

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 100) || "property";

async function uniqueSlug(base: string) {
  for (let i = 0; ; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const [hit] = await db.select({ id: properties.id }).from(properties).where(eq(properties.slug, slug)).limit(1);
    if (!hit) return slug;
  }
}

const photosOf = (p: { imageUrl: string | null; gallery: string[] | null }) => [p.imageUrl, ...(p.gallery ?? [])].filter((u): u is string => !!u);

/** Deletes uploaded photo files that no listing references any more. */
async function pruneImages(candidates: string[]) {
  const uploaded = candidates.filter((u) => uploadedName(u));
  if (!uploaded.length) return;
  const inUse = new Set((await db.select({ imageUrl: properties.imageUrl, gallery: properties.gallery }).from(properties)).flatMap(photosOf));
  await deleteImages(uploaded.filter((u) => !inUse.has(u)));
}

export async function saveProperty(id: number | null, values: PropertyFormValues): Promise<ActionResult<keyof PropertyFieldErrors>> {
  await requireUser();
  const codes = (await db.select({ code: provinces.code }).from(provinces)).map((p) => p.code);
  const fieldErrors = validate(values, codes);
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

  const columns = toPropertyColumns(values);
  if (id === null) {
    // The slug is set once at creation so shared links keep working after the title is edited.
    const slug = await uniqueSlug(slugify(`${columns.title} ${columns.city}`));
    await db.insert(properties).values({ ...columns, slug });
  } else {
    const [before] = await db.select({ imageUrl: properties.imageUrl, gallery: properties.gallery }).from(properties).where(eq(properties.id, id)).limit(1);
    if (!before) return { ok: false, error: "This property no longer exists." };
    await db.update(properties).set(columns).where(eq(properties.id, id));
    const kept = new Set(photosOf(columns));
    await pruneImages(photosOf(before).filter((u) => !kept.has(u)));
  }
  updateTag(TAGS.properties);
  return { ok: true };
}

export async function deleteProperty(id: number): Promise<ActionResult> {
  await requireUser();
  const [before] = await db.select({ imageUrl: properties.imageUrl, gallery: properties.gallery }).from(properties).where(eq(properties.id, id)).limit(1);
  await db.delete(properties).where(eq(properties.id, id));
  if (before) await pruneImages(photosOf(before));
  updateTag(TAGS.properties);
  refresh();
  return { ok: true };
}

export async function setPropertyStatus(id: number, status: string): Promise<ActionResult> {
  await requireUser();
  const s = z.enum(PROPERTY_STATUSES).safeParse(status);
  if (!s.success) return { ok: false, error: "Unknown status." };
  await db.update(properties).set({ status: s.data }).where(eq(properties.id, id));
  updateTag(TAGS.properties);
  refresh();
  return { ok: true };
}

// ---------- Leads & enquiries ----------

export async function setLeadStatus(id: number, status: string): Promise<ActionResult> {
  await requireUser();
  const s = z.enum(LEAD_STATUSES).safeParse(status);
  if (!s.success) return { ok: false, error: "Unknown status." };
  await db.update(leads).set({ status: s.data }).where(eq(leads.id, id));
  refresh();
  return { ok: true };
}

export async function deleteLead(id: number): Promise<ActionResult> {
  await requireUser();
  await db.delete(leads).where(eq(leads.id, id));
  refresh();
  return { ok: true };
}

export async function setEnquiryStatus(id: number, status: string): Promise<ActionResult> {
  await requireUser();
  const s = z.enum(ENQUIRY_STATUSES).safeParse(status);
  if (!s.success) return { ok: false, error: "Unknown status." };
  await db.update(enquiries).set({ status: s.data }).where(eq(enquiries.id, id));
  refresh();
  return { ok: true };
}

export async function deleteEnquiry(id: number): Promise<ActionResult> {
  await requireUser();
  await db.delete(enquiries).where(eq(enquiries.id, id));
  refresh();
  return { ok: true };
}

// ---------- Staff (super admins only) ----------

const staffSchema = z.object({
  name: z.string().trim().min(2, "Enter a name.").max(100),
  email: z.string().trim().toLowerCase().max(255).email("Enter a valid email address."),
  password: z.string().min(10, "Use at least 10 characters.").max(200),
  role: z.enum(ROLES),
});
export type StaffField = keyof z.infer<typeof staffSchema>;

export async function createStaff(fd: FormData): Promise<ActionResult<StaffField>> {
  const me = await requireUser();
  if (!canManageStaff(me)) return { ok: false, error: "Only super admins can add staff." };
  const parsed = staffSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  }
  const { password, ...rest } = parsed.data;
  const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.email, rest.email)).limit(1);
  if (taken) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: { email: "Someone already uses this email." } };
  await db.insert(users).values({ ...rest, passwordHash: await hashPassword(password) });
  refresh();
  return { ok: true, message: `${rest.name} can now sign in.` };
}

export async function deleteStaff(id: number): Promise<ActionResult> {
  const me = await requireUser();
  if (!canManageStaff(me)) return { ok: false, error: "Only super admins can remove staff." };
  if (id === me.id) return { ok: false, error: "You can't remove your own account." };
  const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, id)).limit(1);
  if (!target) return { ok: false, error: "That account no longer exists." };
  if (target.role === "super_admin") {
    const [{ n }] = await db.select({ n: count() }).from(users).where(and(eq(users.role, "super_admin"), ne(users.id, id)));
    if (n === 0) return { ok: false, error: "Keep at least one super admin." };
  }
  await db.delete(users).where(eq(users.id, id)); // sessions cascade, signing them out
  refresh();
  return { ok: true };
}

// ---------- Locations ----------

export async function addProvince(code: string): Promise<ActionResult> {
  await requireUser();
  const p = CANADIAN_PROVINCES.find((x) => x.code === code);
  if (!p) return { ok: false, error: "Choose a Canadian province or territory." };
  const [exists] = await db.select({ code: provinces.code }).from(provinces).where(eq(provinces.code, code)).limit(1);
  if (exists) return { ok: false, error: `${p.name} is already active.` };
  await db.insert(provinces).values(p);
  updateTag(TAGS.provinces);
  refresh();
  return { ok: true };
}

export async function removeProvince(code: string): Promise<ActionResult> {
  await requireUser();
  const [{ n }] = await db.select({ n: count() }).from(properties).where(eq(properties.provinceCode, code));
  if (n > 0) return { ok: false, error: `${n} ${n === 1 ? "property is" : "properties are"} still in this province. Move or delete them first.` };
  const [{ total }] = await db.select({ total: count() }).from(provinces);
  if (total <= 1) return { ok: false, error: "Keep at least one active province." };
  await db.delete(provinces).where(eq(provinces.code, code));
  updateTag(TAGS.provinces);
  refresh();
  return { ok: true };
}

// ---------- Reviews ----------

const reviewSchema = z.object({
  quote: z.string().trim().min(10, "Add at least a sentence.").max(600, "Keep it under 600 characters."),
  name: z.string().trim().min(2, "Enter the client's name.").max(100),
  place: z.string().trim().max(100).optional(),
});
export type ReviewField = keyof z.infer<typeof reviewSchema>;

export async function saveReview(id: number | null, fd: FormData): Promise<ActionResult<ReviewField>> {
  await requireUser();
  const parsed = reviewSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  }
  const values = { ...parsed.data, place: parsed.data.place || null };
  if (id === null) {
    const [{ n }] = await db.select({ n: count() }).from(reviews);
    if (n >= MAX_REVIEWS) return { ok: false, error: `You can keep up to ${MAX_REVIEWS} reviews. Delete one to add another.` };
    await db.insert(reviews).values(values);
  } else {
    const res = await db.update(reviews).set(values).where(eq(reviews.id, id));
    if (res[0].affectedRows === 0) return { ok: false, error: "This review no longer exists." };
  }
  updateTag(TAGS.reviews);
  refresh();
  return { ok: true };
}

export async function deleteReview(id: number): Promise<ActionResult> {
  await requireUser();
  await db.delete(reviews).where(eq(reviews.id, id));
  updateTag(TAGS.reviews);
  refresh();
  return { ok: true };
}

// ---------- Photos ----------

/** Removes a just-uploaded photo the admin discarded before saving, unless a listing already uses it. */
export async function discardUpload(url: string): Promise<ActionResult> {
  await requireUser();
  await pruneImages([url]);
  return { ok: true };
}
