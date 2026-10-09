"use client";

import Image from "next/image";
import { useState, useTransition, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PhotoPlaceholder } from "@/components/site/PropertyCard";
import { formatCAD } from "@/lib/data";
import type { Property } from "@/lib/types";
import { submitLead, type LeadField } from "@/app/actions";
import { isLocal } from "@/lib/utils";

const METHODS = ["Email", "Phone call", "Text message"] as const;

export function EnquireModal({ property, open, onOpenChange }: { property: Property; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="block max-h-[92vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-sm p-0 sm:rounded-sm">
        {/* Lives inside the content so form state resets each time the modal closes. */}
        <EnquireForm p={property} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function EnquireForm({ p, onDone }: { p: Property; onDone: () => void }) {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<LeadField, string>>>({});
  const [formError, setFormError] = useState("");
  const [pending, start] = useTransition();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await submitLead(p.slug, fd);
      if (res.ok) return setSent(true);
      setErrors(res.fieldErrors ?? {});
      setFormError(res.fieldErrors ? "" : res.error);
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 border-b border-border bg-muted/60 p-5 pr-12">
        {p.image ? <Image src={p.image} alt="" width={96} height={72} unoptimized={!isLocal(p.image)} className="h-[72px] w-24 shrink-0 rounded-sm object-cover" /> : <PhotoPlaceholder className="h-[72px] w-24 shrink-0 rounded-sm" />}
        <div className="min-w-0">
          <p className="truncate font-display text-lg">{p.title}</p>
          <p className="truncate text-sm text-muted-foreground">{[p.address, p.city, p.province].filter(Boolean).join(", ")}</p>
          <p className="font-display text-primary">{formatCAD(p.price)}</p>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {sent ? (
          <div className="flex items-start gap-3 bg-accent p-6">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div>
              <DialogTitle className="font-sans text-base font-semibold tracking-normal">Thank you — your enquiry about {p.title} has been received.</DialogTitle>
              <DialogDescription className="mt-1">Haley will be in touch shortly.</DialogDescription>
              <button onClick={onDone} className="mt-4 font-semibold text-primary hover:underline">Back to the listing</button>
            </div>
          </div>
        ) : (
          <>
            <p className="eyebrow">{p.status === "Pending" ? "Backup offer list" : "Property enquiry"}</p>
            <DialogTitle className="mt-2 text-3xl font-normal">I&apos;m interested in this home</DialogTitle>
            <DialogDescription className="mt-2 text-base">
              Tell Haley how to reach you and she&apos;ll follow up with details, floor plans, or a private showing time.
            </DialogDescription>
            <form onSubmit={submit} noValidate className="mt-6 grid gap-4">
              <div>
                <input name="name" placeholder="Full name *" maxLength={100} className="field" autoFocus />
                {errors["name"] && <p className="mt-1 text-sm text-primary">{errors["name"]}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <input type="email" name="email" placeholder="Email *" maxLength={255} className="field" />
                  {errors["email"] && <p className="mt-1 text-sm text-primary">{errors["email"]}</p>}
                </div>
                <div>
                  <input name="phone" placeholder="Phone number *" maxLength={20} className="field" />
                  {errors["phone"] && <p className="mt-1 text-sm text-primary">{errors["phone"]}</p>}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Preferred contact method *</p>
                <div className="flex flex-wrap gap-2">
                  {METHODS.map((m) => (
                    <label key={m} className="cursor-pointer">
                      <input type="radio" name="method" value={m} className="peer sr-only" />
                      <span className="inline-block rounded-full border border-border px-4 py-2 text-sm peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                        {m}
                      </span>
                    </label>
                  ))}
                </div>
                {errors["method"] && <p className="mt-1 text-sm text-primary">{errors["method"]}</p>}
              </div>
              <textarea name="message" rows={4} maxLength={1000} placeholder="Message — e.g. I'd like to book a showing this weekend..." className="field" />
              {/* Honeypot: hidden from people, filled in by bots. */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
              <button disabled={pending} className="rounded-sm bg-primary py-4 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {pending ? "Sending…" : "Send enquiry"}
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
