import { fallback, redis } from "@/lib/redis";
export async function POST() { const views = redis ? await redis.incr("portfolio:views") : ++fallback.views; return Response.json({ views, persistent: Boolean(redis) }); }
export async function GET() { const views = redis ? Number(await redis.get("portfolio:views") ?? 0) : fallback.views; return Response.json({ views, persistent: Boolean(redis) }); }
