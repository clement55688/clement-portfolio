import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
const base = siteUrl();
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }, { url: `${base}/snow-signal`, lastModified: new Date(), changeFrequency: "daily", priority: .85 }, { url: `${base}/fit`, lastModified: new Date(), changeFrequency: "monthly", priority: .8 }, { url: `${base}/playground/snake`, lastModified: new Date(), changeFrequency: "monthly", priority: .7 }]; }
