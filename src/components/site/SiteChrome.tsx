"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { agent } from "@/lib/data";

const nav = [
  { to: "/", label: "Home" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo({ light }: { light?: boolean | undefined }) {
  return (
    <Link href="/" className={`flex items-baseline gap-1 font-display text-2xl ${light ? "text-charcoal-foreground" : "text-foreground"}`}>
      Haley Bettle<span className="text-primary">.</span>
    </Link>
  );
}

const subscribeScroll = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};

export function Header({ overlay }: { overlay?: boolean | undefined }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/"));
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);

  // Lighter glass while sitting on top of a hero image; denser once scrolled or on pages without one.
  const solid = scrolled || open || !overlay;
  return (
    <header className={`fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 ${solid ? "border-white/5 bg-charcoal/90" : "border-white/10 bg-black/30"}`}>
      <div className="container-x flex h-20 items-center justify-between">
        <Logo light />
        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((n) => (
            <Link key={n.to} href={n.to}
              className={`text-sm font-semibold transition-colors ${isActive(n.to) ? "text-primary" : "text-charcoal-foreground/85 hover:text-charcoal-foreground"}`}>
              {n.label}
            </Link>
          ))}
          <Link href="/properties" className="btn-primary rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Explore Properties</Link>
        </nav>
        <button aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)} className="text-charcoal-foreground md:hidden">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 md:hidden">
          <div className="container-x flex flex-col py-4">
            {nav.map((n) => (
              <Link key={n.to} href={n.to} onClick={() => setOpen(false)} className={`py-3 font-semibold ${isActive(n.to) ? "text-primary" : "text-charcoal-foreground"}`}>{n.label}</Link>
            ))}
            <Link href="/properties" onClick={() => setOpen(false)} className="mt-2 rounded-sm bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90">Explore Properties</Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-charcoal text-charcoal-foreground">
      <div className="container-x grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm text-charcoal-foreground/65">Guiding families home with clarity, care, and expert negotiation in {agent.regionLong} since {agent.established}.</p>
          <div className="mt-6 flex gap-5 text-sm text-charcoal-foreground/60">
            <a href="#" aria-label="Instagram" className="hover:text-charcoal-foreground">Instagram</a>
            <a href="#" aria-label="Facebook" className="hover:text-charcoal-foreground">Facebook</a>
            <a href="#" aria-label="LinkedIn" className="hover:text-charcoal-foreground">LinkedIn</a>
          </div>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2 text-charcoal-foreground/75">
            <li><Link href="/properties">Properties</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/admin/login">Admin</Link></li>
          </ul>
        </div>
        <div className="text-sm text-charcoal-foreground/75">
          <p className="eyebrow mb-4">Contact</p>
          <p><a href={agent.phoneHref} className="hover:text-charcoal-foreground">{agent.phone}</a></p><p><a href={`mailto:${agent.email}`} className="hover:text-charcoal-foreground">{agent.email}</a></p><p className="mt-2">{agent.regionLong}</p><p className="mt-2 text-charcoal-foreground/55">{agent.brokerage}</p>
        </div>
      </div>
      <div className="border-t border-charcoal-foreground/10 py-6 text-center text-xs text-charcoal-foreground/50">© 2026 Haley Bettle. All rights reserved.</div>
    </footer>
  );
}

export function SiteLayout({ children, overlay }: { children: ReactNode; overlay?: boolean | undefined }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header overlay={overlay} />
      {/* The header is fixed; pages without a full-bleed hero need room for it. */}
      <main className={`flex-1 ${overlay ? "" : "pt-20"}`}>{children}</main>
      <Footer />
    </div>
  );
}
