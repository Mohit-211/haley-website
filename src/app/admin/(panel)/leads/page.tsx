import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoading } from "@/components/admin/AdminLoading";
import { adminGetLeads, adminGetProperties } from "@/lib/queries";
import { Leads } from "./leads";

export const metadata: Metadata = { title: "Property Leads — Haley Bettle Admin" };

export default function Page() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <LeadsInbox />
    </Suspense>
  );
}

async function LeadsInbox() {
  const [leads, properties] = await Promise.all([adminGetLeads(), adminGetProperties()]);
  return <Leads leads={leads} liveIds={properties.map((p) => p.id)} />;
}
