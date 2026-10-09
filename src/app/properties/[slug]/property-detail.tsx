"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { BedDouble, Bath, Ruler, Home, Car, Calendar, MapPin, Phone, Mail, Check, ChevronRight, X } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteChrome";
import { PhotoPlaceholder, PropertyCard, StatusBadge } from "@/components/site/PropertyCard";
import { EnquireModal } from "@/components/site/EnquireModal";
import { agent, formatCAD } from "@/lib/data";
import type { Property } from "@/lib/types";
import { isLocal } from "@/lib/utils";

const agentImg = "/haley.png";

/** Drops entries whose value the admin left empty, so the page only shows what's known. */
const known = <T extends { v: string | null }>(items: T[]) => items.filter((i): i is T & { v: string } => i.v !== null && i.v !== "");

export function Detail({ p, related }: { p: Property; related: Property[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [enquiring, setEnquiring] = useState(false);

  const gallery = [p.image, ...p.gallery].filter((g): g is string => !!g);
  const sqft = p.sqft !== null ? `${p.sqft.toLocaleString("en-CA")} sq ft` : null;
  const year = p.yearBuilt?.toString() ?? null;
  const specs = known([
    { icon: BedDouble, v: p.beds?.toString() ?? null, l: "Bedrooms" },
    { icon: Bath, v: p.baths?.toString() ?? null, l: "Bathrooms" },
    { icon: Ruler, v: sqft, l: "Living space" },
    { icon: Home, v: p.type, l: "Property type" },
    { icon: Car, v: p.parking, l: "Parking" },
    { icon: Calendar, v: year, l: "Year built" },
  ]);
  const info = known([
    { l: "Year built", v: year },
    { l: "Lot size", v: p.lotSize },
    { l: "Property type", v: p.type },
    { l: "Parking", v: p.parking },
    { l: "Living space", v: sqft },
    { l: "Status", v: p.status },
  ]);
  const place = [p.address, p.city, p.province].filter(Boolean).join(", ");

  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <nav className="container-x flex items-center gap-1.5 pt-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/properties" className="hover:text-foreground">Properties</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{p.title}</span>
      </nav>

      {/* Title block */}
      <header className="container-x mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <StatusBadge status={p.status} />
          <h1 className="mt-3 text-4xl md:text-5xl">{p.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" /> {place}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Asking price</p>
          <p className="font-display text-3xl md:text-4xl">{formatCAD(p.price)}</p>
        </div>
      </header>

      {/* Gallery */}
      <section className="container-x mt-8">
        {gallery.length === 0 ? (
          <PhotoPlaceholder className="h-[32vh] w-full rounded-sm md:h-[42vh]" />
        ) : (
          <button onClick={() => setLightbox(true)} className="block w-full cursor-zoom-in overflow-hidden rounded-sm" aria-label="Enlarge photo">
            <Image src={gallery[active]!} alt={`${p.title} — photo ${active + 1}`} width={1600} height={1000} preload sizes="(min-width: 1280px) 1200px, 100vw" unoptimized={!isLocal(gallery[active]!)} className="h-[42vh] w-full object-cover md:h-[62vh]" />
          </button>
        )}
        {gallery.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {gallery.map((g, i) => (
              <button
                key={g + i}
                onClick={() => setActive(i)}
                className={`overflow-hidden rounded-sm ring-offset-2 transition ${i === active ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"}`}
                aria-label={`View photo ${i + 1}`}
              >
                <Image src={g} alt="" width={400} height={300} sizes="25vw" unoptimized={!isLocal(g)} className="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      {lightbox && gallery[active] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4" onClick={() => setLightbox(false)}>
          <button className="absolute right-6 top-6 text-background" aria-label="Close"><X className="h-8 w-8" /></button>
          <Image src={gallery[active]} alt={p.title} width={1920} height={1200} sizes="100vw" unoptimized={!isLocal(gallery[active])} className="h-auto max-h-[85vh] w-auto max-w-full rounded-sm object-contain" />
        </div>
      )}

      {/* Main content */}
      <section className="container-x grid gap-12 py-16 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-6 border-y border-border py-8 sm:grid-cols-3">
              {specs.map(({ icon: Icon, v, l }) => (
                <div key={l} className="flex items-start gap-3">
                  <Icon className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-display text-lg leading-tight">{v}</p>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{l}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {p.description && (
            <>
              <h2 className="mt-10 text-2xl first:mt-0">About this home</h2>
              <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{p.description}</p>
            </>
          )}

          {p.features.length > 0 && (
            <>
              <h2 className="mt-10 text-2xl first:mt-0">Key features &amp; amenities</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </>
          )}

          {info.length > 1 && (
            <>
              <h2 className="mt-10 text-2xl first:mt-0">Property information</h2>
              <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {info.map(({ l, v }) => (
                  <div key={l} className="flex justify-between gap-4 border-b border-border pb-3">
                    <dt className="text-muted-foreground">{l}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          <h2 className="mt-10 text-2xl first:mt-0">Location</h2>
          <div className="mt-4 overflow-hidden rounded-sm bg-muted">
            <div className="flex h-56 flex-col items-center justify-center gap-2 px-4 text-center">
              <MapPin className="h-8 w-8 text-primary" />
              {p.address && <p className="font-display text-xl">{p.address}</p>}
              <p className={p.address ? "text-muted-foreground" : "font-display text-xl"}>{p.city}, {p.province}{p.postalCode ? ` ${p.postalCode}` : ""}</p>
            </div>
            <div className="border-t border-border px-6 py-4 text-sm text-muted-foreground">
              Ask Haley for a neighbourhood guide or to book a private showing.
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <div className="bg-muted p-8">
            <p className="text-sm text-muted-foreground">{p.status === "Sold" ? "Last listed at" : "Listed at"}</p>
            <p className="font-display text-4xl">{formatCAD(p.price)}</p>
            {p.status === "Sold" ? (
              <>
                <p className="mt-6 rounded-sm bg-charcoal py-4 text-center font-semibold text-charcoal-foreground">This home has sold</p>
                <Link href="/contact" className="mt-3 block rounded-sm border border-foreground py-3 text-center text-sm font-semibold hover:bg-background">Ask Haley about similar homes</Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEnquiring(true)}
                  className="mt-6 block w-full rounded-sm bg-primary py-4 text-center font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {p.status === "Pending" ? "Join the backup list" : "I'm Interested"}
                </button>
                <EnquireModal property={p} open={enquiring} onOpenChange={setEnquiring} />
                <p className="mt-3 text-center text-xs text-muted-foreground">{p.status === "Pending" ? "An offer is pending — register interest in case it falls through" : "Request details or book a private showing"}</p>
              </>
            )}
          </div>

          {/* Agent card */}
          <div className="border border-border p-8 text-center">
            <Image src={agentImg} alt={agent.name} width={192} height={326} className="mx-auto h-24 w-24 rounded-full object-cover object-[center_15%]" />
            <p className="mt-4 font-display text-xl">{agent.name}</p>
            <p className="text-sm text-muted-foreground">{agent.title}</p>
            <p className="text-xs text-muted-foreground">{agent.brokerage}</p>
            <div className="mt-5 space-y-2 text-sm">
              <a href={agent.phoneHref} className="flex items-center justify-center gap-2 hover:text-primary"><Phone className="h-4 w-4 text-primary" /> {agent.phone}</a>
              <a href={`mailto:${agent.email}`} className="flex items-center justify-center gap-2 hover:text-primary"><Mail className="h-4 w-4 text-primary" /> {agent.email}</a>
            </div>
            <Link href="/contact" className="mt-5 inline-block text-sm font-semibold text-primary hover:underline">
              Contact Haley directly
            </Link>
          </div>
        </aside>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border bg-muted/40 py-16">
          <div className="container-x">
            <p className="eyebrow">Keep exploring</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Similar homes you may like</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <PropertyCard key={r.id} p={r} />)}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
