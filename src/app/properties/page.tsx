import type { Metadata } from "next";
import { Suspense } from "react";
import { getListedProperties, getProvinces } from "@/lib/queries";
import { Listings, ListingsFromUrl } from "./listings";

export const metadata: Metadata = {
  title: "Properties for Sale — Haley Bettle",
  description: "Browse homes for sale, personally vetted by Haley Bettle.",
  openGraph: { title: "Properties for Sale — Haley Bettle", description: "Browse homes for sale, personally vetted by Haley Bettle.", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default async function Page() {
  const [properties, provinces] = await Promise.all([getListedProperties(), getProvinces()]);
  return (
    // The static shell shows every listing; filters from the URL apply once the client reads it.
    <Suspense fallback={<Listings properties={properties} provinces={provinces} />}>
      <ListingsFromUrl properties={properties} provinces={provinces} />
    </Suspense>
  );
}
