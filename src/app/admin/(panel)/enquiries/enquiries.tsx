"use client";

import { fmtDate, RecordInbox } from "@/components/admin/RecordInbox";
import { deleteEnquiry, setEnquiryStatus } from "@/app/admin/actions";
import { ENQUIRY_STATUSES, type Enquiry } from "@/lib/types";

const typeOf = (e: Enquiry) => e.subject || "General";

export function Enquiries({ enquiries }: { enquiries: Enquiry[] }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">General messages sent from the Contact page. Property-specific enquiries live under Property Leads.</p>
      <RecordInbox
        noun="enquiry" plural="enquiries"
        records={enquiries}
        statuses={ENQUIRY_STATUSES}
        facet={{ label: "enquiry type", get: typeOf }}
        searchExtra={typeOf}
        columns={[
          { header: "Type", cell: (e) => <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{typeOf(e)}</span>, className: "whitespace-nowrap" },
          { header: "Date", cell: (e) => fmtDate(e.date), className: "text-muted-foreground whitespace-nowrap" },
        ]}
        mobileMeta={typeOf}
        detail={(e) => [
          { label: "Enquiry type", value: typeOf(e) },
          { label: "Submitted", value: fmtDate(e.date) },
        ]}
        onStatus={setEnquiryStatus}
        onDelete={deleteEnquiry}
        emptyHint="Messages from the Contact page will appear here."
      />
    </div>
  );
}
