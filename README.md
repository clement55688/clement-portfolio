# Clement Portfolio

An experimental, scroll-driven portfolio built with Next.js 16, TypeScript, Tailwind CSS 4, React Three Fiber, Lenis, and Motion.

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Cloudflare Workers via `@opennextjs/cloudflare`. The target is a `*.workers.dev` subdomain for the `clement-portfolio` worker (no custom domain).

1. Cloudflare account, then `pnpm exec wrangler login`.
2. Copy `.env.example` to `.env`. Set `NEXT_PUBLIC_SITE_URL` before building — Next inlines it. On the same account as the arcade that is `https://clement-portfolio.a2040404.workers.dev`. Confirm the host Wrangler prints.
3. Persistent guestbook, views, and scores need `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` as Worker secrets (`pnpm exec wrangler secret put <NAME>`). Without them, those routes use an in-memory fallback that does not last across isolates.
4. `pnpm preview` serves the Worker locally. `pnpm deploy` builds and deploys, and passes `--keep-vars` so dashboard variables stay. Do not commit `.env` or `.dev.vars`.

Optional: `NEXT_PUBLIC_BUILD_TIME` (build time) and `GIT_COMMIT_SHA` (runtime) for `/api/status`. `/api/snow` calls Open-Meteo per request; an R2 incremental cache is not configured.
