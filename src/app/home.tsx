"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowRight, Compass, Handshake, KeyRound, LineChart, MapPin, Search, ShieldCheck } from "lucide-react";
const agentImg = "/haley.png";
const lifestyle = "/assets/lifestyle.jpg";
import { SiteLayout } from "@/components/site/SiteChrome";
import { PropertyCard } from "@/components/site/PropertyCard";
import { HeroSlider } from "@/components/site/HeroSlider";
import { agent } from "@/lib/data";
import { ReviewsCarousel } from "@/components/site/ReviewsCarousel";
import { filterListings, EMPTY_QUERY, locationOptions, PRICE_BANDS, toQueryString, typeOptions } from "@/lib/search";
import { MIN_REVIEWS_TO_SHOW, type Property, type Province, type Review } from "@/lib/types";

export function HomePage({ properties, provinces, reviews }: { properties: Property[]; provinces: Province[]; reviews: Review[] }) {
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [band, setBand] = useState(0);

  const locations = useMemo(() => locationOptions(properties, provinces), [properties, provinces]);
  const types = useMemo(() => typeOptions(properties), [properties]);
  const available = useMemo(() => properties.filter((p) => p.status !== "Sold"), [properties]);

  const loc = locations.find((l) => l.value === location);
  const b = PRICE_BANDS[band] ?? PRICE_BANDS[0]!;
  const query = { ...EMPTY_QUERY, city: loc?.city ?? "", province: loc?.province ?? "", type, min: b.min, max: b.max };
  const results = filterListings(available, query);
  const searchHref = `/properties${toQueryString(query)}`;

  // Featured listings first; fall back to the newest available homes so the section is never empty.
  const featured = [...available.filter((p) => p.featured), ...available.filter((p) => !p.featured)].slice(0, 4);
  const regions = provinces.map((p) => p.name).join(" · ");

  const selectCls =
    "w-full appearance-none rounded-sm border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary";

  return (
    <SiteLayout overlay>
      {/* 2. Hero */}
      <section className="relative flex min-h-[92vh] items-end">
        <HeroSlider />
        <div className="container-x relative pb-24 pt-40 text-charcoal-foreground [text-shadow:0_2px_16px_rgb(0_0_0/0.35)]">
          {regions && <p className="eyebrow !text-charcoal-foreground/90">Serving {regions}</p>}
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1.02] md:text-7xl">Find a place that feels like <em className="text-primary not-italic">home</em>.</h1>
          <p className="mt-6 max-w-xl text-lg text-charcoal-foreground/90">Honest advice and negotiation that puts you first — from first showing to final signature.</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/properties" className="inline-flex items-center gap-2 rounded-sm bg-primary px-7 py-4 font-semibold text-primary-foreground hover:bg-primary/90">Explore properties <ArrowRight className="size-4" /></Link>
            <Link href="/contact" className="inline-flex items-center rounded-sm border border-charcoal-foreground/40 px-7 py-4 font-semibold hover:bg-charcoal-foreground/10">Talk to Haley</Link>
          </div>
        </div>
      </section>

      {/* 3. Property discovery */}
      <section className="relative z-10 -mt-12">
        <div className="container-x">
          <div className="rounded-sm border bg-card p-6 shadow-soft md:p-8">
            <div className="flex items-center gap-3">
              <Search className="size-5 text-primary" />
              <h2 className="font-display text-2xl">Start your search</h2>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</span>
                <select className={selectCls} value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="">All locations</option>
                  {locations.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Property type</span>
                <select className={selectCls} value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">All types</option>
                  {types.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price range</span>
                <select className={selectCls} value={band} onChange={(e) => setBand(Number(e.target.value))}>
                  {PRICE_BANDS.map((b, i) => <option key={b.label} value={i}>{b.label}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{results.length}</span> {results.length === 1 ? "home matches" : "homes match"} your search
              </p>
              <Link href={searchHref} className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                View matching homes <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="container-x grid gap-8 py-14 sm:grid-cols-3">
          {[[String(agent.established), "Serving clients since"], [agent.region, "Local and based in"], [agent.brokerage, "Proudly brokered by"]].map(([n, l]) => (
            <div key={l}><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 font-display text-3xl text-primary md:text-4xl">{n}</p></div>
          ))}
        </div>
      </section>

      {/* 4. Featured properties */}
      {featured.length > 0 && (
      <section className="container-x py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><p className="eyebrow">Featured listings</p><h2 className="mt-3 text-4xl md:text-5xl">Homes worth coming home to</h2></div>
          <Link href="/properties" className="inline-flex items-center gap-2 font-semibold text-primary">View all properties <ArrowRight className="size-4" /></Link>
        </div>
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">{featured.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
      </section>
      )}

      {/* 5. About Haley */}
      <section className="bg-muted">
        <div className="container-x grid items-center gap-14 py-24 md:grid-cols-2">
          <Image src={agentImg} alt="Haley Bettle" width={962} height={1634} sizes="(min-width: 768px) 448px, 100vw" className="aspect-[4/5] w-full max-w-md rounded-sm object-cover object-top shadow-soft" />
          <div>
            <p className="eyebrow">Meet your agent</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Hi, I&apos;m Haley.</h2>
            <p className="mt-6 text-lg text-muted-foreground">Since {agent.established} I&apos;ve helped buyers and sellers in Sussex and the surrounding communities navigate one of life&apos;s biggest decisions. My approach is simple: listen closely, advise honestly, and negotiate relentlessly on your behalf.</p>
            <p className="mt-4 text-muted-foreground">Whether it&apos;s a first home in town or a quiet place in the country, I treat every move like it&apos;s my own.</p>
            <Link href="/contact" className="mt-8 inline-flex items-center gap-2 font-semibold text-primary">Get to know me <ArrowRight className="size-4" /></Link>
            <div className="mt-10 border-t border-border pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proudly brokered by</p>
              <Image src="/lepage.jpg" alt="Royal LePage Atlantic — Go Beyond" width={614} height={118} sizes="300px" className="mt-3 h-auto w-64 rounded-sm mix-blend-multiply md:w-72" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why work with Haley */}
      <section className="container-x py-24">
        <p className="eyebrow text-center">Why work with Haley</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center text-4xl md:text-5xl">Guidance you can trust, from people who know the area</h2>
        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {[
            [Compass, "Local expertise", "Deep knowledge of Sussex and the surrounding communities — schools, commutes, and the streets worth knowing."],
            [ShieldCheck, "Honest, pressure-free advice", "Straight answers on pricing, timing, and condition. You'll never be rushed into a decision that isn't right."],
            [Handshake, "Negotiation that delivers", "A clear strategy and firm negotiation to get you the best possible terms, whether you're buying or selling."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Compass;
            return (
              <div key={t as string} className="text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10"><I className="size-6 text-primary" /></div>
                <h3 className="mt-5 font-display text-xl">{t as string}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Lifestyle showcase */}
      <section className="relative overflow-hidden">
        <Image src={lifestyle} alt="Bright living room with lake and mountain views" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
        <div className="container-x relative grid py-28 md:grid-cols-2">
          <div className="text-charcoal-foreground [text-shadow:0_2px_12px_rgb(0_0_0/0.4)]">
            <p className="eyebrow !text-charcoal-foreground">The feeling of home</p>
            <h2 className="mt-4 text-4xl leading-tight md:text-5xl">It&apos;s not just four walls. It&apos;s morning light, quiet shores, and room to grow.</h2>
            <p className="mt-6 max-w-md text-lg text-charcoal-foreground/95">Every search starts with how you want to live. Tell me what home means to you, and I&apos;ll find the places that fit.</p>
            <Link href="/properties" className="mt-8 inline-flex items-center gap-2 rounded-sm bg-primary px-7 py-4 font-semibold text-primary-foreground hover:bg-primary/90">Find your setting <MapPin className="size-4" /></Link>
          </div>
        </div>
      </section>

      {/* 8. Client stories (managed under Admin → Reviews; hidden until there are enough) */}
      {reviews.length >= MIN_REVIEWS_TO_SHOW && (
        <section className="container-x py-24">
          <p className="eyebrow text-center">Client stories</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-4xl md:text-5xl">What clients say</h2>
          <div className="mt-12">
            <ReviewsCarousel reviews={reviews} />
          </div>
        </section>
      )}

      {/* 9. Final CTA */}
      <section className="bg-charcoal">
        <div className="container-x py-24 text-center text-charcoal-foreground">
          <p className="eyebrow !text-charcoal-foreground/70">Let&apos;s talk</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-4xl md:text-5xl">Ready to make your next move?</h2>
          <p className="mx-auto mt-5 max-w-xl text-charcoal-foreground/80">Buying, selling, or just curious about your home&apos;s value — the first conversation is always free.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-sm bg-primary px-8 py-4 font-semibold text-primary-foreground hover:bg-primary/90">Book a consultation <ArrowRight className="size-4" /></Link>
            <Link href="/properties" className="inline-flex items-center gap-2 rounded-sm border border-charcoal-foreground/40 px-8 py-4 font-semibold hover:bg-charcoal-foreground/10"><KeyRound className="size-4" /> Browse listings</Link>
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-charcoal-foreground/60"><LineChart className="size-4" /> Free home evaluations in {agent.region} and the surrounding area</p>
        </div>
      </section>
    </SiteLayout>
  );
}
