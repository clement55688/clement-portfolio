import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";
const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });
// Still used by the Snake and Snow Signal pages.
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400" });
const description = "Software engineer building tools people actually use — including DJ Intake, a local download queue for DJs on macOS.";
export const metadata: Metadata = { metadataBase: new URL(siteUrl()), title: { default: "Clement Lin — Software Engineer", template: "%s — Clement Lin" }, description, keywords: ["Clement Lin", "software engineer", "DJ Intake", "macOS", "Next.js"], authors: [{ name: "Clement Lin" }], openGraph: { title: "Clement Lin — Software Engineer", description, type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Clement Lin — Software Engineer" }] }, twitter: { card: "summary_large_image", title: "Clement Lin — Software Engineer", description, images: ["/opengraph-image"] } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" data-scroll-behavior="smooth"><body className={`${sans.variable} ${mono.variable} ${serif.variable}`}>{children}</body></html>; }
