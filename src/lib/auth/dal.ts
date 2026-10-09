import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSessionUser } from "./session";

export type SessionUser = { id: number; name: string; email: string; role: "super_admin" | "employee" };

/** Data Access Layer entry point: every admin read and Server Action goes through here. Deduped per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => readSessionUser());

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Only super admins may add or remove staff accounts. */
export const canManageStaff = (user: SessionUser) => user.role === "super_admin";
