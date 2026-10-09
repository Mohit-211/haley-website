// Client-safe shapes passed from Server Components to Client Components. The DB schema imports
// the enum lists from here so both sides stay in sync.

export const PROPERTY_STATUSES = ["For Sale", "Pending", "Sold", "Draft"] as const;
export const PROPERTY_TYPES = ["Detached", "Semi-Detached", "Condo", "Townhouse", "Cottage", "Land"] as const;
export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Closed"] as const;
export const ENQUIRY_STATUSES = ["New", "Contacted", "Closed"] as const;
export const ROLES = ["super_admin", "employee"] as const;

export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export type Role = (typeof ROLES)[number];

/** Admin-facing label: "For Sale" is shown as "Active" in the admin. */
export const STATUS_LABEL: Record<PropertyStatus, string> = { "For Sale": "Active", Pending: "Pending", Sold: "Sold", Draft: "Draft" };
export const ROLE_LABEL: Record<Role, string> = { super_admin: "Super admin", employee: "Employee" };

/** Optional fields are null when the admin left them empty; the public site hides those. */
export type Property = {
  id: number;
  slug: string;
  title: string;
  status: PropertyStatus;
  price: number;
  city: string;
  province: string;
  address: string | null;
  postalCode: string | null;
  description: string | null;
  type: PropertyType | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lotSize: string | null;
  parking: string | null;
  yearBuilt: number | null;
  image: string | null;
  gallery: string[];
  features: string[];
  featured: boolean;
};

export type Province = { code: string; name: string };
export type ProvinceWithUsage = Province & { propertyCount: number };

export type Lead = { id: number; propertyId: number | null; propertyTitle: string; name: string; email: string; phone: string; method: string | null; message: string; date: string; status: LeadStatus };
export type Enquiry = { id: number; name: string; email: string; phone: string; subject: string; message: string; date: string; status: EnquiryStatus };
export type Review = { id: number; quote: string; name: string; place: string | null };
/** Reviews are capped at 10 in the admin and only shown publicly once there are at least 3. */
export const MAX_REVIEWS = 10;
export const MIN_REVIEWS_TO_SHOW = 3;

export type StaffMember = { id: number; name: string; email: string; role: Role; createdAt: string };

/** Result shape every admin/public Server Action returns to its form. */
export type ActionResult<E extends string = string> = { ok: true; message?: string } | { ok: false; error: string; fieldErrors?: Partial<Record<E, string>> };

export const CANADIAN_PROVINCES: Province[] = [
  { code: "AB", name: "Alberta" }, { code: "BC", name: "British Columbia" }, { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" }, { code: "NL", name: "Newfoundland and Labrador" }, { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" }, { code: "NU", name: "Nunavut" }, { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" }, { code: "QC", name: "Quebec" }, { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];
