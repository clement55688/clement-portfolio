<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repository map and local development

This is the existing Clement portfolio plus Clement's Gaming Room. Preserve the
architecture, assets, game logic, routes and Git history unless the task requires a change.

- Root: Next.js 16.3.8 / React 19 / TypeScript / Tailwind 4 portfolio. App routes:
  `src/app/`; components: `src/components/`; helpers: `src/lib/`; assets: `public/`.
  Includes `/playground/snake`, `/playground/leaderboard`, `/snow-signal` and API routes.
- `clement-arcade/`: separate plain HTML/CSS/JS arcade, Node local server and Cloudflare Worker.
  **`clement-arcade/dist/` is tracked source, not disposable build output.** Only
  `dist/server/` and `dist/.openai/` are generated. Landing page: `dist/index.html`.
- Game routes under `clement-arcade/dist/`: `hoof/`, `catvolution/`, `frog/`,
  `cabin-chaos/` (Remembrance Flight), `ten-seconds/`, `sneaky-scratch/`,
  `mochi-drop/` (Suika-style cat merging; separate from Catvolution/2048).
  Mochi Drop uses vendored Matter.js, `physics.mjs`, and its own local save keys;
  see that game's README and `tests/mochi-drop.test.mjs` before editing.
- Server: `clement-arcade/server.mjs`; local SQLite: `local-db.mjs`; worker/API:
  `worker/index.js`; D1 migrations: `drizzle/`; tests: `tests/*.test.mjs`.
- Use Node 24 LTS and pnpm 11.19.0. The two packages have separate lockfiles;
  do not merge them, change package managers, or update dependencies incidentally.

## Commands (from repository root)

- Install both: `pnpm run setup:local` (frozen lockfiles).
- Games: `pnpm run dev:games` -> http://localhost:4173 (refresh after edits).
- Portfolio: `pnpm dev` -> http://localhost:3000 (Next hot reload).
- Games build/tests: `pnpm run test:games` (build first, then Node tests).
- Portfolio build: `pnpm build`; repository lint: `pnpm lint`.
- Everything: `pnpm run check:all`. No separate portfolio unit-test suite exists.
- Do not change game behavior just to pass a check. Report existing failures separately.

## Editing and context

Follow existing conventions: TypeScript/React in the portfolio, ES modules and
plain JS/CSS in the arcade. Keep edits scoped to the requested game. Inspect that
game and its tests before wider searches. Do not reformat unrelated minified or
compact legacy files. Keep mobile touch and keyboard input, replay/scoring APIs,
accessibility and existing routes working. Read installed Next docs before Next changes.

Exclude dependencies, generated files, local databases, secrets, and scratch copies
(`tmp/`, `work/`) from AI context. `.clineignore` is a context aid, not a security
boundary. Do not print keys or place them in source, prompts or VS Code workspace settings.
Use Cline's provider key fields. Review file edits and terminal commands; keep YOLO
and command auto-approval off. Instructions do not enforce editor approval toggles.

## Git and deployment

Origin: `https://github.com/clement55688/clement-portfolio.git`.
Current arcade production branch: `codex/hoof-game`. Root portfolio deploys via the
existing Vercel integration. Arcade deploys via Cloudflare Workers Builds, root
`clement-arcade`, with `npm run check` then `npm run deploy:cloudflare`.
`.github/workflows/hoof-pages.yml` runs checks; it does not publish the Worker.
See `clement-arcade/CLOUDFLARE.md`. Do not change remotes, branch wiring, workflow or
Wrangler settings without a deployment task. Deploy applies remote D1 migrations;
never run it as a local verification step. Never force-push or discard user changes.

Start here for handoff: `docs/LOCAL_DEVELOPMENT.md`, `docs/AI_DEVELOPMENT.md`.
