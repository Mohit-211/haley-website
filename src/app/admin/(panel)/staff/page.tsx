import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoading } from "@/components/admin/AdminLoading";
import { requireUser } from "@/lib/auth/dal";
import { adminGetStaff } from "@/lib/queries";
import { Staff } from "./staff";

export const metadata: Metadata = { title: "Staff — Haley Bettle Admin" };

export default function Page() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <StaffPage />
    </Suspense>
  );
}

async function StaffPage() {
  const [me, staff] = await Promise.all([requireUser(), adminGetStaff()]);
  return <Staff staff={staff} me={{ id: me.id, role: me.role }} />;
}
