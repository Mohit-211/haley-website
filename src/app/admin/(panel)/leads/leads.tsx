"use client";

import Link from "next/link";
import { deleteLead, setLeadStatus } from "@/app/admin/actions";
import { fmtDate, RecordInbox } from "@/components/admin/RecordInbox";
import { LEAD_STATUSES, type Lead } from "@/lib/types";

const titleOf = (l: Lead) => l.propertyTitle;

export function Leads({ leads, liveIds }: { leads: Lead[]; liveIds: number[] }) {
  const propLink = (l: Lead) =>
    l.propertyId !== null && liveIds.includes(l.propertyId) ? (
      <Link href={`/admin/properties/${l.propertyId}/edit`} className="font-medium hover:text-primary">{l.propertyTitle}</Link>
    ) : <span className="text-muted-foreground">{l.propertyTitle} <span className="text-xs">(removed)</span></span>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Enquiries sent from individual property pages. General messages live under Contact Enquiries.</p>
      <RecordInbox
        noun="lead" plural="leads"
        records={leads}
        statuses={LEAD_STATUSES}
        facet={{ label: "property", get: titleOf }}
        searchExtra={titleOf}
        columns={[
          { header: "Property", cell: propLink },
          { header: "Preferred", cell: (l) => l.method ?? "—", className: "text-muted-foreground whitespace-nowrap" },
          { header: "Date", cell: (l) => fmtDate(l.date), className: "text-muted-foreground whitespace-nowrap" },
        ]}
        mobileMeta={titleOf}
        detail={(l) => [
          { label: "Property", value: propLink(l) },
          { label: "Preferred contact", value: l.method ?? "—" },
          { label: "Submitted", value: fmtDate(l.date) },
        ]}
        onStatus={setLeadStatus}
        onDelete={deleteLead}
        emptyHint="Leads appear here when visitors enquire about a specific property."
      />
    </div>
  );
}
