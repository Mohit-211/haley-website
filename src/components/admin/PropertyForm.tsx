"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { saveProperty } from "@/app/admin/actions";
import { AdminCard } from "@/components/admin/AdminShell";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { lines, toFormValues, validate, type PropertyFieldErrors, type PropertyFormValues } from "@/lib/property-validation";
import { PROPERTY_STATUSES, PROPERTY_TYPES, STATUS_LABEL, type Property, type Province } from "@/lib/types";

export function PropertyForm({ existing, provinces }: { existing?: Property; provinces: Province[] }) {
  const router = useRouter();
  const [saving, startSave] = useTransition();
  const [v, setV] = useState<PropertyFormValues>(() => toFormValues(existing, provinces.length === 1 ? provinces[0]!.code : ""));
  const [errors, setErrors] = useState<PropertyFieldErrors>({});
  const [uploading, setUploading] = useState(false);
  // Photos are edited as one ordered list; the first is stored as the main image, the rest as the gallery.
  const photos = [v.image, ...lines(v.gallery)].filter(Boolean);
  const setPhotos = (update: (prev: string[]) => string[]) =>
    setV((x) => {
      const list = update([x.image, ...lines(x.gallery)].filter(Boolean));
      return { ...x, image: list[0] ?? "", gallery: list.slice(1).join("\n") };
    });
  const set = (k: keyof PropertyFormValues) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));
  const codes = provinces.map((p) => p.code);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(v, codes);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    startSave(async () => {
      const res = await saveProperty(existing?.id ?? null, v);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        return;
      }
      toast.success(existing ? "Property updated" : "Property created", { description: v.title });
      router.push("/admin/properties");
    });
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto grid max-w-4xl gap-6">
      <p className="text-sm text-muted-foreground">Fields marked * are required. Anything you leave empty is simply not shown on the public listing.</p>

      <AdminCard title="Overview">
        <div className="grid gap-4 p-5">
          <F label="Property title *" err={errors.title}><input value={v.title} onChange={set("title")} maxLength={120} className="field" /></F>
          <F label="Description" err={errors.description}><textarea value={v.description} onChange={set("description")} rows={5} maxLength={5000} className="field" /></F>
          <div className="grid gap-4 sm:grid-cols-3">
            <F label="Price (CAD) *" err={errors.price}><input inputMode="numeric" value={v.price} onChange={set("price")} placeholder="425000" className="field" /></F>
            <F label="Property type" err={errors.type}>
              <select value={v.type} onChange={set("type")} className="field">
                <option value="">Not specified</option>
                {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </F>
            <F label="Listing status *" err={errors.status}>
              <select value={v.status} onChange={set("status")} className="field">{PROPERTY_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
            </F>
          </div>
          {v.status === "Draft" && <p className="text-xs text-muted-foreground">Draft listings are hidden from the public website.</p>}
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={v.featured === "1"} onChange={(e) => setV((x) => ({ ...x, featured: e.target.checked ? "1" : "" }))} className="size-4 accent-[var(--primary)]" />
            Feature this listing on the home page
          </label>
        </div>
      </AdminCard>

      <AdminCard title="Location">
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <F label="Street address" err={errors.address} className="sm:col-span-2"><input value={v.address} onChange={set("address")} className="field" /></F>
          <F label="City *" err={errors.city}><input value={v.city} onChange={set("city")} placeholder="Moncton" className="field" /></F>
          <div className="grid grid-cols-2 gap-4">
            <F label="Province *" err={errors.province}>
              <select value={v.province} onChange={set("province")} className="field" disabled={provinces.length === 1}>
                {provinces.length !== 1 && <option value="">Choose…</option>}
                {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </F>
            <F label="Postal code" err={errors.postalCode}><input value={v.postalCode} onChange={set("postalCode")} placeholder="E1C 4M3" maxLength={7} className="field" /></F>
          </div>
          {provinces.length === 0 && <p className="text-sm text-destructive sm:col-span-2">Add a province under Locations before creating listings.</p>}
        </div>
      </AdminCard>

      <AdminCard title="Details">
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <F label="Bedrooms" err={errors.beds}><input inputMode="numeric" value={v.beds} onChange={set("beds")} className="field" /></F>
          <F label="Bathrooms" err={errors.baths}><input inputMode="decimal" value={v.baths} onChange={set("baths")} className="field" /></F>
          <F label="Interior size (sq ft)" err={errors.sqft}><input inputMode="numeric" value={v.sqft} onChange={set("sqft")} className="field" /></F>
          <F label="Lot size"><input value={v.lotSize} onChange={set("lotSize")} placeholder="50 × 120 ft" className="field" /></F>
          <F label="Parking"><input value={v.parking} onChange={set("parking")} placeholder="Double garage" className="field" /></F>
          <F label="Year built" err={errors.yearBuilt}><input inputMode="numeric" value={v.yearBuilt} onChange={set("yearBuilt")} className="field" /></F>
        </div>
      </AdminCard>

      <AdminCard title="Photos">
        <div className="p-5">
          <PhotoManager photos={photos} onChange={setPhotos} onBusyChange={setUploading} error={errors.image ?? errors.gallery} />
        </div>
      </AdminCard>

      <AdminCard title="Key features & amenities">
        <div className="p-5">
          <F label="One feature per line"><textarea value={v.features} onChange={set("features")} rows={5} placeholder={"Heated floors\nChef's kitchen"} className="field" /></F>
        </div>
      </AdminCard>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push("/admin/properties")} className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
        <button disabled={saving || uploading || provinces.length === 0} className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {uploading ? "Uploading photos…" : saving ? "Saving…" : existing ? "Save changes" : "Create property"}
        </button>
      </div>
    </form>
  );
}

function F({ label, err, children, className = "" }: { label: string; err?: string | undefined; children: ReactNode; className?: string }) {
  return (
    <label className={`grid content-start gap-1.5 text-sm font-medium ${className}`}>
      {label}
      {children}
      {err && <span className="text-xs font-normal text-destructive">{err}</span>}
    </label>
  );
}
