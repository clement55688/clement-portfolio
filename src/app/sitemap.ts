import type { MetadataRoute } from "next";
const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clement-portfolio.vercel.app";
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }, { url: `${base}/playground/snake`, lastModified: new Date(), changeFrequency: "monthly", priority: .7 }]; }
