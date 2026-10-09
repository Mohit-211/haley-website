"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import type { Review } from "@/lib/types";

const AUTOPLAY_MS = 5000;

/** Auto-advancing, looping client stories. Pauses while hovered or focused. */
export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState(0);

  useEffect(() => {
    if (!api) return;
    const sync = () => {
      setSelected(api.selectedScrollSnap());
      setSnaps(api.scrollSnapList().length);
    };
    api.on("select", sync).on("reInit", sync);
    sync();
    return () => {
      api.off("select", sync).off("reInit", sync);
    };
  }, [api]);

  useEffect(() => {
    if (!api || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => api.scrollNext(), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [api, paused]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <Carousel setApi={setApi} opts={{ loop: true, align: "start" }} aria-label="Client stories">
        <CarouselContent className="-ml-8">
          {reviews.map((r) => (
            <CarouselItem key={r.id} className="pl-8 md:basis-1/2 lg:basis-1/3">
              <figure className="flex h-full flex-col">
                <Quote className="size-8 shrink-0 text-primary" />
                <blockquote className="mt-4 flex-1 font-display text-xl leading-snug">{r.quote}</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{r.name}</span>
                  {r.place && <span className="text-muted-foreground"> · {r.place}</span>}
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {snaps > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: snaps }, (_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              aria-label={`Show review ${i + 1}`}
              aria-current={i === selected}
              className={`h-1.5 rounded-full transition-all ${i === selected ? "w-8 bg-primary" : "w-4 bg-foreground/20 hover:bg-foreground/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
