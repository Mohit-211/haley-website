// Static site content and formatting helpers. Listings, leads and enquiries live in MySQL (see src/db).

export const agent = {
  name: "Haley Bettle",
  title: "REALTOR® · Sales Representative",
  brokerage: "Royal LePage Atlantic",
  phone: "506-434-3663",
  phoneHref: "tel:+15064343663",
  email: "sass@nbnet.nb.ca",
  /** Public-facing region only; the street address is intentionally not shown on the site. */
  region: "Sussex, NB",
  regionLong: "Sussex, New Brunswick",
  established: 2001,
};

export const formatCAD = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n);

/** Formats an ISO timestamp as a calendar date in New Brunswick time. */
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Moncton" });
