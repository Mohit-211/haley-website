import type { Property, Province } from "./types";

/** Listing filters as they appear in the /properties URL, e.g. ?city=Moncton&type=Detached&min=300000 */
export type ListingQuery = { q: string; city: string; province: string; type: string; min: string; max: string; beds: string; sort: SortId };

export const SORTS = [
  { id: "featured", label: "Featured first" },
  { id: "newest", label: "Newest listings" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "beds-desc", label: "Most bedrooms" },
  { id: "size-desc", label: "Largest size" },
] as const;
export type SortId = (typeof SORTS)[number]["id"];

export const EMPTY_QUERY: ListingQuery = { q: "", city: "", province: "", type: "", min: "", max: "", beds: "", sort: "featured" };

/** Bands for the home page quick search, sized for the New Brunswick market. */
export const PRICE_BANDS = [
  { label: "Any price", min: "", max: "" },
  { label: "Under $300K", min: "", max: "300000" },
  { label: "$300K – $500K", min: "300000", max: "500000" },
  { label: "$500K – $800K", min: "500000", max: "800000" },
  { label: "Over $800K", min: "800000", max: "" },
];

export function parseQuery(params: URLSearchParams): ListingQuery {
  const get = (k: keyof ListingQuery) => params.get(k)?.trim() ?? "";
  const sort = SORTS.some((s) => s.id === params.get("sort")) ? (params.get("sort") as SortId) : "featured";
  return { q: get("q"), city: get("city"), province: get("province"), type: get("type"), min: get("min"), max: get("max"), beds: get("beds"), sort };
}

export function toQueryString(q: Partial<ListingQuery>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (v && !(k === "sort" && v === "featured")) params.set(k, v);
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** Location choices come from the listings themselves, so the filter tracks whatever provinces are active. */
export function locationOptions(properties: Property[], provinces: Province[]) {
  const multi = new Set(properties.map((p) => p.province)).size > 1 || provinces.length > 1;
  const seen = new Map<string, { value: string; label: string; city: string; province: string }>();
  for (const p of properties) {
    const value = `${p.city}|${p.province}`;
    if (!seen.has(value)) seen.set(value, { value, label: multi ? `${p.city}, ${p.province}` : p.city, city: p.city, province: p.province });
  }
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/** Only offer property types that at least one listing actually has. */
export const typeOptions = (properties: Property[]) => [...new Set(properties.map((p) => p.type).filter((t) => t !== null))].sort();

export function filterListings(all: Property[], q: ListingQuery) {
  const min = q.min ? Number(q.min) : 0;
  const max = q.max ? Number(q.max) : Infinity;
  const minBeds = q.beds ? Number(q.beds) : 0;
  const words = q.q.toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = all.filter((p) => {
    if (q.city && p.city !== q.city) return false;
    if (q.province && p.province !== q.province) return false;
    if (q.type && p.type !== q.type) return false;
    if (p.price < min || p.price > max) return false;
    if (minBeds && (p.beds ?? 0) < minBeds) return false;
    if (words.length) {
      const hay = [p.title, p.address, p.city, p.postalCode, p.type, p.description, ...p.features].filter(Boolean).join(" ").toLowerCase();
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });
  const sorted = [...filtered];
  switch (q.sort) {
    case "price-asc": sorted.sort((a, b) => a.price - b.price); break;
    case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
    case "beds-desc": sorted.sort((a, b) => (b.beds ?? -1) - (a.beds ?? -1)); break;
    case "size-desc": sorted.sort((a, b) => (b.sqft ?? -1) - (a.sqft ?? -1)); break;
    case "newest": sorted.sort((a, b) => b.id - a.id); break;
    default: sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
  // Sold homes stay visible for credibility but always sit after available listings.
  return [...sorted.filter((p) => p.status !== "Sold"), ...sorted.filter((p) => p.status === "Sold")];
}
