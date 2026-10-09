import Link from "next/link";
import Image from "next/image";
import { Building2, CheckCircle2, Inbox, Tag, Users } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminShell";
import { fmtDate, formatCAD } from "@/lib/data";
import { adminGetEnquiries, adminGetLeads, adminGetProperties } from "@/lib/queries";
import { STATUS_LABEL } from "@/lib/types";
import { isLocal } from "@/lib/utils";

export async function Dashboard() {
  const [properties, leads, enquiries] = await Promise.all([adminGetProperties(), adminGetLeads(), adminGetEnquiries()]);

  const stats = [
    { label: "Total properties", value: properties.length, icon: Building2 },
    { label: "Active listings", value: properties.filter((p) => p.status === "For Sale").length, icon: Tag },
    { label: "Sold properties", value: properties.filter((p) => p.status === "Sold").length, icon: CheckCircle2 },
    { label: "Property leads", value: leads.length, icon: Users },
    { label: "Contact enquiries", value: enquiries.length, icon: Inbox },
  ];

  const recent = [
    ...leads.map((l) => ({ id: "l" + l.id, kind: "Property lead" as const, name: l.name, date: l.date, about: l.propertyTitle })),
    ...enquiries.map((e) => ({ id: "e" + e.id, kind: "Contact enquiry" as const, name: e.name, date: e.date, about: e.subject })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening across your listings.</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <p className="text-xs font-medium">{label}</p>
              <Icon className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <AdminCard title="Recent enquiries" className="xl:col-span-3">
          {recent.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No enquiries yet.</p> : (
            <ul className="divide-y divide-border">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.about}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${r.kind === "Property lead" ? "bg-primary/10 text-primary" : "bg-muted text-foreground"}`}><span className="sm:hidden">{r.kind === "Property lead" ? "Lead" : "Contact"}</span><span className="hidden sm:inline">{r.kind}</span></span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{fmtDate(r.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard title="Recent properties" className="xl:col-span-2" action={<Link href="/admin/properties" className="text-xs font-semibold text-primary hover:underline">View all</Link>}>
          {properties.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No properties yet. <Link href="/admin/properties/new" className="font-semibold text-primary hover:underline">Add your first listing</Link></p>
          ) : (
            <ul className="divide-y divide-border">
              {properties.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  {p.image ? <Image src={p.image} alt={p.title} width={48} height={48} unoptimized={!isLocal(p.image)} className="size-12 shrink-0 rounded-md object-cover" /> : <div className="size-12 shrink-0 rounded-md bg-muted" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.city}, {p.province} · {formatCAD(p.price)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.status === "For Sale" ? "bg-primary/10 text-primary" : p.status === "Pending" ? "bg-warning/20 text-foreground" : p.status === "Sold" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>{STATUS_LABEL[p.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
