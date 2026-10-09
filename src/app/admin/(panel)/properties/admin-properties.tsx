"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { AdminCard } from "@/components/admin/AdminShell";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteProperty, setPropertyStatus } from "@/app/admin/actions";
import { formatCAD } from "@/lib/data";
import { PROPERTY_STATUSES as STATUSES, STATUS_LABEL, type ActionResult, type Property, type PropertyStatus } from "@/lib/types";
import { isLocal } from "@/lib/utils";

const SORTS = [
  { id: "title", label: "Title A–Z" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "city", label: "Location A–Z" },
] as const;

const statusCls: Record<PropertyStatus, string> = {
  "For Sale": "bg-primary/10 text-primary",
  Pending: "bg-warning/20 text-foreground",
  Sold: "bg-foreground text-background",
  Draft: "bg-muted text-muted-foreground",
};

const notify = (r: ActionResult, success: string, description: string) =>
  r.ok ? toast.success(success, { description }) : toast.error(r.error, { description });

function StatusSelect({ p }: { p: Property }) {
  return (
    <select
      aria-label={`Status for ${p.title}`}
      value={p.status}
      onChange={async (e) => {
        const s = e.target.value as PropertyStatus;
        notify(await setPropertyStatus(p.id, s), `Status set to ${STATUS_LABEL[s]}`, p.title);
      }}
      className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${statusCls[p.status]}`}
    >
      {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
    </select>
  );
}

function Actions({ p, onDelete }: { p: Property; onDelete: () => void }) {
  const btn = "flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground";
  return (
    <div className="flex justify-end gap-1">
      {p.status === "Draft" ? (
        <span className={`${btn} cursor-not-allowed opacity-40`} title="Drafts are hidden from the public site"><ExternalLink className="size-4" /></span>
      ) : (
        <Link href={`/properties/${p.slug}`} target="_blank" className={btn} title="View on site" aria-label="View"><ExternalLink className="size-4" /></Link>
      )}
      <Link href={`/admin/properties/${p.id}/edit`} className={btn} title="Edit" aria-label="Edit"><Pencil className="size-4" /></Link>
      <button onClick={onDelete} className={`${btn} hover:!text-destructive`} title="Delete" aria-label="Delete"><Trash2 className="size-4" /></button>
    </div>
  );
}

export function AdminProperties({ list }: { list: Property[] }) {
  const [deleting, startDelete] = useTransition();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | PropertyStatus>("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("title");
  const [toDelete, setToDelete] = useState<Property | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const r = list.filter((p) => (status === "all" || p.status === status) && (!term || `${p.title} ${p.address} ${p.city} ${p.province}`.toLowerCase().includes(term)));
    return [...r].sort((a, b) =>
      sort === "price-desc" ? b.price - a.price : sort === "price-asc" ? a.price - b.price : sort === "city" ? a.city.localeCompare(b.city) : a.title.localeCompare(b.title),
    );
  }, [list, q, status, sort]);

  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s, list.filter((p) => p.status === s).length])), [list]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{list.length} {list.length === 1 ? "property" : "properties"} in total. Drafts are hidden from the public website.</p>
        <Link href="/admin/properties/new" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="size-4" />Add Property
        </Link>
      </div>

      <AdminCard>
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, address or city" className="field !pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["all", ...STATUSES] as const).map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${status === s ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {s === "all" ? `All (${list.length})` : `${STATUS_LABEL[s]} (${counts[s]})`}
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="field lg:w-48" aria-label="Sort">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No properties match your filters.{" "}
            <button onClick={() => { setQ(""); setStatus("all"); }} className="font-semibold text-primary hover:underline">Clear filters</button>
          </div>
        ) : (
          <>
            <table className="hidden w-full text-sm lg:table">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image ? <Image src={p.image} alt="" width={44} height={44} unoptimized={!isLocal(p.image)} className="size-11 shrink-0 rounded-md object-cover" /> : <div className="size-11 shrink-0 rounded-md bg-muted" />}
                        <span className="font-medium">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.city}, {p.province}</td>
                    <td className="px-4 py-3 font-medium tabular-nums">{formatCAD(p.price)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.type ?? "—"}</td>
                    <td className="px-4 py-3"><StatusSelect p={p} /></td>
                    <td className="px-4 py-3"><Actions p={p} onDelete={() => setToDelete(p)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-border lg:hidden">
              {rows.map((p) => (
                <li key={p.id} className="flex gap-3 p-4">
                  {p.image ? <Image src={p.image} alt="" width={64} height={64} unoptimized={!isLocal(p.image)} className="size-16 shrink-0 rounded-md object-cover" /> : <div className="size-16 shrink-0 rounded-md bg-muted" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.city}, {p.province}{p.type ? ` · ${p.type}` : ""}</p>
                    <p className="mt-1 text-sm font-semibold">{formatCAD(p.price)}</p>
                    <div className="mt-2 flex items-center justify-between"><StatusSelect p={p} /><Actions p={p} onDelete={() => setToDelete(p)} /></div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </AdminCard>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{toDelete?.title}&quot; will be permanently removed from the admin and the public website. Leads about it are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                if (!toDelete) return;
                startDelete(async () => {
                  notify(await deleteProperty(toDelete.id), "Property deleted", toDelete.title);
                  setToDelete(null);
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
