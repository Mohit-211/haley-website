import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoading } from "@/components/admin/AdminLoading";
import { adminGetProperties } from "@/lib/queries";
import { AdminProperties } from "./admin-properties";

export const metadata: Metadata = { title: "Properties — Haley Bettle Admin" };

export default function Page() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <PropertiesList />
    </Suspense>
  );
}

async function PropertiesList() {
  return <AdminProperties list={await adminGetProperties()} />;
}
