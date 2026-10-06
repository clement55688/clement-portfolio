import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Serif } from "next/font/google";
import "./globals.css";
const sans = Space_Grotesk({ variable: "--font-sans", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400" });
export const metadata: Metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://clement-portfolio.vercel.app"), title: { default: "Clement Lin — Creative Developer", template: "%s — Clement Lin" }, description: "Creative developer crafting expressive, resilient digital experiences at the intersection of design and engineering.", openGraph: { title: "Clement Lin — Creative Developer", description: "Digital experiences with clarity, character, and just enough weird.", type: "website" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={`${sans.variable} ${serif.variable}`}>{children}</body></html>; }
