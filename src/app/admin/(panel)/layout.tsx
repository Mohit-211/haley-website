import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CurrentUser } from "@/components/admin/CurrentUser";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    // The shell reads the pathname (runtime data on dynamic routes), so it streams behind a boundary.
    <Suspense fallback={<div className="min-h-screen bg-muted/40" />}>
      <AdminShell user={<Suspense fallback={<div className="size-9 animate-pulse rounded-full bg-muted" />}><CurrentUser /></Suspense>}>
        {children}
      </AdminShell>
    </Suspense>
  );
}
