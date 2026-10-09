"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteChrome";
import { PageHero } from "@/components/site/PageHero";
import { PropertyCard } from "@/components/site/PropertyCard";
import { EMPTY_QUERY, filterListings, locationOptions, parseQuery, SORTS, toQueryString, typeOptions, type ListingQuery } from "@/lib/search";
import type { Property, Province } from "@/lib/types";

const heroImg = "/assets/hero.jpg";
const PAGE_SIZE = 6;

const selectCls =
  "w-full appearance-none rounded-sm border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary";

type Props = { properties: Property[]; provinces: Province[] };

/** Reads the initial filters from the URL (e.g. a search started on the home page). */
export function ListingsFromUrl(props: Props) {
  const params = useSearchParams();
  return <Listings {...props} initial={parseQuery(params)} />;
}

export function Listings({ properties, provinces, initial = EMPTY_QUERY }: Props & { initial?: ListingQuery }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initial);
  const [shown, setShown] = useState(PAGE_SIZE);

  const locations = useMemo(() => locationOptions(properties, provinces), [properties, provinces]);
  const types = useMemo(() => typeOptions(properties), [properties]);
  const results = useMemo(() => filterListings(properties, query), [properties, query]);
  const visible = results.slice(0, shown);

  // Keep the URL in sync so filtered views can be shared and survive a refresh.
  const update = (patch: Partial<ListingQuery>) => {
    const next = { ...query, ...patch };
    setQuery(next);
    setShown(PAGE_SIZE);
    router.replace(`${pathname}${toQueryString(next)}`, { scroll: false });
  };
  const location = query.city ? `${query.city}|${query.province || (locations.find((l) => l.city === query.city)?.province ?? "")}` : "";
  const region = provinces.length ? provinces.map((p) => p.name).join(" & ") : "Canada";

  return (
    <SiteLayout overlay>
      <PageHero image={heroImg} alt="Lakeside modern home at sunset" eyebrow="Current listings" title={`Exceptional homes across ${region}`}>
        From in-town family homes to waterfront retreats — every listing is personally vetted by Haley.
      </PageHero>

      {/* Search & filters */}
      <section className="border-b bg-muted/60">
        <div className="container-x py-10">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="size-5 text-primary" />
            <h2 className="font-display text-2xl">Refine your search</h2>
          </div>
          <label className="relative mt-6 block">
            <span className="sr-only">Search listings</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Search by street, neighbourhood, postal code or feature"
              className={`${selectCls} pl-11`}
            />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Filter label="Location">
              <select className={selectCls} value={location} onChange={(e) => { const l = locations.find((x) => x.value === e.target.value); update({ city: l?.city ?? "", province: l?.province ?? "" }); }}>
                <option value="">All locations</option>
                {locations.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </Filter>
            <Filter label="Property type">
              <select className={selectCls} value={query.type} onChange={(e) => update({ type: e.target.value })}>
                <option value="">All types</option>
                {types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Filter>
            <Filter label="Min price (CAD)">
              <input type="number" min={0} placeholder="No minimum" className={selectCls} value={query.min} onChange={(e) => update({ min: e.target.value })} />
            </Filter>
            <Filter label="Max price (CAD)">
              <input type="number" min={0} placeholder="No maximum" className={selectCls} value={query.max} onChange={(e) => update({ max: e.target.value })} />
            </Filter>
            <Filter label="Bedrooms">
              <select className={selectCls} value={query.beds} onChange={(e) => update({ beds: e.target.value })}>
                {["", "1", "2", "3", "4", "5"].map((b) => <option key={b} value={b}>{b ? `${b}+` : "Any"}</option>)}
              </select>
            </Filter>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container-x py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{visible.length}</span> of <span className="font-semibold text-foreground">{results.length}</span> {results.length === 1 ? "property" : "properties"}
          </p>
          <label className="flex items-center gap-3 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort by</span>
            <select className={`${selectCls} !w-auto`} value={query.sort} onChange={(e) => update({ sort: e.target.value as ListingQuery["sort"] })}>
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>

        {results.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-sm border border-dashed py-20 text-center">
            <SearchX className="size-10 text-muted-foreground" />
            {properties.length === 0 ? (
              <>
                <h3 className="mt-5 font-display text-2xl">New listings are on the way</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">There are no homes listed right now. Tell Haley what you&apos;re looking for and she&apos;ll reach out when something fits.</p>
                <Link href="/contact" className="mt-6 rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Contact Haley</Link>
              </>
            ) : (
              <>
                <h3 className="mt-5 font-display text-2xl">No homes match those filters</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">Try widening your price range or clearing a filter — new listings arrive every week.</p>
                <button onClick={() => update({ ...EMPTY_QUERY, sort: query.sort })} className="mt-6 rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Clear all filters</button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
            {shown < results.length && (
              <div className="mt-16 text-center">
                <button onClick={() => setShown((n) => n + PAGE_SIZE)} className="rounded-sm border border-foreground/20 px-8 py-4 font-semibold hover:bg-muted">
                  Load more properties
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Contact CTA */}
      <section className="bg-charcoal">
        <div className="container-x flex flex-col items-center gap-6 py-16 text-center text-charcoal-foreground md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl">Can&apos;t find the one?</h2>
            <p className="mt-2 text-charcoal-foreground/75">Many of the best homes sell before they&apos;re ever listed. Tell Haley what you&apos;re looking for.</p>
          </div>
          <Link href="/contact" className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-primary px-7 py-4 font-semibold text-primary-foreground hover:bg-primary/90">
            Get in touch <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
