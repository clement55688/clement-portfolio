# Clement Portfolio

An experimental, scroll-driven portfolio built with Next.js 16, TypeScript, Tailwind CSS 4, React Three Fiber, Lenis, and Motion.

## Development

The separate mini-game arcade lives in `clement-arcade/`. For Windows + VS Code setup,
Cline free-provider configuration, commands and deployment details, see
[Local development](docs/LOCAL_DEVELOPMENT.md) and [AI development](docs/AI_DEVELOPMENT.md).
Run `pnpm run setup:local` to install both apps, then `pnpm run dev:games` to play
the arcade at http://localhost:4173.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Import `clement55688/clement-portfolio` in Vercel.
2. Keep the detected Next.js build settings—no custom configuration is needed.
3. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for persistent guestbook, views, and leaderboard data.
4. Set `NEXT_PUBLIC_SITE_URL` to the production URL for canonical sitemap and social metadata.
5. Deploy. Snow Signal uses MapLibre with OpenFreeMap and requires no map token. Without Redis variables, data features use an in-memory fallback.
