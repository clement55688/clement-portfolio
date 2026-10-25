# Develop with Cline, using a small free quota

Provider availability checked **2026-10-23**. These are API free tiers, not unlimited
subscriptions. Cline is installed locally; authentication and an actual model call
remain manual until you supply a key in the extension. No paid provider or top-up
has been enabled. OpenCode is not installed: a second agent adds no needed capability.

## Choose a provider

| Order | Cline provider / exact model ID | Why / limits |
| --- | --- | --- |
| Primary | Google Gemini / `gemini-3.8-flash` | Stable, coding/agent-oriented, native function calling, 1,048,576 input context. Standard API input/output are free on eligible free projects. RPM/TPM/RPD are project-specific; check AI Studio. Keep tasks small despite the large context. |
| Fallback 1 | OpenRouter / `cohere/north-mini-code:free` | Coding model with JSON-schema tools, 256K context. Verified in the live catalog with `tools` and zero input/output pricing. No-credit accounts: 20 requests/minute, 50/day shared across free models. Capacity can vary. Text-only: describe UI issues or use Gemini for screenshots. |
| Fallback 2 | Groq / `openai/gpt-oss-120b` | Officially recommended for Cline by Groq. Published free limits: 30 requests/minute, 1,000/day, 8,000 tokens/minute, 200,000/day; organization limits may differ. The 8K TPM cap can reject Cline's system prompt plus context before any edit. Use only very small text tasks; if even a fresh task fails, switch provider rather than repeatedly retrying or upgrading. |

This ranking is a practical recommendation based on documented capabilities, not
a credentialed end-to-end benchmark. A tool-capable model can request file edits;
Cline executes the edit locally after your approval. Free chat, image, guardrail,
and audio models are not automatically suitable coding agents. An old OpenRouter
GPT-OSS free model page still exists, but its ID was absent from the live catalog;
the recommendation above uses the verified available coding model instead.

## Keys and exact Cline fields

1. Open this repository in VS Code. Click **Cline** in the activity bar (or run
   **Cline: Open Walkthrough** from Ctrl+Shift+P), then click its settings gear.
   Choose **Bring Your Own Key / API Provider**, rather than Cline usage billing.
