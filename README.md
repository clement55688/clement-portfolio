# Clement Portfolio

An experimental, scroll-driven portfolio built with Next.js 16, TypeScript, Tailwind CSS 4, React Three Fiber, Lenis, and Motion.

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Import `clement55688/clement-portfolio` in Vercel.
2. Keep the detected Next.js build settings—no custom configuration is needed.
3. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for persistent guestbook, views, and leaderboard data.
4. Add `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` to activate Snow Signal's interactive 3D terrain map.
5. Set `NEXT_PUBLIC_SITE_URL` to the production URL for canonical sitemap and social metadata.
6. Deploy. Without Redis variables, data features use an in-memory fallback; without Mapbox, Snow Signal shows its designed terrain placeholder and live forecast list.
