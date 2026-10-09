import type { Metadata } from "next";
import { Contact } from "./contact";

export const metadata: Metadata = {
  title: "Contact Haley Bettle — REALTOR® in Sussex, NB",
  description: "Get in touch about buying, selling, or a free home evaluation. Haley answers every message personally.",
  openGraph: { title: "Contact Haley Bettle", description: "Questions about buying or selling? Let's talk." },
};

export default function Page() {
  return <Contact />;
}
