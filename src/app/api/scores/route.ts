import { fallback, redis } from "@/lib/redis";
import { parseScoreSubmission } from "@/lib/scores";

type Score = { name: string; score: number; createdAt: string };

export async function GET() {
  const scores = redis
    ? await redis.zrange<Score[]>("portfolio:scores", 0, 9, { rev: true })
    : [...fallback.scores].sort((a, b) => b.score - a.score).slice(0, 10);
  return Response.json({ scores, persistent: Boolean(redis) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parseScoreSubmission(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
  const entry: Score = { ...parsed.value, createdAt: new Date().toISOString() };
  if (redis) await redis.zadd("portfolio:scores", { score: entry.score, member: entry });
  else fallback.scores.push(entry);
  return Response.json({ entry, persistent: Boolean(redis) }, { status: 201 });
}
