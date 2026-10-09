"use client";

import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Link2, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import { discardUpload } from "@/app/admin/actions";
import { isUrl } from "@/lib/property-validation";
import { isLocal } from "@/lib/utils";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 15 * 1024 * 1024;

async function upload(file: File): Promise<string> {
  const body = new FormData();
  body.set("file", file);
  const res = await fetch("/api/uploads", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed.");
  return data.url;
}

/** Ordered photo list for a listing; the first photo is the main one. */
export function PhotoManager({ photos, onChange, onBusyChange, error }: { photos: string[]; onChange: (update: (prev: string[]) => string[]) => void; onBusyChange: (busy: boolean) => void; error?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [url, setUrl] = useState("");
  // Photos uploaded during this edit; removing one of these deletes the file right away.
  const fresh = useRef(new Set<string>());

  const addFiles = async (files: File[]) => {
    const ok = files.filter((f) => {
      if (!ACCEPT.includes(f.type)) return toast.error(`${f.name}: use a JPEG, PNG, WebP or AVIF photo.`), false;
      if (f.size > MAX_BYTES) return toast.error(`${f.name}: photos must be 15 MB or smaller.`), false;
      return true;
    });
    if (!ok.length) return;
    setPending((n) => n + ok.length);
    onBusyChange(true);
    // Upload in order so photos appear in the order they were picked.
    for (const f of ok) {
      try {
        const u = await upload(f);
        fresh.current.add(u);
        onChange((prev) => [...prev, u]);
      } catch (e) {
        toast.error(`${f.name}: ${e instanceof Error ? e.message : "upload failed."}`);
      } finally {
        setPending((n) => {
          if (n - 1 === 0) onBusyChange(false);
          return n - 1;
        });
      }
    }
  };

  const move = (i: number, to: number) => {
    onChange((prev) => {
      const next = [...prev];
      const [p] = next.splice(i, 1);
      next.splice(to, 0, p!);
      return next;
    });
  };
  const remove = (i: number) => {
    const u = photos[i]!;
    onChange((prev) => prev.filter((x) => x !== u));
    if (fresh.current.delete(u)) void discardUpload(u);
  };
  const addUrl = () => {
    const u = url.trim();
    if (!isUrl(u)) return void toast.error("Enter a full image URL starting with https://");
    if (photos.includes(u)) return void toast.error("That photo is already added.");
    onChange((prev) => [...prev, u]);
    setUrl("");
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void addFiles([...e.dataTransfer.files]);
  };

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <figure key={p} className="group relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted">
            <Image src={p} alt={`Photo ${i + 1}`} fill sizes="240px" unoptimized={!isLocal(p)} className="object-cover" />
            {i === 0 && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-sm bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground"><Star className="size-3" />Main</span>}
            <button type="button" onClick={() => remove(i)} aria-label={`Remove photo ${i + 1}`} className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"><X className="size-4" /></button>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
              <button type="button" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Move earlier" className="flex size-7 items-center justify-center rounded-full bg-white/90 text-foreground disabled:opacity-30"><ChevronLeft className="size-4" /></button>
              {i !== 0 && <button type="button" onClick={() => move(i, 0)} className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-foreground">Make main</button>}
              <button type="button" disabled={i === photos.length - 1} onClick={() => move(i, i + 1)} aria-label="Move later" className="ml-auto flex size-7 items-center justify-center rounded-full bg-white/90 text-foreground disabled:opacity-30"><ChevronRight className="size-4" /></button>
            </div>
          </figure>
        ))}
        {Array.from({ length: pending }, (_, i) => (
          <div key={`pending-${i}`} className="flex aspect-[4/3] items-center justify-center rounded-md border border-dashed border-border bg-muted/60 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed text-center text-sm transition-colors ${dragging ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}
        >
          <ImagePlus className="size-6" />
          <span className="font-medium">Add photos</span>
          <span className="text-xs">or drop them here</span>
        </button>
      </div>
      <input ref={input} type="file" accept={ACCEPT.join(",")} multiple hidden onChange={(e) => { void addFiles([...(e.target.files ?? [])]); e.target.value = ""; }} />
      <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or AVIF, up to 15 MB each. The first photo is the main one; hover a photo to reorder it.</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }} placeholder="Or paste an image URL" className="field !pl-9" />
        </div>
        <button type="button" onClick={addUrl} disabled={!url.trim()} className="rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted disabled:opacity-50">Add</button>
      </div>
    </div>
  );
}