2. Primary: select **Google Gemini**, paste the key from
   [Google AI Studio keys](https://aistudio.google.com/apikey) into **Gemini API Key**,
   then choose `gemini-3.8-flash`. Use a project showing **Free** billing tier;
   do not link a billing account. If a personal/project restriction blocks access,
   use a fallback instead of enabling billing.
3. OpenRouter: create an account/key at [OpenRouter keys](https://openrouter.ai/settings/keys).
   Select **OpenRouter**, paste into **OpenRouter API Key**, refresh/search models,
   and choose exactly `cohere/north-mini-code:free`. Leave custom base URL off.
   Keep credit balance/top-up off; do not use `auto`, a paid variant, or paid fallbacks.
4. Groq: create a free account/key at [Groq keys](https://console.groq.com/keys).
   Select **Groq**, paste into **Groq API Key**, and select `openai/gpt-oss-120b`.
   Keep the account on Free and consult its Limits page before an agent task.
5. If **Use different models for Plan and Act** is enabled, select the same free
   provider/model for **both** modes, or disable separate models. Check the
   provider/model shown before sending each task.

Paste keys only in these Cline fields. Do not put them in `.env`, prompts, chat,
`settings.json`, scripts, or Git. Local app environment variables and Cline keys
are separate. Provider requests send selected code/context to that provider;
Google states free-tier content may be used to improve its products.

Only Google is needed to start; the other two accounts/keys are optional fallbacks.
GitHub access is needed only for private clones/pushes; use Git's browser sign-in,
not a token pasted into a remote URL. No Cloudflare or Vercel key is needed locally.

## Review and permissions

Cline 4.1.25 declares no VS Code `configuration` properties for approval settings.
Do not invent `cline.*` keys in workspace settings or edit Cline's private state DB.
The repository includes `.clinerules/01-project.md` as conservative behavioral
guidance; actual permission toggles must be checked in the Cline panel once:

- Leave **Auto Approve** disabled. If you later enable it, permit only **Read project
  files**; keep edits, outside-workspace reads/edits, safe/all commands, browser,
  MCP, and mode transitions manual. Keep **YOLO Mode** off.
- Enable **Checkpoints** in Cline settings, where available, and use Git diffs as
  the source of truth. Do not restore an entire checkpoint over pre-existing assets.
- Start with **Plan**, inspect its proposed file list, then switch to **Act**.
  Approve individual edits and commands after reviewing them.
- Never auto-approve deployment, remote migrations, push, dependency changes,
  deletion, account changes, or billing. A rule file is not a sandbox.

## Publish the arcade through GitHub

Cloudflare Workers Builds already deploys `arcade/hoof-game` when files under
`clement-arcade/` are pushed. Cline does not need a Cloudflare API token for this
route; Cloudflare manages its own deployment credential. A custom
`CLOUDFLARE_API_TOKEN` with `Workers Scripts: Read` cannot publish a Worker and
is unnecessary for Git-triggered deployment.

For a deployment request, have Cline inspect the current branch, working tree,
and exact diff; run `npm run check` from `clement-arcade`; then show the proposed
commit and push to `origin/arcade/hoof-game` for your review. A push to that
production branch starts the Cloudflare build. Approve the push explicitly in
Cline after reviewing it, then check the result in Cloudflare Workers Builds.
Do not run `npm run deploy:cloudflare` locally: it applies remote D1 migrations
before publishing. Keep Cline's command approval on, and never paste a
Cloudflare token into a prompt or commit it.

Reusable deployment prompt:

> Deploy my reviewed arcade changes using the existing GitHub-to-Cloudflare
> Workers Builds pipeline. First inspect `git status`, the current branch, and
> the full diff. Run `npm run check` from `clement-arcade`. Report the changed
> files, check result, and exact commit/push plan. Do not edit files, run local
> Cloudflare deploy/migration commands, or push until I approve the plan. After
> I approve, push only the intended arcade changes to `origin/arcade/hoof-game`
> and report the Cloudflare build result. Do not request or read a Cloudflare
> API token.

No Cline API request or file-edit AI test was made during setup: no credentials
were supplied. After adding a key, run this harmless end-to-end test in Act mode:

> Read only AGENTS.md and docs/AI_DEVELOPMENT.md. Create docs/ai-smoke-check.md
> containing “Local Cline file editing works.” Read that file back with the file
> tool and report git status --short. Do not edit any other file, install anything,
> commit, push, or deploy.

Approve the file creation, inspect it in VS Code, then delete only that temporary
file through the editor when finished. A successful chat response alone does not
verify tool calling or file edits.

## When quota runs out

Stop the task on a 429; respect the provider's retry/reset time. Make a short
handoff note (file paths, change made, remaining issue, last check). Open Cline
settings, select another provider, enter its key, pick its exact free model, and
check **both Plan and Act** selections. Start a fresh task with that note plus the
relevant files. Provider switching does not transfer quota; old chat history can
still exceed the next provider's limits. Do not enable billing to continue.

## Keep context small

Use one game and one outcome per task. Attach 1–3 relevant files rather than the
entire repository. Set a 3-file budget for routine changes, ask before expanding,
and request a brief answer. Save a screenshot only when it explains a visual issue.
Avoid repeated full builds: arcade work uses its build/tests; portfolio work uses
lint/build. One final combined check is enough for changes touching both.

`.clineignore` excludes dependencies, generated server output, local data, secrets,
lockfiles and scratch copies. It deliberately retains `clement-arcade/dist` source
and game artwork. Read a specific asset only when needed. Cline's docs mark this
ignore mechanism for future deprecation; verify its behavior after extension
upgrades. It is a context filter, not a guarantee that terminal commands cannot
read a file. The lockfiles remain versioned and are used by pnpm installs.

Checkpoint recipe: review existing `git status`, make one scoped change, run its
check, inspect diff, and commit only intended files. Start a new task once the
outcome is complete; carry a short note instead of the whole conversation.

## Reusable prompts

**Add a game**

> Read AGENTS.md. Add [game] to the existing arcade using its plain JS/CSS pattern.
> First inspect the landing registration and one comparable game. Preserve all
> existing routes and assets. Propose the smallest file list and acceptance
> checks. Implement only after the plan is reviewed. Run pnpm run test:games.
> Do not add a framework, dependencies, deploy, or push.

**Debug**

> In [game/path], [steps] produce [actual], expected [expected]. Inspect only
> [files] and relevant tests first. Find the cause, make the smallest fix, and run
> the relevant check. Preserve unrelated physics/scoring. Stop if you need more
> than 3 files and explain why. Summarize the diff and check result briefly.

**UI change**

> Update only [game/path] to [specific visual outcome]. Keep controls, physics,
> scoring, routes and assets working. Inspect its HTML/CSS/JS. Verify 390px mobile
> and desktop layout, touch and keyboard interaction. Avoid reformatting unrelated
> files. Run pnpm run test:games. Show changed files and any visual check limits.

**Refactor**

> Refactor [function/file] for [one reason], preserving behavior and exports.
> Read its callers and tests, propose a small diff, then implement and run the
> relevant tests. Do not upgrade dependencies or refactor other games.

**Portfolio task**

> Read AGENTS.md and relevant installed Next.js docs. Change [specific route or
> component] only. Preserve arcade files and deployment settings. Run pnpm lint
> and pnpm build; report existing warnings separately.

## Official references (checked 2026-10-23)

- [Cline installation](https://docs.cline.bot/getting-started/installing-cline)
- [Gemini in Cline](https://docs.cline.bot/provider-config/google-gemini)
- [Gemini 3.8 capabilities](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)
- [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) and
  [project rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [OpenRouter in Cline](https://docs.cline.bot/provider-config/openrouter)
- [North Mini Code free](https://openrouter.ai/cohere/north-mini-code:free),
  [live model catalog](https://openrouter.ai/api/v1/models),
  [OpenRouter limits](https://openrouter.ai/docs/api_reference/limits)
- [Groq's Cline integration/model recommendation](https://console.groq.com/docs/coding-with-groq/cline)
  and [Groq quotas](https://console.groq.com/docs/rate-limits)
- [Cline Auto Approve](https://docs.cline.bot/features/auto-approve)
