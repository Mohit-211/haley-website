import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoading } from "@/components/admin/AdminLoading";
import { adminGetEnquiries } from "@/lib/queries";
import { Enquiries } from "./enquiries";

export const metadata: Metadata = { title: "Contact Enquiries — Haley Bettle Admin" };

export default function Page() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EnquiriesInbox />
    </Suspense>
  );
}

async function EnquiriesInbox() {
  return <Enquiries enquiries={await adminGetEnquiries()} />;
}
