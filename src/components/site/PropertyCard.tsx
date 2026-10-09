import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Home } from "lucide-react";
import { formatCAD } from "@/lib/data";
import type { Property } from "@/lib/types";
import { isLocal } from "@/lib/utils";

export function StatusBadge({ status }: { status: Property["status"] }) {
  const cls = status === "For Sale" ? "bg-primary text-primary-foreground" : status === "Pending" ? "bg-warning text-charcoal" : status === "Draft" ? "bg-muted text-muted-foreground" : "bg-charcoal text-charcoal-foreground";
  return <span className={`rounded-sm px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider ${cls}`}>{status}</span>;
}

/** Shown wherever a listing has no photo yet. */
export function PhotoPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
      <Home className="size-10 opacity-40" />
    </div>
  );
}

/** "3 bd · 2 ba · 1,450 sqft", skipping whatever the listing doesn't specify. */
export const specLine = (p: Property) =>
  [p.beds !== null && `${p.beds} bd`, p.baths !== null && `${p.baths} ba`, p.sqft !== null && `${p.sqft.toLocaleString("en-CA")} sqft`].filter(Boolean).join(" · ");

export function PropertyCard({ p }: { p: Property }) {
  const specs = specLine(p);
  return (
    <Link href={`/properties/${p.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
        {p.image ? (
          <Image src={p.image} alt={p.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" unoptimized={!isLocal(p.image)} className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <PhotoPlaceholder className="h-full w-full" />
        )}
        <div className="absolute left-4 top-4"><StatusBadge status={p.status} /></div>
      </div>
      <div className="pt-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{p.city}, {p.province}</p>
        <h3 className="mt-1.5 text-xl group-hover:text-primary">{p.title}</h3>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-lg font-bold">{formatCAD(p.price)}</span>
          {specs && <span className="text-sm text-muted-foreground">{specs}</span>}
        </div>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">View Property <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}
