# Clement Portfolio

Clement Lin's personal site: tools he has built, browser games, experience, and a live snowfall map.

Live: https://clement-portfolio.a2040404.workers.dev/

![Portfolio home page](docs/screenshot.jpg)

## What's in it

- **Home** (`/`): intro, featured DJ Intake release, tool and game cards, experience and education
- **Tools** (`/tools`, `/tools/dj-intake`): download page and install notes for [DJ Intake](https://github.com/clement55688/dj-intake-app)
- **Play** (`/play`, `/playground/snake`): Neon Snake with a global top-ten board, plus links to [Clement's Arcade](https://github.com/clement55688/clement-arcade)
- **Snow Signal** (`/snow-signal`): live snowfall map built on MapLibre and Open-Meteo
- **API routes** (`/api/*`): page views, game scores, guestbook, snow data and a status endpoint; persistence through Upstash Redis

## Stack

Next.js 16 (App Router), React, TypeScript, Tailwind CSS 4, MapLibre GL, Upstash Redis. Deployed to Cloudflare Workers with `@opennextjs/cloudflare`.

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Checks (the same ones CI runs):

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Deploy

Cloudflare Workers via `@opennextjs/cloudflare`. The target is a `*.workers.dev` subdomain for the `clement-portfolio` worker (no custom domain).

1. Cloudflare account, then `pnpm exec wrangler login`.
2. Copy `.env.example` to `.env`. Set `NEXT_PUBLIC_SITE_URL` before building — Next inlines it. On the same account as the arcade that is `https://clement-portfolio.a2040404.workers.dev`. Confirm the host Wrangler prints.
3. Persistent guestbook, views, and scores need `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` as Worker secrets (`pnpm exec wrangler secret put <NAME>`). Without them, those routes use an in-memory fallback that does not last across isolates.
4. `pnpm preview` serves the Worker locally. `pnpm deploy` builds and deploys, and passes `--keep-vars` so dashboard variables stay. Do not commit `.env` or `.dev.vars`.

Optional: `NEXT_PUBLIC_BUILD_TIME` (build time) and `GIT_COMMIT_SHA` (runtime) for `/api/status`. `/api/snow` calls Open-Meteo per request; an R2 incremental cache is not configured.
