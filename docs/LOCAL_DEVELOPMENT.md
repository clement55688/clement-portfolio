# Local VS Code handoff

This is the **same repository**, not a replacement. The code is already on this
Windows PC at `C:\Users\Clement\Documents\ChatGPT\github profolio`.
Local development does not require Codex or a Codex subscription.

## Start here on this PC

Close and reopen VS Code once to pick up the newly installed tools. Open a fresh
PowerShell window and run:

```powershell
Set-Location 'C:\Users\Clement\Documents\ChatGPT\github profolio'
code.cmd .
pnpm.cmd run dev:games
```

Open http://localhost:4173/ or http://localhost:4173/catvolution/. Stop with Ctrl+C.
The plain JS arcade needs a browser refresh after saving. The portfolio has Next
hot reload; use a **second terminal** for it:

```powershell
pnpm.cmd run dev
```

Open http://localhost:3000/. In VS Code, **Terminal > Run Task** offers launch,
install, lint, build and test tasks. Tasks never publish or migrate production.
Use `.cmd` commands in PowerShell if script execution policy blocks `pnpm.ps1`;
no execution-policy change is needed.

If the current terminal still sees Codex's bundled tools, refresh just its PATH:

```powershell
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
Get-Command git.exe,node.exe,pnpm.cmd,code.cmd
node.exe --version
pnpm.cmd --version
git.exe --version
```

## What was actually installed and verified (2026-10-23)

| Tool | Installed location / version |
| --- | --- |
| Git for Windows | `C:\Program Files\Git\cmd\git.exe`, 2.55.0.windows.5 |
| Node.js LTS | `C:\Program Files\nodejs\node.exe`, 24.22.1 |
| pnpm | `%APPDATA%\npm\pnpm.cmd`, 11.19.0; user PATH configured |
| VS Code | Already present, 1.140.0; `%LOCALAPPDATA%\Programs\Microsoft VS Code\bin\code.cmd` |
| Cline | Installed official extension `saoudrizwan.claude-dev`, 4.1.25 |
| ESLint | Installed extension `dbaeumer.vscode-eslint`, 3.0.34 |

The Windows installers initially waited for elevation. Checksum-verified fallback
copies were also installed under `%LOCALAPPDATA%\Programs\nodejs\node-v24.22.1-win-x64`
and `%LOCALAPPDATA%\Programs\MinGit-2.55.0.5`. The standard installers subsequently
completed successfully. Fresh normal PATH resolves the standard Git and Node;
the fallback copies are optional backups and were not deleted. No system-wide
PowerShell execution policy was changed.

Both packages were installed using their existing frozen pnpm lockfiles. VS Code
recommendations/settings/tasks, root command aliases, `.node-version`, AGENTS.md,
`.clinerules` and `.clineignore` are included. Cline's provider keys and actual
approval toggles are configured inside its panel, not invented workspace settings.
See [AI development](AI_DEVELOPMENT.md) for free models and exact key fields.

## Commands

Run at repository root; `.cmd` is optional outside Windows PowerShell.

| Action | Command |
| --- | --- |
| Install both apps without changing lockfiles | `pnpm.cmd run setup:local` |
| Run arcade | `pnpm.cmd run dev:games` |
| Run portfolio | `pnpm.cmd dev` |
| Build arcade Worker asset bundle | `pnpm.cmd run build:games` |
| Build arcade + run 40 tests | `pnpm.cmd run test:games` |
| Run same test suite via root alias | `pnpm.cmd test` |
| Lint repository | `pnpm.cmd lint` |
| Build portfolio | `pnpm.cmd build` |
| Run all checks | `pnpm.cmd run check:all` |

There is no standalone portfolio unit-test suite and no arcade-specific lint
configuration; root lint is the existing ESLint command. Generated artifacts and
scratch copies currently contribute some existing lint warnings. Setup preserves
that behavior and does not change game logic to make checks pass.

If dependencies are completely absent, `pnpm.cmd run setup:local` still works:
its Node helper installs the root and `horse-game` packages separately. It does
not combine their lockfiles or create a new monorepo. Use Node 24 for both apps.
The arcade package permits >=22.13, but this repo/deployment uses 24.

## Clone onto another Windows PC

Do **not** clone over this existing folder. On another PC, install official tools
using PowerShell (accept Windows UAC for the official installers if requested):

```powershell
winget install --id Git.Git --exact --accept-package-agreements --accept-source-agreements
winget install --id OpenJS.NodeJS.LTS --exact --version 24.22.1 --accept-package-agreements --accept-source-agreements
winget install --id Microsoft.VisualStudioCode --exact --accept-package-agreements --accept-source-agreements
```

Reopen PowerShell, then:

```powershell
npm.cmd install --global --prefix "$env:APPDATA\npm" pnpm@11.19.0
$env:Path = "$env:APPDATA\npm;$env:Path"
git clone --branch codex/hoof-game https://github.com/clement55688/clement-portfolio.git clement-games
Set-Location clement-games
pnpm.cmd run setup:local
code.cmd --install-extension saoudrizwan.claude-dev
code.cmd --install-extension dbaeumer.vscode-eslint
code.cmd .
pnpm.cmd run dev:games
```

