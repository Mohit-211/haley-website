import "server-only";
import { asc, count, desc, eq, ne } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db, enquiries, leads, properties, provinces, reviews, users } from "@/db";
import { requireUser } from "@/lib/auth/dal";
import { MAX_REVIEWS, type Enquiry, type Lead, type Property, type Province, type ProvinceWithUsage, type Review, type StaffMember } from "@/lib/types";

/** Cache tags; Server Actions call updateTag() with these after writes. */
export const TAGS = { properties: "properties", provinces: "provinces", reviews: "reviews" } as const;

type PropertyRow = typeof properties.$inferSelect;

function toProperty(r: PropertyRow): Property {
  return {
    id: r.id, slug: r.slug, title: r.title, status: r.status, price: r.price, city: r.city, province: r.provinceCode,
    address: r.address, postalCode: r.postalCode, description: r.description, type: r.type, beds: r.beds, baths: r.baths,
    sqft: r.sqft, lotSize: r.lotSize, parking: r.parking, yearBuilt: r.yearBuilt, image: r.imageUrl,
    gallery: r.gallery ?? [], features: r.features ?? [], featured: r.featured,
  };
}

// ---------- Public (cached, prerendered into the static shell) ----------

/** Everything visible on the public site: all statuses except Draft. */
export async function getListedProperties(): Promise<Property[]> {
  "use cache";
  cacheTag(TAGS.properties);
  cacheLife("hours");
  const rows = await db.select().from(properties).where(ne(properties.status, "Draft")).orderBy(desc(properties.featured), desc(properties.updatedAt));
  return rows.map(toProperty);
}

export async function getListedProperty(slug: string): Promise<Property | null> {
  "use cache";
  cacheTag(TAGS.properties);
  cacheLife("hours");
  const [row] = await db.select().from(properties).where(eq(properties.slug, slug)).limit(1);
  return row && row.status !== "Draft" ? toProperty(row) : null;
}

export async function getProvinces(): Promise<Province[]> {
  "use cache";
  cacheTag(TAGS.provinces);
  cacheLife("hours");
  return db.select({ code: provinces.code, name: provinces.name }).from(provinces).orderBy(asc(provinces.name));
}

const reviewColumns = { id: reviews.id, quote: reviews.quote, name: reviews.name, place: reviews.place };

export async function getReviews(): Promise<Review[]> {
  "use cache";
  cacheTag(TAGS.reviews);
  cacheLife("hours");
  return db.select(reviewColumns).from(reviews).orderBy(desc(reviews.createdAt), desc(reviews.id)).limit(MAX_REVIEWS);
}

// ---------- Admin (per request, always behind requireUser) ----------

export async function adminGetReviews(): Promise<Review[]> {
  await requireUser();
  return db.select(reviewColumns).from(reviews).orderBy(desc(reviews.createdAt), desc(reviews.id));
}

export async function adminGetProperties(): Promise<Property[]> {
  await requireUser();
  const rows = await db.select().from(properties).orderBy(desc(properties.updatedAt));
  return rows.map(toProperty);
}

export async function adminGetProperty(id: number): Promise<Property | null> {
  await requireUser();
  const [row] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return row ? toProperty(row) : null;
}

export async function adminGetLeads(): Promise<Lead[]> {
  await requireUser();
  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
  return rows.map((r) => ({
    id: r.id, propertyId: r.propertyId, propertyTitle: r.propertyTitle, name: r.name, email: r.email, phone: r.phone,
    method: r.method, message: r.message ?? "", date: r.createdAt.toISOString(), status: r.status,
  }));
}

export async function adminGetEnquiries(): Promise<Enquiry[]> {
  await requireUser();
  const rows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  return rows.map((r) => ({
    id: r.id, name: r.name, email: r.email, phone: r.phone ?? "", subject: r.subject, message: r.message,
    date: r.createdAt.toISOString(), status: r.status,
  }));
}

export async function adminGetStaff(): Promise<StaffMember[]> {
  await requireUser();
  const rows = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt }).from(users).orderBy(asc(users.name));
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

export async function adminGetProvinces(): Promise<ProvinceWithUsage[]> {
  await requireUser();
  const [list, usage] = await Promise.all([
    db.select({ code: provinces.code, name: provinces.name }).from(provinces).orderBy(asc(provinces.name)),
    db.select({ code: properties.provinceCode, n: count() }).from(properties).groupBy(properties.provinceCode),
  ]);
  const byCode = new Map(usage.map((u) => [u.code, u.n]));
  return list.map((p) => ({ ...p, propertyCount: byCode.get(p.code) ?? 0 }));
}
