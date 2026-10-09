"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/hero/house1.jpg", alt: "Canadian family home exterior" },
  { src: "/hero/house2.jpg", alt: "Canadian family home exterior" },
  { src: "/hero/house3.jpg", alt: "Canadian family home exterior" },
  { src: "/hero/house4.jpg", alt: "Colourful homes on a tree-lined street in autumn" },
  { src: "/hero/house5.jpg", alt: "Canadian family home exterior" },
];

const INTERVAL_MS = 2000;
const FADE_MS = 700;

/** Full-bleed crossfading background for the home hero. Render inside a `relative` container. */
export function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, active]);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden" aria-roledescription="carousel" aria-label="Featured homes">
        {SLIDES.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt={s.alt}
            fill
            preload={i === 0}
            sizes="100vw"
            aria-hidden={i !== active}
            className={`object-cover motion-safe:transition-[opacity,transform] motion-safe:ease-out ${i === active ? "scale-105 opacity-100" : "scale-100 opacity-0"}`}
            style={{ transitionDuration: `${FADE_MS}ms, ${INTERVAL_MS + FADE_MS}ms` }}
          />
        ))}
      </div>

      {/* Tint: overall darkening plus a heavier wash behind the headline (bottom-left). */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent" />

      {/* Sits above the search card that overlaps the bottom of the hero. */}
      <div
        className="container-x absolute inset-x-0 bottom-24 z-10 flex justify-end gap-2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setActive(i)}
            aria-label={`Show slide ${i + 1} of ${SLIDES.length}`}
            aria-current={i === active}
            className={`h-1.5 rounded-full transition-all ${i === active ? "w-8 bg-white" : "w-4 bg-white/45 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </>
  );
}
