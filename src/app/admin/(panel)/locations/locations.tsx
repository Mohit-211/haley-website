"use client";

import { useState, useTransition } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addProvince, removeProvince } from "@/app/admin/actions";
import { AdminCard } from "@/components/admin/AdminShell";
import { CANADIAN_PROVINCES, type ProvinceWithUsage } from "@/lib/types";

export function Locations({ provinces }: { provinces: ProvinceWithUsage[] }) {
  const available = CANADIAN_PROVINCES.filter((p) => !provinces.some((a) => a.code === p.code));
  const [code, setCode] = useState("");
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    start(async () => {
      const res = await fn();
      if (res.ok) toast.success(success);
      else toast.error(res.error);
    });

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Active provinces appear in the property form, the public location filters and the site copy. Add a province when you start listing there; a province can only be removed once no properties use it.
      </p>

      <AdminCard title="Active provinces">
        <ul className="divide-y divide-border">
          {provinces.map((p) => {
            const reason = p.propertyCount > 0 ? `${p.propertyCount} ${p.propertyCount === 1 ? "property uses" : "properties use"} this province` : provinces.length === 1 ? "Keep at least one province" : null;
            return (
              <li key={p.code} className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><MapPin className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{p.name} <span className="text-muted-foreground">({p.code})</span></p>
                  <p className="text-xs text-muted-foreground">{p.propertyCount} {p.propertyCount === 1 ? "property" : "properties"}</p>
                </div>
                <button
                  disabled={pending || !!reason}
                  title={reason ?? `Remove ${p.name}`}
                  aria-label={`Remove ${p.name}`}
                  onClick={() => run(() => removeProvince(p.code), `${p.name} removed`)}
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
          {provinces.length === 0 && <li className="p-5 text-sm text-muted-foreground">No active provinces. Add one below to start creating listings.</li>}
        </ul>
      </AdminCard>

      <AdminCard title="Add a province">
        <div className="flex flex-col gap-3 p-5 sm:flex-row">
          <select value={code} onChange={(e) => setCode(e.target.value)} className="field sm:max-w-sm" aria-label="Province to add">
            <option value="">Choose a province or territory…</option>
            {available.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
          </select>
          <button
            disabled={!code || pending}
            onClick={() => run(async () => { const r = await addProvince(code); if (r.ok) setCode(""); return r; }, `${CANADIAN_PROVINCES.find((p) => p.code === code)?.name} added`)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="size-4" />Add province
          </button>
        </div>
      </AdminCard>
    </div>
  );
}
