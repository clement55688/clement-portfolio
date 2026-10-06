import { Redis } from "@upstash/redis";
export const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN }) : null;
export type GuestbookEntry = { id: string; name: string; message: string; createdAt: string };
declare global { var portfolioFallback: { entries: GuestbookEntry[]; views: number; scores: Array<{ name: string; score: number; createdAt: string }>; rate: Map<string, number[]> } | undefined; }
type FallbackStore = NonNullable<typeof globalThis.portfolioFallback>;
export const fallback: FallbackStore = globalThis.portfolioFallback ??= { entries: [], views: 0, scores: [], rate: new Map<string, number[]>() };
