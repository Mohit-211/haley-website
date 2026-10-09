import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoading } from "@/components/admin/AdminLoading";
import { adminGetProvinces } from "@/lib/queries";
import { Locations } from "./locations";

export const metadata: Metadata = { title: "Locations — Haley Bettle Admin" };

export default function Page() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <LocationsPage />
    </Suspense>
  );
}

async function LocationsPage() {
  return <Locations provinces={await adminGetProvinces()} />;
}
