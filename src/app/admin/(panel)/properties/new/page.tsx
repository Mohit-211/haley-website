import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoading } from "@/components/admin/AdminLoading";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { requireUser } from "@/lib/auth/dal";
import { getProvinces } from "@/lib/queries";

export const metadata: Metadata = { title: "Add Property — Haley Bettle Admin" };

export default function Page() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <NewProperty />
    </Suspense>
  );
}

async function NewProperty() {
  await requireUser();
  return <PropertyForm provinces={await getProvinces()} />;
}
