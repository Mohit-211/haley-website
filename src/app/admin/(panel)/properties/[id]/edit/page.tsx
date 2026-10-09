import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminLoading } from "@/components/admin/AdminLoading";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { adminGetProperty, getProvinces } from "@/lib/queries";

export const metadata: Metadata = { title: "Edit Property — Haley Bettle Admin" };

export default function Page({ params }: PageProps<"/admin/properties/[id]/edit">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EditProperty params={params} />
    </Suspense>
  );
}

async function EditProperty({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [p, provinces] = await Promise.all([Number.isInteger(id) ? adminGetProperty(id) : null, getProvinces()]);
  if (!p)
    return (
      <div className="rounded-lg border border-border bg-background p-8 text-center">
        <p className="font-medium">This property no longer exists.</p>
        <Link href="/admin/properties" className="mt-3 inline-block text-sm font-semibold text-primary">Back to properties</Link>
      </div>
    );
  return <PropertyForm key={p.id} existing={p} provinces={provinces} />;
}
