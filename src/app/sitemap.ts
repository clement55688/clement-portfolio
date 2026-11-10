import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
const base = siteUrl();
const routes: [string, MetadataRoute.Sitemap[number]["changeFrequency"], number][] = [
  ["", "monthly", 1],
  ["/tools", "monthly", 0.9],
  ["/tools/dj-intake", "weekly", 0.9],
  ["/play", "monthly", 0.75],
  ["/snow-signal", "daily", 0.7],
  ["/playground/snake", "monthly", 0.6],
];
export default function sitemap(): MetadataRoute.Sitemap { return routes.map(([path, changeFrequency, priority]) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency, priority })); }
