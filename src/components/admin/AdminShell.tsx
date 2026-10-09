"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Inbox, LayoutDashboard, LogOut, MapPin, Menu, MessageSquareQuote, ShieldCheck, Users, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { logout } from "@/app/admin/actions";
import { Toaster } from "@/components/ui/sonner";

export const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/properties", label: "Properties", icon: Building2 },
  { to: "/admin/leads", label: "Property Leads", icon: Users },
  { to: "/admin/enquiries", label: "Contact Enquiries", icon: Inbox },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
  { to: "/admin/locations", label: "Locations", icon: MapPin },
  { to: "/admin/staff", label: "Staff", icon: ShieldCheck },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname().replace(/\/$/, "");
  return (
    <div className="flex h-full flex-col">
      <div className="px-2">
        <p className="font-display text-lg text-foreground">Haley Bettle<span className="text-primary">.</span></p>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Admin console</p>
      </div>
      <nav className="mt-8 flex flex-col gap-0.5">
        {adminLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            href={to}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${pathname === to ? "!border-primary !bg-primary/5 !text-foreground font-semibold" : ""}`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
      <form action={logout} className="mt-auto">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-primary">
          <LogOut className="size-4" />Logout
        </button>
      </form>
    </div>
  );
}

/** `user` is a server-rendered slot (name, email, avatar) so the shell itself needs no session data. */
export function AdminShell({ user, children }: { user: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const path = pathname.replace(/\/$/, "");
  const title = path.endsWith("/new") ? "Add property" : path.endsWith("/edit") ? "Edit property" : ([...adminLinks].reverse().find((l) => path.startsWith(l.to))?.label ?? "Admin");
  return (
    <div className="flex min-h-screen bg-muted/40 font-sans text-foreground">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r border-border bg-background p-4 md:block">
        <SidebarNav />
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 border-r border-border bg-background p-4">
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-3 top-3 text-muted-foreground"><X className="size-5" /></button>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background px-4 md:px-8">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="text-muted-foreground md:hidden"><Menu className="size-5" /></button>
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="ml-auto">{user}</div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
        <Toaster position="top-right" richColors />
      </div>
    </div>
  );
}

export function AdminCard({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-lg border border-border bg-background ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
