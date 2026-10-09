import { ENQUIRY_STATUSES, LEAD_STATUSES, PROPERTY_STATUSES, PROPERTY_TYPES, ROLES } from "../lib/types";
import { boolean, char, datetime, decimal, index, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

// INT UNSIGNED (not serial/BIGINT) so foreign keys match their referenced columns.
const id = () => int("id", { unsigned: true }).autoincrement().primaryKey();


/** Provinces the business operates in. Drives the property form, public location filters and copy. */
export const provinces = mysqlTable("provinces", {
  code: char("code", { length: 2 }).primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const properties = mysqlTable(
  "properties",
  {
    id: id(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    title: varchar("title", { length: 120 }).notNull(),
    status: mysqlEnum("status", PROPERTY_STATUSES).notNull().default("Draft"),
    price: int("price", { unsigned: true }).notNull(),
    city: varchar("city", { length: 80 }).notNull(),
    provinceCode: char("province_code", { length: 2 })
      .notNull()
      .references(() => provinces.code, { onUpdate: "cascade", onDelete: "restrict" }),
    // Everything below is optional; the public site hides whatever is left empty.
    address: varchar("address", { length: 160 }),
    postalCode: varchar("postal_code", { length: 7 }),
    description: text("description"),
    type: mysqlEnum("type", PROPERTY_TYPES),
    beds: int("beds", { unsigned: true }),
    baths: decimal("baths", { precision: 3, scale: 1, mode: "number" }),
    sqft: int("sqft", { unsigned: true }),
    lotSize: varchar("lot_size", { length: 80 }),
    parking: varchar("parking", { length: 80 }),
    yearBuilt: int("year_built", { unsigned: true }),
    imageUrl: varchar("image_url", { length: 1024 }),
    gallery: json("gallery").$type<string[]>().notNull(),
    features: json("features").$type<string[]>().notNull(),
    featured: boolean("featured").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [index("properties_status_idx").on(t.status), index("properties_city_idx").on(t.city)],
);

export const users = mysqlTable("users", {
  id: id(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ROLES).notNull().default("employee"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = mysqlTable(
  "sessions",
  {
    // SHA-256 of the cookie token, so a leaked table can't be replayed as cookies.
    id: char("id", { length: 64 }).primaryKey(),
    userId: int("user_id", { unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: datetime("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const leads = mysqlTable(
  "leads",
  {
    id: id(),
    propertyId: int("property_id", { unsigned: true }).references(() => properties.id, { onDelete: "set null" }),
    // Snapshot so the lead still makes sense after the listing is deleted.
    propertyTitle: varchar("property_title", { length: 120 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    method: varchar("method", { length: 30 }),
    message: text("message"),
    status: mysqlEnum("status", LEAD_STATUSES).notNull().default("New"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("leads_created_idx").on(t.createdAt)],
);

export const enquiries = mysqlTable(
  "enquiries",
  {
    id: id(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 30 }),
    subject: varchar("subject", { length: 60 }).notNull(),
    message: text("message").notNull(),
    status: mysqlEnum("status", ENQUIRY_STATUSES).notNull().default("New"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("enquiries_created_idx").on(t.createdAt)],
);

/** Client testimonials managed from the admin. The home page shows them once there are at least 3. */
export const reviews = mysqlTable("reviews", {
  id: id(),
  quote: text("quote").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  place: varchar("place", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
