"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, enquiries, leads, properties } from "@/db";
import type { ActionResult } from "@/lib/types";

const email = z.string().trim().max(255).email("Please enter a valid email address.");
const fieldErrors = <K extends string>(e: z.ZodError) =>
  Object.fromEntries(e.issues.map((i) => [String(i.path[0]), i.message])) as Partial<Record<K, string>>;

// Bots fill every input; humans never see the "website" field.
const isBot = (fd: FormData) => String(fd.get("website") ?? "") !== "";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Please enter your full name.").max(100),
  email,
  phone: z.string().trim().min(7, "Please enter a phone number.").max(30),
  method: z.enum(["Email", "Phone call", "Text message"], { message: "Please choose how you'd like to be contacted." }),
  message: z.string().trim().max(1000).optional(),
});
export type LeadField = keyof z.infer<typeof leadSchema>;

export async function submitLead(slug: string, fd: FormData): Promise<ActionResult<LeadField>> {
  if (isBot(fd)) return { ok: true };
  const parsed = leadSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors<LeadField>(parsed.error) };

  const [p] = await db.select({ id: properties.id, title: properties.title, status: properties.status }).from(properties).where(eq(properties.slug, slug)).limit(1);
  if (!p || p.status === "Draft" || p.status === "Sold") return { ok: false, error: "This property is no longer accepting enquiries." };

  const { message, ...rest } = parsed.data;
  await db.insert(leads).values({ ...rest, message: message || null, propertyId: p.id, propertyTitle: p.title });
  return { ok: true };
}

const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email,
  phone: z.string().trim().max(30).optional(),
  type: z.enum(["Buying", "Selling", "General Question", "Other"]),
  message: z.string().trim().min(1, "Please include a short message.").max(2000),
});
export type EnquiryField = keyof z.infer<typeof enquirySchema>;

export async function submitEnquiry(fd: FormData): Promise<ActionResult<EnquiryField>> {
  if (isBot(fd)) return { ok: true };
  const parsed = enquirySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors<EnquiryField>(parsed.error) };

  const { type, phone, ...rest } = parsed.data;
  await db.insert(enquiries).values({ ...rest, phone: phone || null, subject: type });
  return { ok: true };
}
