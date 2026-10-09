"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition, type FormEvent } from "react";
import { ArrowRight, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteChrome";
import { PageHero } from "@/components/site/PageHero";
import { agent } from "@/lib/data";
import { submitEnquiry, type EnquiryField } from "@/app/actions";
const lifestyle = "/assets/lifestyle.jpg";
const agentPhoto = "/haley.png";

const ENQUIRY_TYPES = ["Buying", "Selling", "General Question", "Other"] as const;

type Errors = Partial<Record<EnquiryField | "form", string>>;

export function Contact() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", phone: "", type: "Buying", message: "" });
  const [pending, start] = useTransition();

  const set = (k: keyof typeof values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: Errors = {};
    if (!values.name.trim()) errs.name = "Please enter your name.";
    if (!values.email.trim()) errs.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errs.email = "Please enter a valid email address.";
    if (!values.message.trim()) errs.message = "Please include a short message.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const fd = new FormData(e.currentTarget);
    for (const [k, v] of Object.entries(values)) fd.set(k, v);
    start(async () => {
      const res = await submitEnquiry(fd);
      if (!res.ok) return setErrors(res.fieldErrors ?? { form: res.error });
      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const field = (invalid: boolean) => `field ${invalid ? "border-destructive focus-visible:ring-destructive" : ""}`;

  return (
    <SiteLayout overlay>
      <PageHero image={lifestyle} alt="Bright, beautifully staged Canadian home interior" eyebrow="Contact" title="Let's find your way home.">
        Whether you&apos;re buying, selling, or simply curious about the market, Haley answers every message personally — usually within one business day.
      </PageHero>

      {/* Split: form + agent panel */}
      <section className="container-x grid gap-14 py-20 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {sent ? (
            <div className="flex h-full flex-col items-start justify-center bg-accent p-10">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><Sparkles className="size-6" /></span>
              <h2 className="mt-6 text-3xl">Thank you, {values.name.split(" ")[0]}.</h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Your message has been received. Haley will be in touch at {values.email} shortly.
              </p>
              <Link href="/properties" className="btn-primary mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80">
                Browse properties while you wait <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-3xl">Send a message</h2>
              <p className="mt-2 text-muted-foreground">Fields marked with an asterisk are required.</p>
              <form onSubmit={submit} noValidate className="mt-8 grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="mb-2 block text-sm font-semibold">Full name *</label>
                    <input id="c-name" value={values.name} onChange={set("name")} placeholder="Jordan MacKenzie" className={field(!!errors.name)} />
                    {errors.name && <p className="mt-1.5 text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-email" className="mb-2 block text-sm font-semibold">Email address *</label>
                    <input id="c-email" type="email" value={values.email} onChange={set("email")} placeholder="you@example.ca" className={field(!!errors.email)} />
                    {errors.email && <p className="mt-1.5 text-sm text-destructive">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-phone" className="mb-2 block text-sm font-semibold">Phone <span className="font-normal text-muted-foreground">(optional)</span></label>
                    <input id="c-phone" type="tel" value={values.phone} onChange={set("phone")} placeholder="(416) 555-0123" className="field" />
                  </div>
                  <div>
                    <label htmlFor="c-type" className="mb-2 block text-sm font-semibold">Enquiry type</label>
                    <select id="c-type" value={values.type} onChange={set("type")} className="field">
                      {ENQUIRY_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="c-message" className="mb-2 block text-sm font-semibold">Message *</label>
                  <textarea id="c-message" rows={6} value={values.message} onChange={set("message")} placeholder="Tell Haley a little about what you're looking for…" className={field(!!errors.message)} />
                  {errors.message && <p className="mt-1.5 text-sm text-destructive">{errors.message}</p>}
                </div>
                {/* Honeypot: hidden from people, filled in by bots. */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                {errors.form && <p role="alert" className="text-sm text-destructive">{errors.form}</p>}
                <button type="submit" disabled={pending} className="w-fit rounded-sm bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
                  {pending ? "Sending…" : "Send message"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Agent panel */}
        <aside className="lg:col-span-2">
          <div className="overflow-hidden bg-charcoal text-charcoal-foreground">
            <Image src={agentPhoto} alt="Haley Bettle, Canadian REALTOR®" width={962} height={1634} sizes="(min-width: 1024px) 40vw, 100vw" className="h-80 w-full object-cover object-[center_20%]" />
            <div className="p-8">
              <p className="eyebrow text-charcoal-foreground/60">Your agent</p>
              <h3 className="mt-2 text-2xl">{agent.name}</h3>
              <p className="text-sm text-charcoal-foreground/70">{agent.title} · {agent.brokerage}</p>
              <ul className="mt-6 space-y-4 text-sm">
                <li><a href={agent.phoneHref} className="flex items-center gap-3 hover:text-charcoal-foreground"><Phone className="size-4 shrink-0 text-primary" />{agent.phone}</a></li>
                <li><a href={`mailto:${agent.email}`} className="flex items-center gap-3 hover:text-charcoal-foreground"><Mail className="size-4 shrink-0 text-primary" />{agent.email}</a></li>
                <li className="flex items-start gap-3"><MapPin className="size-4 shrink-0 translate-y-0.5 text-primary" /><span>Based in {agent.regionLong}, serving Sussex and the surrounding communities since {agent.established}.</span></li>
              </ul>
              <div className="mt-8 border-t border-charcoal-foreground/10 pt-6 text-sm text-charcoal-foreground/60">
                <p className="eyebrow mb-3 text-charcoal-foreground/60">Follow along</p>
                <div className="flex gap-5">
                  <a href="#" className="hover:text-charcoal-foreground">Instagram</a>
                  <a href="#" className="hover:text-charcoal-foreground">Facebook</a>
                  <a href="#" className="hover:text-charcoal-foreground">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Final CTA */}
      <section className="container-x pb-24">
        <div className="flex flex-col items-center gap-6 bg-accent px-8 py-14 text-center">
          <h2 className="max-w-xl text-4xl">Ready to see what&apos;s out there?</h2>
          <p className="max-w-lg text-muted-foreground">Every message is a conversation, never a commitment. Start by browsing the current listings.</p>
          <Link href="/properties" className="btn-primary inline-flex items-center gap-2 rounded-sm bg-primary px-8 py-4 font-semibold text-primary-foreground hover:bg-primary/90">
            Explore properties <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
