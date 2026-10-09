"use client";

import { Eye, Mail, Phone, Search, Trash2, X } from "lucide-react";
import { Fragment, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AdminCard } from "@/components/admin/AdminShell";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fmtDate } from "@/lib/data";
import type { ActionResult } from "@/lib/types";

type Base = { id: number; name: string; email: string; phone: string; message: string; date: string; status: string };

export { fmtDate };

const STATUS_CLS: Record<string, string> = {
  New: "bg-primary/10 text-primary",
  Contacted: "bg-warning/20 text-foreground",
  Qualified: "bg-success/15 text-success",
  Closed: "bg-muted text-muted-foreground",
};

export function StatusPill({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLS[status] ?? "bg-muted"}`}>{status}</span>;
}

function StatusSelect<S extends string>({ value, statuses, onChange, label }: { value: S; statuses: readonly S[]; onChange: (s: S) => void; label: string }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value as S)} className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${STATUS_CLS[value] ?? ""}`}>
      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

export type Column<T> = { header: string; cell: (r: T) => ReactNode; className?: string };

export function RecordInbox<T extends Base, S extends T["status"] & string>(props: {
  noun: string;
  plural: string;
  records: T[];
  statuses: readonly S[];
  /** Label + value used for the secondary filter dropdown (property or enquiry type). */
  facet: { label: string; get: (r: T) => string };
  /** Extra text searched alongside name/email/phone/message. */
  searchExtra: (r: T) => string;
  columns: Column<T>[];
  /** Short secondary line on mobile cards. */
  mobileMeta: (r: T) => ReactNode;
  detail: (r: T) => { label: string; value: ReactNode }[];
  onStatus: (id: number, s: S) => Promise<ActionResult>;
  onDelete: (id: number) => Promise<ActionResult>;
  emptyHint: ReactNode;
}) {
  const { records, statuses, noun, plural } = props;
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | S>("all");
  const [facet, setFacet] = useState("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const [delId, setDelId] = useState<number | null>(null);

  const facetValues = useMemo(() => Array.from(new Set(records.map(props.facet.get))).sort(), [records, props.facet]);
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return records
      .filter((r) => (status === "all" || r.status === status) && (facet === "all" || props.facet.get(r) === facet))
      .filter((r) => !t || `${r.name} ${r.email} ${r.phone} ${r.message} ${props.searchExtra(r)}`.toLowerCase().includes(t))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records, q, status, facet, props]);

  const open = records.find((r) => r.id === openId);
  const del = records.find((r) => r.id === delId);
  const changeStatus = async (r: T, s: S) => {
    const res = await props.onStatus(r.id, s);
    if (res.ok) toast.success(`Marked as ${s}`, { description: r.name });
    else toast.error(res.error);
  };
  const filtered = q || status !== "all" || facet !== "all";

  const btn = "flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground";
  const rowActions = (r: T) => (
    <div className="flex justify-end gap-1">
      <button onClick={() => setOpenId(r.id)} className={btn} aria-label="View details" title="View details"><Eye className="size-4" /></button>
      <button onClick={() => setDelId(r.id)} className={`${btn} hover:!text-destructive`} aria-label="Delete" title="Delete"><Trash2 className="size-4" /></button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statuses.map((s) => (
          <button key={s} onClick={() => setStatus(status === s ? "all" : s)} className={`rounded-lg border bg-background p-4 text-left transition-colors ${status === s ? "border-primary" : "border-border hover:border-foreground/30"}`}>
            <StatusPill status={s} />
            <p className="mt-2 text-2xl font-semibold">{records.filter((r) => r.status === s).length}</p>
          </button>
        ))}
      </div>

      <AdminCard>
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${plural} by name, email, phone or message`} className="field !pl-9" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="field lg:w-40" aria-label="Filter by status">
            <option value="all">All statuses</option>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={facet} onChange={(e) => setFacet(e.target.value)} className="field lg:w-56" aria-label={`Filter by ${props.facet.label}`}>
            <option value="all">All {props.facet.label}s</option>
            {facetValues.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>

        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium">{filtered ? `No ${plural} match your filters` : `No ${plural} yet`}</p>
            <p className="mt-1 text-sm text-muted-foreground">{filtered ? "Try a different search or status." : props.emptyHint}</p>
            {filtered && <button onClick={() => { setQ(""); setStatus("all"); setFacet("all"); }} className="mt-3 text-sm font-semibold text-primary hover:underline">Clear filters</button>}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 font-medium">Contact</th>
                    {props.columns.map((c) => <th key={c.header} className="px-4 py-3 font-medium">{c.header}</th>)}
                    <th className="px-4 py-3 font-medium">Message</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r) => (
                    <tr key={r.id} className="align-top hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <button onClick={() => setOpenId(r.id)} className="text-left font-medium hover:text-primary">{r.name}</button>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                        <p className="text-xs text-muted-foreground">{r.phone}</p>
                      </td>
                      {props.columns.map((c) => <td key={c.header} className={`px-4 py-3 ${c.className ?? ""}`}>{c.cell(r)}</td>)}
                      <td className="max-w-xs px-4 py-3 text-muted-foreground"><p className="line-clamp-2">{r.message}</p></td>
                      <td className="px-4 py-3"><StatusSelect label={`Status for ${r.name}`} value={r.status as S} statuses={statuses} onChange={(s) => changeStatus(r, s)} /></td>
                      <td className="px-4 py-3">{rowActions(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-border lg:hidden">
              {rows.map((r) => (
                <li key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={() => setOpenId(r.id)} className="min-w-0 text-left">
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{props.mobileMeta(r)} · {fmtDate(r.date)}</p>
                    </button>
                    <StatusPill status={r.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <StatusSelect label={`Status for ${r.name}`} value={r.status as S} statuses={statuses} onChange={(s) => changeStatus(r, s)} />
                    {rowActions(r)}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </AdminCard>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`${noun} details`}>
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpenId(null)} />
          <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-background">
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{noun} · {fmtDate(open.date)}</p>
                <h2 className="mt-1 text-lg font-semibold">{open.name}</h2>
              </div>
              <button onClick={() => setOpenId(null)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>
            <div className="space-y-5 p-5 text-sm">
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${open.email}`} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 hover:bg-muted"><Mail className="size-3.5" />{open.email}</a>
                <a href={`tel:${open.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 hover:bg-muted"><Phone className="size-3.5" />{open.phone}</a>
              </div>
              <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-2">
                {props.detail(open).map((d) => (<Fragment key={d.label}><dt className="text-muted-foreground">{d.label}</dt><dd>{d.value}</dd></Fragment>))}
                <dt className="text-muted-foreground">Status</dt>
                <dd><StatusSelect label="Status" value={open.status as S} statuses={statuses} onChange={(s) => changeStatus(open, s)} /></dd>
              </dl>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Message</p>
                <p className="mt-2 whitespace-pre-line rounded-md bg-muted/60 p-4 leading-relaxed">{open.message || "—"}</p>
              </div>
            </div>
            <div className="mt-auto border-t border-border p-5">
              <button onClick={() => setDelId(open.id)} className="inline-flex items-center gap-2 text-sm font-medium text-destructive hover:underline"><Trash2 className="size-4" />Delete {noun}</button>
            </div>
          </aside>
        </div>
      )}

      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {noun}?</AlertDialogTitle>
            <AlertDialogDescription>The {noun} from {del?.name} will be permanently deleted. This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!del) return;
                const res = await props.onDelete(del.id);
                if (!res.ok) return void toast.error(res.error);
                toast.success(`${noun[0]!.toUpperCase()}${noun.slice(1)} deleted`, { description: del.name });
                if (openId === del.id) setOpenId(null);
                setDelId(null);
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