Ensure `%APPDATA%\npm` is in your user PATH for future terminals. Windows npm
normally adds it; if not, add that directory with **Edit environment variables for
your account > Path > New**. Node 24.22.1 is the verified version; if Winget no
longer offers that patch, install the current **24.x** LTS from
[Node.js downloads](https://nodejs.org/en/download), rather than silently switching
the project to a different major.

The GitHub branch `codex/hoof-game` contains the current arcade work. Cloning
`main` may give an older portfolio-only state. Clones include committed history;
the pre-existing untracked cat artwork on this PC does **not** travel until you
review and commit it yourself. On macOS, install Git, VS Code, Node 24 and pnpm
11.19.0, then use the same clone/setup commands with `pnpm` instead of `pnpm.cmd`.

## Pull and commit safely

The existing remote remains `https://github.com/clement55688/clement-portfolio.git`.
Before pulling, inspect `git status --short` and review/commit your intended work.
Do not pull over unsaved edits, reset, or discard the untracked cat assets. When
the working tree is ready, `git pull --ff-only origin codex/hoof-game` updates this
branch without creating a merge or rewriting history. If it fails due to local
work/divergence, stop and review; do not force-reset.

For a focused feature, create a branch such as `git switch -c feature/cat-ui`.
Use Cline Plan, review its file list, switch to Act and approve individual edits.
Run the relevant check and inspect the VS Code Source Control diff. Stage only
intended files. Example for a later Catvolution CSS-only task:

```powershell
git status --short
git diff -- clement-arcade/dist/catvolution/style.css
git add -- clement-arcade/dist/catvolution/style.css
git diff --cached
git commit -m "Improve Catvolution tile layout"
git push -u origin HEAD
```

Verify the actual filename first; the example is not an instruction to stage
unrelated work. Sign in to GitHub through Git Credential Manager's browser prompt
when needed. Do not embed a PAT in the remote URL. A feature branch does not
publish the production Worker; review/merge it into the configured production
branch when ready. Pushing arcade changes to `codex/hoof-game` triggers the existing
Cloudflare pipeline. Confirm your current branch before pushing.

## Environment and deployment

Arcade requires **no API key** locally. It creates ignored
`clement-arcade/.local/scores.sqlite` and applies existing migrations there. Local
scores/rooms are separate from production D1. Keep this file to retain local data.
`PORT` overrides 4173 if necessary. Do not run remote migrations for local setup.

The portfolio runs without Redis credentials using its existing in-memory data
fallback. To configure persistence later, copy `.env.example` to `.env.local` and
fill `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` yourself. Use
`NEXT_PUBLIC_SITE_URL` for canonical metadata; `NEXT_PUBLIC_BUILD_TIME` is optional.
`VERCEL_*` values are platform-provided. No MapLibre/OpenFreeMap API key is needed.
No existing environment file was overwritten, and no secrets were added to Git.

Deployment wiring is preserved:

- Portfolio: existing Vercel Git integration; root Next.js package.
- Arcade: existing **Cloudflare Workers Builds**, repository branch
  `codex/hoof-game`, root `clement-arcade`, build `npm run check`, deploy
  `npm run deploy:cloudflare`, watch `clement-arcade/**`. Its deploy script applies
  **remote** D1 migrations and publishes the Worker. Use only as an explicit deploy.
- Worker: `hoof-game`; live https://hoof-game.a2040404.workers.dev/;
  config `clement-arcade/wrangler.jsonc`; production D1 `hoof-leaderboard`.
- GitHub Actions `.github/workflows/hoof-pages.yml` checks the arcade; publishing
  is handled by Cloudflare, not that workflow. Historical Sites files are retained.

Nothing was pushed or deployed during this local-tooling handoff. Moving editors
does not change the live URL or require changing GitHub/Cloudflare/Vercel accounts.

## Verification and remaining actions

Before setup: portfolio build passed; arcade build + **40/40 tests** passed;
ESLint had **0 errors / 12 warnings**. After setup: combined lint/build/tests passed,
with the same 12 existing warnings. HTTP startup checks returned 200 for the
portfolio home, arcade home, all six game pages, and local leaderboard API.
This is startup/automated verification, not a full manual gameplay regression.

Still manual:

1. Reopen VS Code to refresh PATH; open this folder and use the run tasks.
2. Create a free Google AI Studio key (optional OpenRouter/Groq fallbacks) and
   paste it into Cline's provider field. Keep billing/top-up disabled.
3. Check Cline's approval toggles and checkpoints as described in AI_DEVELOPMENT.md.
4. Run its harmless one-file AI smoke test after adding a key; no credentialed AI
   test has run yet. No key should be sent to this conversation.
5. Review this setup diff and commit only these new configs/docs/scripts if desired.
   Pre-existing untracked artwork, `tmp/`, and `work/` remain intact and unstaged.

No additional paid account, Cloudflare token, Vercel token, Codex access, or second
AI agent is required for local development.
