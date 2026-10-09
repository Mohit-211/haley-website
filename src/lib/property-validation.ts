import { PROPERTY_STATUSES, PROPERTY_TYPES, type Property, type PropertyStatus, type PropertyType } from "./types";

/** Raw string values from the admin property form. Shared by the form (instant feedback) and the Server Action (authoritative check). */
export type PropertyFormValues = Record<
  | "title" | "description" | "address" | "city" | "province" | "postalCode" | "price" | "type" | "beds" | "baths"
  | "sqft" | "lotSize" | "parking" | "yearBuilt" | "status" | "image" | "gallery" | "features" | "featured",
  string
>;
export type PropertyFieldErrors = Partial<Record<keyof PropertyFormValues, string>>;

export const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
export const isUrl = (s: string) => /^(https?:\/\/|\/)\S+$/i.test(s);
const blank = (s: string) => s.trim() === "";

export const toFormValues = (p?: Property, defaultProvince = ""): PropertyFormValues => ({
  title: p?.title ?? "", description: p?.description ?? "", address: p?.address ?? "", city: p?.city ?? "",
  province: p?.province ?? defaultProvince, postalCode: p?.postalCode ?? "", price: p ? String(p.price) : "", type: p?.type ?? "",
  beds: p?.beds?.toString() ?? "", baths: p?.baths?.toString() ?? "", sqft: p?.sqft?.toString() ?? "", lotSize: p?.lotSize ?? "",
  parking: p?.parking ?? "", yearBuilt: p?.yearBuilt?.toString() ?? "", status: p?.status ?? "Draft", image: p?.image ?? "",
  gallery: p ? p.gallery.join("\n") : "", features: p?.features.join("\n") ?? "", featured: p?.featured ? "1" : "",
});

/** Only title, price, city, province and status are required; every other field is optional. */
export function validate(v: PropertyFormValues, provinceCodes: string[], now = new Date()): PropertyFieldErrors {
  const e: PropertyFieldErrors = {};
  const year = now.getFullYear();
  if (v.title.trim().length < 3) e.title = "Title must be at least 3 characters.";
  if (v.title.length > 120) e.title = "Keep the title under 120 characters.";
  const price = Number(v.price);
  if (blank(v.price) || !Number.isInteger(price) || price < 1000 || price > 4_000_000_000) e.price = "Enter a whole-dollar price of at least $1,000.";
  if (blank(v.city)) e.city = "City is required.";
  if (!provinceCodes.includes(v.province)) e.province = "Choose a province from your active locations.";
  if (!PROPERTY_STATUSES.includes(v.status as PropertyStatus)) e.status = "Choose a listing status.";
  if (!blank(v.type) && !PROPERTY_TYPES.includes(v.type as PropertyType)) e.type = "Choose a property type.";
  if (!blank(v.postalCode) && !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(v.postalCode.trim())) e.postalCode = "Use a Canadian postal code, e.g. E1C 4M3.";
  if (!blank(v.description) && v.description.trim().length < 20) e.description = "Add at least 20 characters, or leave it empty.";
  if (!blank(v.beds) && (!Number.isInteger(Number(v.beds)) || Number(v.beds) < 0 || Number(v.beds) > 99)) e.beds = "Whole number, 0 or more.";
  if (!blank(v.baths) && (!(Number(v.baths) >= 0) || Number(v.baths) > 99 || (Number(v.baths) * 2) % 1 !== 0)) e.baths = "Use whole or half numbers, e.g. 2.5.";
  if (!blank(v.sqft) && (!Number.isInteger(Number(v.sqft)) || Number(v.sqft) < 100)) e.sqft = "Whole number of at least 100 sq ft.";
  if (!blank(v.yearBuilt) && (!Number.isInteger(Number(v.yearBuilt)) || Number(v.yearBuilt) < 1800 || Number(v.yearBuilt) > year + 3)) e.yearBuilt = `Enter a year between 1800 and ${year + 3}.`;
  if (!blank(v.image) && !isUrl(v.image.trim())) e.image = "Enter a valid image URL starting with http(s)://";
  const bad = lines(v.gallery).find((g) => !isUrl(g));
  if (bad) e.gallery = `Not a valid URL: ${bad.slice(0, 40)}`;
  return e;
}

const opt = (s: string) => (blank(s) ? null : s.trim());
const optNum = (s: string) => (blank(s) ? null : Number(s));

/** Converts validated form values to column values; empty optional fields become null. */
export function toPropertyColumns(v: PropertyFormValues) {
  const image = opt(v.image);
  return {
    title: v.title.trim(),
    status: v.status as PropertyStatus,
    price: Number(v.price),
    city: v.city.trim(),
    provinceCode: v.province,
    address: opt(v.address),
    postalCode: opt(v.postalCode)?.toUpperCase().replace(/^(\w{3})[ -]?(\w{3})$/, "$1 $2") ?? null,
    description: opt(v.description),
    type: (opt(v.type) as PropertyType | null),
    beds: optNum(v.beds),
    baths: optNum(v.baths),
    sqft: optNum(v.sqft),
    lotSize: opt(v.lotSize),
    parking: opt(v.parking),
    yearBuilt: optNum(v.yearBuilt),
    imageUrl: image,
    // The main image is shown first; the gallery holds the additional photos only.
    gallery: lines(v.gallery).filter((g) => g !== image),
    features: lines(v.features),
    featured: v.featured === "1",
  };
}
