/** In-memory fixed window. Per isolate on Workers; enough until KV is configured. */

export type RateBucket = Map<string, number[]>;

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

export function consumeRateLimit(
  store: RateBucket,
  key: string,
  now: number,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const windowStart = now - windowMs;
  if (store.size > 400) {
    for (const [bucketKey, stamps] of store) {
      const fresh = stamps.filter((stamp) => stamp > windowStart);
      if (fresh.length === 0) store.delete(bucketKey);
      else store.set(bucketKey, fresh);
    }
  }

  const fresh = (store.get(key) ?? []).filter((stamp) => stamp > windowStart);
  if (fresh.length >= limit) {
    const retryAfterMs = fresh[0] + windowMs - now;
    store.set(key, fresh);
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  fresh.push(now);
  store.set(key, fresh);
  return { ok: true, remaining: limit - fresh.length };
}

export function clientKeyFromHeaders(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf.slice(0, 64);
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first.slice(0, 64);
  return "unknown";
}
