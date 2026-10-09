import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], axes: ["opsz"], variable: "--font-fraunces" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  // Absolute base for Open Graph / Twitter image URLs (set SITE_URL in production).
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: "Haley Bettle — Real Estate in Sussex, NB",
  description: "Buy and sell homes in Sussex, New Brunswick with Haley Bettle, REALTOR® with Royal LePage Atlantic.",
  openGraph: { type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
