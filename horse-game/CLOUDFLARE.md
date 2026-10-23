# GitHub → Cloudflare deployment

The repository is prepared for Cloudflare Workers Builds. The Cloudflare account and `hoof-leaderboard` D1 database are configured in `wrangler.jsonc`. GitHub authorization, project creation, and the first build are still required; this file is not confirmation of a live Cloudflare deployment.

Use these project settings:

| Setting | Value |
| --- | --- |
| GitHub repository | `clement55688/clement-portfolio` |
| Production branch | `codex/hoof-game` |
| Root directory | `horse-game` |
| Worker name | `hoof-game` |
| Build command | `npm run check` |
| Deploy command | `npm run deploy:cloudflare` |
| Build watch path | `horse-game/**` |
| Node version | `24` (also declared in `.node-version`) |
| Package manager | `pnpm@11.19.0` |

The database UUID and account ID in `wrangler.jsonc` were read from the signed-in Cloudflare dashboard. These identifiers are not secrets. No API token belongs in source control. Finish connecting the repository through Workers & Pages, then use the settings above for the first build.

The deployment command applies the SQL migrations in `drizzle/` before publishing the Worker. It refuses to deploy without a configured database, so the leaderboard cannot silently launch without storage. The Cloudflare build must pass the game and API checks before deployment. Turn off automatic deployments from non-production branches unless separate preview resources are configured.

Each push to the production branch will then update the Worker URL supplied by Cloudflare. A custom domain can be attached afterward. The current Sites URL remains available independently; the Sites-managed database is separate from the Cloudflare account's database. Existing scores need an explicit migration if they should appear on the new host.

For local development, the existing `npm run dev` command still uses the local SQLite database. To validate or deploy through Wrangler, install game dependencies first with `npm install` (or the project's lockfile package manager).

References:

- https://developers.cloudflare.com/workers/ci-cd/builds/
- https://developers.cloudflare.com/d1/reference/migrations/
