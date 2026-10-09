import Image from "next/image";
import type { ReactNode } from "react";

/** Fixed-height full-bleed header shared by inner pages; pair with `<SiteLayout overlay>` so it sits under the fixed nav. */
export function PageHero({ image, alt, eyebrow, title, children }: { image: string; alt: string; eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative flex h-[560px] items-end overflow-hidden md:h-[600px]">
      <Image src={image} alt={alt} fill preload sizes="100vw" className="object-cover" />
      {/* Same tint recipe as the home hero: overall darkening plus a heavier wash behind the text. */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent" />
      <div className="container-x relative pb-16 pt-28 text-charcoal-foreground [text-shadow:0_2px_16px_rgb(0_0_0/0.35)]">
        <p className="eyebrow !text-charcoal-foreground">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-5xl leading-[1.05] md:text-6xl">{title}</h1>
        {children && <p className="mt-5 max-w-xl text-lg text-charcoal-foreground/90">{children}</p>}
      </div>
    </section>
  );
}
