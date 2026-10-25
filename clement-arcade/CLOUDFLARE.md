# GitHub → Cloudflare deployment

Cloudflare Workers Builds is connected to this GitHub repository. HOOF is live at https://hoof-game.a2040404.workers.dev with the `hoof-leaderboard` D1 database connected. The first GitHub-triggered production build succeeded, and both the game and leaderboard endpoint returned HTTP 200.

Use these project settings:

| Setting | Value |
| --- | --- |
| GitHub repository | `clement55688/clement-portfolio` |
| Production branch | `arcade/hoof-game` |
| Root directory | `clement-arcade` |
| Worker name | `hoof-game` |
| Build command | `npm run check` |
| Deploy command | `npm run deploy:cloudflare` |
| Build watch path | `clement-arcade/**` |
| Node version | `24` (also declared in `.node-version`) |
| Package manager | `pnpm@11.19.0` |

The database UUID and account ID in `wrangler.jsonc` were read from the signed-in Cloudflare dashboard. These identifiers are not secrets. The deployment token is managed by Cloudflare, not stored in source control. Preview builds are disabled so they cannot modify the production leaderboard.

The deployment command applies the SQL migrations in `drizzle/` before publishing the Worker. It refuses to deploy without a configured database, so the leaderboard cannot silently launch without storage. The Cloudflare build must pass the game and API checks before deployment. Turn off automatic deployments from non-production branches unless separate preview resources are configured.

Each push to the production branch will then update the Worker URL supplied by Cloudflare. A custom domain can be attached afterward. The current Sites URL remains available independently; the Sites-managed database is separate from the Cloudflare account's database. Existing scores need an explicit migration if they should appear on the new host.

For local development, the existing `npm run dev` command still uses the local SQLite database. To validate or deploy through Wrangler, install game dependencies first with `npm install` (or the project's lockfile package manager).

References:

- https://developers.cloudflare.com/workers/ci-cd/builds/
- https://developers.cloudflare.com/d1/reference/migrations/
