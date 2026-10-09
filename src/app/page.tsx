import type { Metadata } from "next";
import { getListedProperties, getProvinces, getReviews } from "@/lib/queries";
import { HomePage } from "./home";

export const metadata: Metadata = {
  title: "Haley Bettle — Real Estate in Sussex, NB",
  description: "Buy and sell homes in Sussex, New Brunswick with Haley Bettle, REALTOR® with Royal LePage Atlantic. Serving clients since 2001.",
  openGraph: { title: "Haley Bettle — Real Estate in Sussex, NB", description: "Honest advice and expert negotiation in Sussex and the surrounding area since 2001.", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default async function Page() {
  const [properties, provinces, reviews] = await Promise.all([getListedProperties(), getProvinces(), getReviews()]);
  return <HomePage properties={properties} provinces={provinces} reviews={reviews} />;
}
