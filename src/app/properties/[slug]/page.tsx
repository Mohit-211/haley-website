import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatCAD } from "@/lib/data";
import { getListedProperties, getListedProperty } from "@/lib/queries";
import { Detail } from "./property-detail";

export async function generateMetadata({ params }: PageProps<"/properties/[slug]">): Promise<Metadata> {
  const p = await getListedProperty((await params).slug);
  if (!p) return { title: "Property not found — Haley Bettle" };
  const title = `${p.title} — ${p.city}, ${p.province} | Haley Bettle`;
  const description = p.description?.slice(0, 160) ?? `${formatCAD(p.price)} · ${p.city}, ${p.province}. View photos and book a private showing.`;
  return { title, description, openGraph: { title, description, images: p.image ? [p.image] : undefined } };
}

export default function Page({ params }: PageProps<"/properties/[slug]">) {
  return (
    <Suspense>
      <PropertyPage params={params} />
    </Suspense>
  );
}

async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, all] = await Promise.all([getListedProperty(slug), getListedProperties()]);
  if (!p) notFound();

  // Same city or type first, topped up with other available homes.
  const others = all.filter((x) => x.id !== p.id && x.status !== "Sold");
  const similar = others.filter((x) => x.city === p.city || (p.type !== null && x.type === p.type));
  const related = [...similar, ...others.filter((x) => !similar.includes(x))].slice(0, 3);
  return <Detail p={p} related={related} />;
}
